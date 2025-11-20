"use client";

import React, { useState } from "react";
import Dropzone from "react-dropzone";

import PageHeader from "./components/PageHeader";
import ThreeColumnLayout from "./components/ThreeColumnLayout";
import LargeInput from "./components/LargeInput";
import ResultWithSources from "./components/ResultWithSources";
import ResumePreview from "./components/ResumePreview";
import ButtonContainer from "./components/ButtonContainer";

export const maxDuration = 60;

export default function Home() {
  const [file, setFile] = useState(null);           // Resume File
  const [jobDesc, setJobDesc] = useState("");       // Job description text
  const [messages, setMessages] = useState([
    { text: "Output will be shown here", type: "bot" },
  ]);
  const [jsonResume, setJsonResume] = useState(null);
  const [error, setError] = useState(null);         // Error message
  const [status, setStatus] = useState("idle");     // "idle" | "uploading" | "rewriting"

  // 1. Update job description text
  const handlePromptChange = (e) => {
    setJobDesc(e.target.value);
  };

  // 2. Handle resume selection from Dropzone
  const handleDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setFile(acceptedFiles[0]);
    setError(null);
  };

  // 3. Run "Upload → Rewrite"
  const handleRun = async () => {
    if (!file) {
      setError("Please upload your resume PDF first.");
      return;
    }

    if (!jobDesc.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setError(null);
    setStatus("uploading");

    try {
      // ---- UPLOAD RESUME ----
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload resume.");
      }

      const uploadData = await uploadRes.json();
      const resumeURL = uploadData.resumeURL;

      // ---- REWRITE RESUME WITH STREAMING ----
      setStatus("rewriting");

      const rewriteRes = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeURL, jobDesc }),
      });

      if (!rewriteRes.ok) {
        throw new Error("Failed to rewrite resume.");
      }

      // Handle streaming response
      const reader = rewriteRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process all complete SSE messages in buffer
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.done && data.jsonResume) {
                // Final complete JSON received
                setJsonResume(data.jsonResume);
                setMessages((prev) => [
                  ...prev,
                  { text: "Resume updated for this job.", type: "bot" },
                ]);
              }
              // You can optionally show chunks as they arrive for progress indication
              // if (data.chunk) { ... }
            } catch (e) {
              console.error("Failed to parse SSE message:", e);
            }
          }
        }
      }

      setStatus("idle");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setStatus("idle");
    }
  };

  // Button label changes with status
  const buttonLabel =
    status === "uploading"
      ? "Uploading…"
      : status === "rewriting"
      ? "Rewriting…"
      : "Tailor My Resume";

  return (
    <div className="flex justify-center flex-col mx-auto">
      <ThreeColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="Resume + Job Description = Success"
              boldText="Upload your resume and job description. Tailored AI will generate a customized resume optimized for the job."
              description="Powered by PDF parsing and LLM rewriting—no Pinecone, no embeddings, no complexity."
            />

            <ButtonContainer>
              <Dropzone
                onDrop={handleDrop}
                accept={{ "application/pdf": [] }}
                multiple={false}
              >
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div
                      {...getRootProps()}
                      className="p-4 border border-gray-400 rounded cursor-pointer hover:bg-gray-100"
                    >
                      <input {...getInputProps()} />
                      <p className="text-sm text-gray-600">
                        {file ? (
                          <>
                            Selected file: <strong>{file.name}</strong>
                          </>
                        ) : (
                          <>Drag & drop your resume PDF here, or click to select</>
                        )}
                      </p>
                    </div>
                  </section>
                )}
              </Dropzone>
            </ButtonContainer>
          </>
        }
        centerChildren={
          <>
            <LargeInput
              prompt={jobDesc}
              handlePromptChange={handlePromptChange}
              handleSubmit={handleRun}
              placeHolderText="Copy and paste your job description here"
              buttonText={buttonLabel}
              disableButton={status !== "idle"}
              error={error}
              labelText="Step 2 — Paste job description:"
            />
          </>
        }
        rightChildren={
          <>
            <ResumePreview jsonResume={jsonResume} />
          </>
        }
      />
    </div>
  );
}
