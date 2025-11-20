// app/api/rewrite/route.jsx
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Increase timeout for Pro/Enterprise plans (60s for Pro, 300s for Enterprise)
// For Hobby plan, streaming is required to avoid 10s timeout
export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.json();
    const { resumeURL, jobDesc } = body;

    if (!resumeURL || !jobDesc) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: "Missing resumeURL or jobDesc" })),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1) Load resume PDF → plain text
    const pdfBlob = await fetch(resumeURL).then((r) => r.blob());
    const loader = new WebPDFLoader(pdfBlob);
    const docs = await loader.load();
    const resumeText = docs.map((d) => d.pageContent).join("\n\n");

    // 2) GPT-5-mini model with streaming enabled
    const llm = new ChatOpenAI({
      model: "gpt-5-mini",
      streaming: true,
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

    // Create a streaming response
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
            const content = chunk.content || "";
            fullContent += content;

            // Send each chunk to client
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`)
            );
          }

          // Parse and validate the complete JSON
          let jsonResume;
          try {
            jsonResume = JSON.parse(fullContent);

            // Send final complete JSON
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ jsonResume, done: true })}\n\n`)
            );
          } catch (e) {
            console.error("Failed to parse JSON from GPT-5 content:", fullContent);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: "LLM did not return valid JSON",
                  raw: fullContent
                })}\n\n`
              )
            );
          }

          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err.message || "Internal error" })}\n\n`
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
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("rewrite error:", err);
    const encoder = new TextEncoder();
    return new Response(
      encoder.encode(JSON.stringify({ error: err.message || "Internal error" })),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
