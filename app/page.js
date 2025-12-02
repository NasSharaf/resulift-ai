"use client";

import React, { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import ResumeDropzone from "./components/ResumeDropzone";
import ThreeColumnLayout from "./components/ThreeColumnLayout";
import LargeInput from "./components/LargeInput";
import ResumePreview from "./components/ResumePreview";
import ButtonContainer from "./components/ButtonContainer";
import ATSScoreBar from "./components/AtsScoreBar";
import ATSModal from "./components/AtsModal";
import Spinner from "./components/Spinner";
import { generateThemedHTML, downloadPDF, downloadWord } from "./components/downloadUtils";


export const maxDuration = 60;

export default function Home() {
  const [file, setFile] = useState(null);           // Resume File
  const [savedResumes, setSavedResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [jobDesc, setJobDesc] = useState("");       // Job description text
  const [messages, setMessages] = useState([
    { text: "Step 3 - Your custom resume will be available here. Please allow up to one minute to generate", type: "bot" },
  ]);
  const [jsonResume, setJsonResume] = useState(null);
  const [error, setError] = useState(null);         // Error message
  const [status, setStatus] = useState("idle");     // "idle" | "uploading" | "rewriting"
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState("even");
  const [themedHTML, setThemedHTML] = useState(null);

  // Preview Resume template
  useEffect(() => {
    if (!jsonResume) return;

    async function loadTheme() {
      const html = await generateThemedHTML(jsonResume, theme);
      setThemedHTML(html);
    }
    loadTheme();
  }, [jsonResume, theme]);

  // Fetch saved resumes on component mount
  useEffect(() => {
    const fetchSavedResumes = async () => {
      try {
        const response = await fetch("/api/fetch-resume", {
          method: "GET",
          credentials: "include" 
        });
        const data = await response.json();
        
        if (data.success) {
          setSavedResumes(data.resumes);
        }
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
      }
    };

    fetchSavedResumes();
  }, []);

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

  // Handle resume selection from dropdown
  const handleResumeSelect = (e) => {
    const selectedId = e.target.value;
    setSelectedResumeId(selectedId);
    
    // Find the selected resume
    const resume = savedResumes.find(r => r.id === selectedId);
    if (resume) {
      // Optional: You might want to prefetch the PDF or set the blob URL
      setFile({
        name: resume.title,
        blobUrl: resume.blobUrl
      });
    }
  };

  // 3. Run "Upload → Rewrite"
  const handleRun = async () => {
    if (!file && !selectedResumeId) {
      setError("Please upload a new resume or select an existing one.");
      return;
    }

    if (!jobDesc.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setError(null);
    setStatus("uploading");

    try {
      // Ensure file is a File object for new uploads
      const uploadBody = file instanceof File
        ? (() => {
            const formData = new FormData();
            formData.append("file", file);
            return formData;
          })()
        : JSON.stringify({ resumeId: selectedResumeId });

      const uploadHeaders = file instanceof File 
        ? {} 
        : { "Content-Type": "application/json" };

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadBody,
        headers: uploadHeaders,
        credentials: "include",
      });

      if (!uploadRes.ok) {
        // Try to parse error response
        const errorData = await uploadRes.json().catch(() => ({}));
        console.error("Upload Error Details:", errorData);
        throw new Error(errorData.details || "Failed to upload resume.");
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

      // STREAMING REWRITE HANDLER (unchanged)
      const reader = rewriteRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) throw new Error(data.error);

              if (data.done && data.jsonResume) {
                console.log(data);
                setJsonResume(data.jsonResume);
                setMessages((prev) => [
                  ...prev,
                  { text: "Resume updated for this job.", type: "bot" },
                ]);
              }
            } catch (e) {
              console.error("Failed to parse SSE message:", e);
            }
          }
        }
      }

      // After successful rewrite, save job description
      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: jobDesc }),
      });

      if (!jobRes.ok) {
        throw new Error("Failed to save job description");
      }

      const jobData = await jobRes.json();
      const jobId = jobData.jobId;

      // Save tailored resume
      const tailoredResumeRes = await fetch("/api/tailored-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumeId: uploadData.resumeId,
          jobId: jobId,
          tailoredText: JSON.stringify(jsonResume)
        }),
      });

      if (!tailoredResumeRes.ok) {
        throw new Error("Failed to save tailored resume");
      }

      setStatus("idle");
    } catch (e) {
      console.error("Full Upload Error:", e);
      setError(e.message || "Something went wrong.");
      setStatus("idle");
    }
  };

  const handleDownloadPDF = async () => {
    const html = await generateThemedHTML(jsonResume, theme);
    await downloadPDF(html);
  };

  const handleDownloadWord = async () => {
    const html = await generateThemedHTML(jsonResume, theme);
    await downloadWord(html);
  };

  const originalScore = jsonResume?.atsScore?.totalScore;
  const rewrittenScore = jsonResume?.atsScore_rewrite?.totalScore;

  const originalBreakdown = jsonResume?.atsScore?.breakdown;
  const rewrittenBreakdown = jsonResume?.atsScore_rewrite?.breakdown;

  const originalRecs = jsonResume?.atsScore?.recommendations ?? [];
  const rewrittenRecs = jsonResume?.atsScore_rewrite?.recommendations ?? [];

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
          <div className="flex flex-col h-full">

            {/* STEP 1 HEADER */}
            <div className="mb-4">
              <p className="font-bold text-md">Step 1 - Upload or Select your resume</p>
            </div>

            {/* DROPDOWN */}
            {savedResumes.length > 0 && (
              <div className="mb-4">
                <label
                  htmlFor="resume-select"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select an existing resume
                </label>

                <select
                  id="resume-select"
                  value={selectedResumeId || ''}
                  onChange={handleResumeSelect}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                    sm:text-sm rounded-md"
                >
                  <option value="">Choose a resume</option>
                  {savedResumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} (Uploaded: {new Date(resume.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* DROPZONE EXPANDS TO FILL COLUMN */}
            <div className="flex-1">
              <Dropzone
                onDrop={handleDrop}
                accept={{ "application/pdf": [] }}
                multiple={false}
              >
                {({ getRootProps, getInputProps }) => (
                  <ResumeDropzone
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    file={file}
                  />
                )}
              </Dropzone>
            </div>

          </div>
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
              labelText="Step 2 — Paste job description"
            />
          </>
        }
        rightChildren={
          <div className="flex flex-col h-full">
            <div>
              <div>
                <p className="font-bold text-md mb-2">Step 3 - Download your tailored resume</p>
                  {/* ATS SCORE BAR SHOULD BE HERE */}
                  {(jsonResume?.atsScore || jsonResume?.atsScore_rewrite) && (
                    <div className="mb-4"> {/* Added margin for visibility */}
                      <ATSScoreBar
                        original={originalScore}
                        rewritten={rewrittenScore}
                        onOpen={() => setShowModal(true)}
                      />
                    </div>
                  )}

                {status === "rewriting" && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Spinner />
                    <span>Generating your tailored resume… this may take up to 1 minute.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex overflow-y-auto">
              {jsonResume ? (
                <ResumePreview jsonResume={jsonResume} theme={theme} themedHTML={themedHTML} />
              ) : (
                <p className="text-gray-500 text-sm">
                  Your tailored resume will appear here.
                </p>
              )}
            </div>

            {jsonResume && (
              <div className="pt-4 flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800"
                >
                  Download PDF
                </button>
                <button
                  onClick={handleDownloadWord}
                  className="px-4 py-2 rounded-full bg-white border border-gray-400 text-xs font-semibold hover:bg-gray-100"
                >
                  Download Word
                </button>
                <div className="pb-3">
                  <label className="text-xs font-semibold">Select Template:</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md text-xs"
                  >
                    <option value="even">Even (Clean Minimal)</option>
                    <option value="paper">Paper</option>
                    <option value="onepage">OnePage</option>
                    <option value="elegant">Elegant</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        }
      />
      <ATSModal
        show={showModal}
        onClose={() => setShowModal(false)}
        original={originalScore}
        rewritten={rewrittenScore}
        originalBreakdown={originalBreakdown}
        rewrittenBreakdown={rewrittenBreakdown}
        originalRecs={originalRecs}
        rewrittenRecs={rewrittenRecs}
        validationErrors={jsonResume?.validationErrors}
      />
    </div>
  );
}
