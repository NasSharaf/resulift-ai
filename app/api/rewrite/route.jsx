// app/api/rewrite/route.jsx

import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { calculateATSScore } from "@/app/utils/atsScoring";
import { z } from "zod";

export const maxDuration = 60;

/**
 * Helper: URL field that tolerates:
 * - valid URLs
 * - empty string
 * - null
 * - undefined (since it's optional)
 */
const SoftUrlSchema = z
  .union([z.string().url(), z.literal(""), z.null()])
  .optional();

/**
 * Basics schema (JSON Resume-ish), but soft & passthrough.
 */
const JSONResumeBasicsSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
  website: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    countryCode: z.string().optional(),
    postalCode: z.string().optional()
  }).optional()
}).passthrough();

/**
 * Work schema, again soft and .passthrough() to avoid breaking on extra keys.
 */
const JSONResumeWorkSchema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional()
}).passthrough();

/**
 * ATS score schema.
 */
const ATSScoreSchema = z.object({
  totalScore: z.number().min(0).max(100),
  breakdown: z.object({
    keywordMatch: z.number().min(0).max(100),
    skillsCoverage: z.number().min(0).max(100),
    titleAlignment: z.number().min(0).max(100),
    seniorityMatch: z.number().min(0).max(100),
    recency: z.number().min(0).max(100)
  }),
  recommendations: z.array(z.string())
});

const SkillsGroupedSchema = z.object({
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  devops: z.array(z.string()).optional(),
  cloud: z.array(z.string()).optional(),
  data_ml: z.array(z.string()).optional(),
  architecture: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  softskills: z.array(z.string()).optional(),
  other: z.array(z.string()).optional()
}).passthrough();

const JSONResumeEducationSchema = z.object({
  institution: z.string().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional()
}).passthrough();

const JSONResumeProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  technologies: z.string().optional()
}).passthrough();

const JSONResumePublicationSchema = z.object({
  citation: z.string().optional()
}).passthrough();

const CertificationSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional()
}).passthrough();

/**
 * Root resume + ATS schema.
 * Everything else is optional & we .passthrough() so extra fields don't blow us up.
 */
const ResumeWithATSSchema = z.object({
  atsScore: ATSScoreSchema,
  atsScore_rewrite: ATSScoreSchema.optional(),

  basics: JSONResumeBasicsSchema.optional(),
  work: z.array(JSONResumeWorkSchema).optional(),

  skills: SkillsGroupedSchema.optional(),
  education: z.array(JSONResumeEducationSchema).optional(),
  projects: z.array(JSONResumeProjectSchema).optional(),
  publications: z.array(JSONResumePublicationSchema).optional(),
  certifications: z.array(CertificationSchema).optional()
}).passthrough();

/**
 * System prompt: force pure JSON, no markdown, no text.
 */
const SYSTEM_PROMPT = `
You are an expert resume writer and ATS optimization specialist.

Given a RESUME (plain text) and a JOB DESCRIPTION, you will:

1) Compute a realistic ATS-style score for the ORIGINAL resume in a JSON object called "atsScore".
2) Rewrite the resume to better match the job description (but do NOT fabricate employers, dates, or degrees).
3) Compute a realistic ATS-style score for the REWRITTEN resume in a JSON object called "atsScore_rewrite".
4) Return ONLY a single valid JSON object, with the EXACT structure and field names defined below.

IMPORTANT:
- Output ONLY JSON. No markdown. No commentary. No prose.
- All returned keys MUST match exactly (case-sensitive).
- If you lack data, use "" (empty string) or omit the field/section entirely.
- Skills MUST use the grouped skills object defined below (NOT an array).
- Publications MUST use a single "citation" string per entry.
- Projects MUST use "description" (NOT "summary" or "details").

Return ONLY the following JSON structure:

{{
  "atsScore": {{
    "totalScore": number,
    "breakdown": {{
      "keywordMatch": number,
      "skillsCoverage": number,
      "titleAlignment": number,
      "seniorityMatch": number,
      "recency": number
    }},
    "recommendations": string[]
  }},

  "atsScore_rewrite": {{
    "totalScore": number,
    "breakdown": {{
      "keywordMatch": number,
      "skillsCoverage": number,
      "titleAlignment": number,
      "seniorityMatch": number,
      "recency": number
    }},
    "recommendations": string[]
  }},

  "basics": {{
    "name": "",
    "label": "",
    "email": "",
    "phone": "",
    "summary": "",
    "website": "",
    "location": {{
      "address": "",
      "city": "",
      "region": "",
      "country": "",
      "countryCode": "",
      "postalCode": ""
    }}
  }},

  "work": [
    {{
      "company": "",
      "position": "",
      "url": "",
      "startDate": "",
      "endDate": "",
      "summary": "",
      "highlights": []
    }}
  ],

  "skills": {{
    "languages": [],
    "frameworks": [],
    "devops": [],
    "cloud": [],
    "data_ml": [],
    "architecture": [],
    "tools": [],
    "softskills": [],
    "other": []
  }},

  "education": [
    {{
      "institution": "",
      "area": "",
      "studyType": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }}
  ],

  "projects": [
    {{
      "name": "",
      "description": "",
      "technologies": ""
    }}
  ],

  "publications": [
    {{
      "citation": ""
    }}
  ],

  "certifications": [
    {{
      "name": "",
      "date": ""
    }}
  ]
}}

RULES:
- Only return keys listed above.
- Sections may be omitted if there is no data (e.g., publications, certifications).
- Skills MUST be returned as the grouped object shown above.
- Do NOT add, rename, or restructure fields.
- Do NOT wrap the JSON in backticks or code fences.
`;

/**
 * Flatten a JSON-resume-like object into a text blob for ATS scoring.
 * This doesn't need to be perfect; it's just to feed your lightweight ATS scorer.
 */
function resumeJsonToText(resumeJson) {
  if (!resumeJson || typeof resumeJson !== "object") return "";

  const parts = [];

  if (resumeJson.basics) {
    const b = resumeJson.basics;
    parts.push(
      b.name,
      b.label,
      b.summary,
      b.email,
      b.phone,
      b.url,
      b.location?.address,
      b.location?.city,
      b.location?.region,
      b.location?.countryCode
    );
    if (Array.isArray(b.profiles)) {
      for (const p of b.profiles) {
        parts.push(p.network, p.username, p.url);
      }
    }
  }

  if (Array.isArray(resumeJson.work)) {
    for (const w of resumeJson.work) {
      parts.push(
        w.name,
        w.position,
        w.summary,
        w.url,
        w.startDate,
        w.endDate
      );
      if (Array.isArray(w.highlights)) {
        parts.push(...w.highlights);
      }
    }
  }

  if (Array.isArray(resumeJson.skills)) {
    for (const s of resumeJson.skills) {
      parts.push(s.name, s.level);
      if (Array.isArray(s.keywords)) {
        parts.push(...s.keywords);
      }
    }
  }

  if (Array.isArray(resumeJson.education)) {
    for (const e of resumeJson.education) {
      parts.push(
        e.institution,
        e.area,
        e.studyType,
        e.startDate,
        e.endDate,
        e.score,
        e.gpa
      );
    }
  }

  return parts
    .filter((x) => typeof x === "string" && x.trim().length > 0)
    .join("\n");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { resumeURL, jobDesc } = body;

    if (!resumeURL || !jobDesc) {
      return new Response(
        JSON.stringify({ error: "Missing resumeURL or jobDesc" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1) Load resume PDF → plain text
    const pdfBlob = await fetch(resumeURL).then((r) => r.blob());
    const loader = new WebPDFLoader(pdfBlob);
    const docs = await loader.load();
    const resumeText = docs.map((d) => d.pageContent).join("\n\n");

    // 2) LLM with streaming (no structured parser in the chain — we do soft validation after)
    const llm = new ChatOpenAI({
      model: "gpt-5-mini",
      streaming: true,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      ["user", "RESUME:\n{resume}\n\nJOB DESCRIPTION:\n{job}"],
    ]);

    const chain = prompt.pipe(llm);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";

        try {
          const streamResponse = await chain.stream({
            resume: resumeText,
            job: jobDesc,
          });

          for await (const chunk of streamResponse) {
            const content = chunk?.content ?? "";
            fullContent += content;

            // Push incremental chunks to client
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ chunk: content })}\n\n`
              )
            );
          }

          // Try to clean and parse the final JSON
          let jsonResume = null;
          let validationErrors = null;

          try {
            const cleanedContent = fullContent
              .replace(/```json/gi, "")
              .replace(/```/g, "")
              .trim();

            jsonResume = JSON.parse(cleanedContent);

            const result = ResumeWithATSSchema.safeParse(jsonResume);

            if (!result.success) {
              console.error(
                "Zod soft validation issues:",
                result.error.issues
              );
              validationErrors = result.error.issues;
            } else {
              jsonResume = result.data; // lightly validated / coerced
            }
          } catch (e) {
            console.error(
              "Failed to parse JSON from LLM content:",
              fullContent
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: "LLM did not return valid JSON",
                  raw: fullContent,
                })}\n\n`
              )
            );
            controller.close();
            return;
          }

          // Send final payload (soft validation: always send something)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                jsonResume,
                validationErrors,
                done: true,
              })}\n\n`
            )
          );

          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: err.message || "Internal error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("rewrite error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
