// start here
"use client";
import Image from "next/image";
import "./globals.css";
import Gallery from "./components/Gallery";
import { pressStart2P, sourceCodePro, instrumentSans } from "./styles/fonts";
import Dropzone from "react-dropzone";
import React, { useState, FormEvent, use } from "react";
import { NextPage } from "next";
import PageHeader from "./components/PageHeader";
import PromptBox from "./components/PromptBox";
import Title from "./components/Title";
import TwoColumnLayout from "./components/TwoColumnLayout";
import ResultWithSources from "./components/ResultWithSources";
import ButtonContainer from "./components/ButtonContainer";
import Button from "./components/Button";
import LargeInput from "./components/LargeInput";
import ThreeColumnLayout from "./components/ThreeColumnLayout";
import "./globals.css";
import Results from "./components/Results";
import { list } from '@vercel/blob';

export default async function Home() {
  const [firstMsg, setFirstMsg] = useState(true);
  const [uploading, setUploading] = useState(""); 
  const [file, setFile] = useState();
  const [prompt, setPrompt] = useState("Copy and paste your job description here");
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Output will be shown here",
      type: "bot",
    },
  ]);
  const colorClass = "bg-white hover:bg-white";   // For tailwind CSS
  const options = [];

  const getOptions = async () => {
    const resumes = await list();
    const resume = [];
    for(let i = 0; i < resumes.blobs.length; i++) {
      resume.push(resumes.blobs[i]["pathname"]);
    };
    const options = [...new Set(resume)];
  }

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleUserIDChange = (e) => {
    setUserID(e.target.value)
  };

  const handleSubmitJobDesc = async () => {
    try {
      // Update the user message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await fetch(`/api/rewrite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDesc: prompt, firstMsg, userID }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      // So we don't reinitialize the chain
      setPrompt("");
      setFirstMsg(false);
      const searchRes = await response.json();
      console.log("Printing searchRes: ")
      console.log(searchRes);
      // Add the bot message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: String(searchRes.output), type: "bot", sourceDocuments: null },
      ]);
      // Clear any old error messages
      setError("");
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  const onSubmitResume = async (e) => {
    e.preventDefault()
    if (!file) return

    try {
      const data = new FormData()
      data.set('file', file)

      const res = await fetch(`/api/upload`, {
        method: 'POST',
        body: data,
      })
      .catch(error => console.error(error))
      // handle the error
      if (!res.ok) throw new Error(await res.text())
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
        <div className="flex justify-center flex-col mx-auto">
          <ThreeColumnLayout
          leftChildren={
            <>
              <PageHeader
                  heading="Resume + Job Description = Success"
                  boldText="Add your work history and a job description and Tailored AI will give you a custom resume tailored for the job! "
                  description="This tool uses Document Loaders, OpenAI Embeddings, Summarization Chain, Pinecone, VectorDB QA Chain, Prompt Templates, and the Vector Store Agent"
              />

              
              <ButtonContainer>
                  {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
                  {({getRootProps, getInputProps}) => (
                    <section>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>Drag 'n' drop some files here, or click to select files</p>
                      </div>
                    </section>
                  )}
                  </Dropzone> */}
                  <form onSubmit={onSubmitResume}>
                    <input type="submit" value="Upload Resumes 📂" className={`py-2 px-6 mb-4 rounded-full border border-gray-500 shadow hover:shadow-lg ${colorClass}`} />
                    <input type="file" name="file" onChange={(e) => setFile(e.target.files?.[0])} />
                  </form>
              </ButtonContainer>
            </>
          }
          centerChildren={
            <>
              <LargeInput
                  prompt={prompt}
                  handlePromptChange={handlePromptChange}
                  handleSubmit={handleSubmitJobDesc}
                  placeHolderText={
                  messages.length === 1
                      ? "First upload your work history or resume"
                      : "Now enter a link to a job description you want to apply to here"
                  }
                  error={error}
                  userID={userID}
                  handleUserIDChange={handleUserIDChange}
                  labelText={"Step 2 - Select the resume you wish to use here: "}
                  options={options}
              />
            </>
          }
          rightChildren={
            <>
              <ResultWithSources
                messages={messages}
                pngFile="wizard"
                maxMsgs={1}
              />
            </>
          }
          />
        </div>
    </>
  );
}
