// app/api/rewrite/route.jsx
import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function POST(req) {
  try {
    const body = await req.json();
    const { resumeURL, jobDesc } = body;

    if (!resumeURL || !jobDesc) {
      return NextResponse.json(
        { error: "Missing resumeURL or jobDesc" },
        { status: 400 }
      );
    }

    // 1) Load resume PDF → plain text
    const pdfBlob = await fetch(resumeURL).then((r) => r.blob());
    const loader = new WebPDFLoader(pdfBlob);
    const docs = await loader.load();
    const resumeText = docs.map((d) => d.pageContent).join("\n\n");

    // 2) GPT-5-mini model
    const llm = new ChatOpenAI({
      model: "gpt-5-mini"
    });

    const SYSTEM_PROMPT = `
You are an expert resume writer.

Rewrite the user's resume to best match the job description using the JSON Resume schema.

Rules:
- Return a single valid JSON object only.
- Do not add markdown, comments, or code fences.
- Do not invent jobs, companies, or degrees.
- You may reorganize, rewrite, and infer structure from the resume.
- Extract skills, tools, certifications, and projects from the resume when present.
- Omit fields only when truly absent in the original resume.
    `;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      ["user", "RESUME:\n{resume}\n\nJOB DESCRIPTION:\n{job}"],
    ]);

    const chain = prompt.pipe(llm);

    const result = await chain.invoke({
      resume: resumeText,
      job: jobDesc,
    });

    console.log("GPT-5 raw message:", result);

    const raw = Array.isArray(result.content)
      ? result.content.map((c) => c.text ?? c).join("")
      : result.content;

    let jsonResume;
    try {
      jsonResume = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
      console.error("Failed to parse JSON from GPT-5 content:", raw);
      return NextResponse.json(
        { error: "LLM did not return valid JSON", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ jsonResume }, { status: 200 });
  } catch (err) {
    console.error("rewrite error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
