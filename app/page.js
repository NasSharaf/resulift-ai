// // start here
// "use client";
// import Image from "next/image";
// import "./globals.css";
// import Gallery from "./components/Gallery";
// import { pressStart2P, sourceCodePro, instrumentSans } from "./styles/fonts";
// import Dropzone from "react-dropzone";
// import React, { useState, useEffect, FormEvent } from "react";
// import { NextPage } from "next";
// import PageHeader from "./components/PageHeader";
// import PromptBox from "./components/PromptBox";
// import Title from "./components/Title";
// import TwoColumnLayout from "./components/TwoColumnLayout";
// import ResultWithSources from "./components/ResultWithSources";
// import ButtonContainer from "./components/ButtonContainer";
// import Button from "./components/Button";
// import LargeInput from "./components/LargeInput";
// import ThreeColumnLayout from "./components/ThreeColumnLayout";
// import "./globals.css";
// import Results from "./components/Results";
// import { list } from '@vercel/blob';

// export default async function Home() {
//   const [firstMsg, setFirstMsg] = useState(true);
//   const [uploading, setUploading] = useState(""); 
//   const [file, setFile] = useState();
//   const [prompt, setPrompt] = useState("Copy and paste your job description here");
//   const [error, setError] = useState(null);
//   const [userID, setUserID] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       text: "Output will be shown here",
//       type: "bot",
//     },
//   ]);
//   const colorClass = "bg-white hover:bg-white";   // For tailwind CSS

//   const handlePromptChange = (e) => {
//     setPrompt(e.target.value);
//   };

//   const handleUserIDChange = (e) => {
//     setUserID(e.target.value)
//   };

//   const handleSubmitJobDesc = async () => {
//     try {
//       // Update the user message
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { text: prompt, type: "user", sourceDocuments: null },
//       ]);

//       const response = await fetch(`/api/rewrite`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ jobDesc: prompt, firstMsg, userID }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP Error! Status: ${response.status}`);
//       }

//       // So we don't reinitialize the chain
//       setPrompt("");
//       setFirstMsg(false);
//       const searchRes = await response.json();
//       console.log("Printing searchRes: ")
//       console.log(searchRes);
//       // Add the bot message
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { text: String(searchRes.output), type: "bot", sourceDocuments: null },
//       ]);
//       // Clear any old error messages
//       setError("");
//     } catch (err) {
//       console.error(err);
//       setError(err);
//     }
//   };

//   const onSubmitResume = async (e) => {
//     e.preventDefault()
//     if (!file) return

//     try {
//       const data = new FormData()
//       data.set('file', file)

//       const res = await fetch(`/api/upload`, {
//         method: 'POST',
//         body: data,
//       })
//       .catch(error => console.error(error))
//       // handle the error
//       if (!res.ok) throw new Error(await res.text())
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   return (
//     <>
//         <div className="flex justify-center flex-col mx-auto">
//           <ThreeColumnLayout
//           leftChildren={
//             <>
//               <PageHeader
//                   heading="Resume + Job Description = Success"
//                   boldText="Add your work history and a job description and Tailored AI will give you a custom resume tailored for the job! "
//                   description="This tool uses Document Loaders, OpenAI Embeddings, Summarization Chain, Pinecone, VectorDB QA Chain, Prompt Templates, and the Vector Store Agent"
//               />

              
//               <ButtonContainer>
//                   {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
//                   {({getRootProps, getInputProps}) => (
//                     <section>
//                       <div {...getRootProps()}>
//                         <input {...getInputProps()} />
//                         <p>Drag 'n' drop some files here, or click to select files</p>
//                       </div>
//                     </section>
//                   )}
//                   </Dropzone> */}
//                   <form onSubmit={onSubmitResume}>
//                     <input type="submit" value="Upload Resumes 📂" className={`py-2 px-6 mb-4 rounded-full border border-gray-500 shadow hover:shadow-lg ${colorClass}`} />
//                     <input type="file" name="file" onChange={(e) => setFile(e.target.files?.[0])} />
//                   </form>
//               </ButtonContainer>
//             </>
//           }
//           centerChildren={
//             <>
//               <LargeInput
//                   prompt={prompt}
//                   handlePromptChange={handlePromptChange}
//                   handleSubmit={handleSubmitJobDesc}
//                   placeHolderText={
//                   messages.length === 1
//                       ? "First upload your work history or resume"
//                       : "Now enter a link to a job description you want to apply to here"
//                   }
//                   error={error}
//                   userID={userID}
//                   handleUserIDChange={handleUserIDChange}
//                   labelText={"Step 2 - Select the resume you wish to use here: "}
//               />
//             </>
//           }
//           rightChildren={
//             <>
//               <ResultWithSources
//                 messages={messages}
//                 pngFile="wizard"
//                 maxMsgs={1}
//               />
//             </>
//           }
//           />
//         </div>
//     </>
//   );
// }

"use client";

import React, { useState } from "react";
import Dropzone from "react-dropzone";

import PageHeader from "./components/PageHeader";
import ThreeColumnLayout from "./components/ThreeColumnLayout";
import LargeInput from "./components/LargeInput";
import ResultWithSources from "./components/ResultWithSources";
import ResumePreview from "./components/ResumePreview";
import ButtonContainer from "./components/ButtonContainer";

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

      // ---- REWRITE RESUME ----
      setStatus("rewriting");

      const rewriteRes = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeURL, jobDesc }),
      });

      if (!rewriteRes.ok) {
        throw new Error("Failed to rewrite resume.");
      }

      const rewriteData = await rewriteRes.json();

      // Add rewritten resume to right column
      setJsonResume(rewriteData.jsonResume);
      
      setMessages((prev) => [
        ...prev,
        { text: "Resume updated for this job.", type: "bot" },
      ]);

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
