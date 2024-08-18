// start here
"use client";
import Image from "next/image";
import "./globals.css";
import Gallery from "./components/Gallery";
import { pressStart2P, sourceCodePro, instrumentSans } from "./styles/fonts";

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

export default function Home() {
  const [firstMsg, setFirstMsg] = useState(true);
  const [uploading, setUploading] = useState(""); 
  const [file, setFile] = useState();
  const [prompt, setPrompt] = useState("Copy and paste your job description here");
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState(1);
  const [messages, setMessages] = useState([
    {
      text: "Submit your resume and a job description",
      type: "bot",
    },
  ]);
  // For tailwind CSS
  const colorClass = "bg-white hover:bg-white";

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
        { text: searchRes.output, type: "bot", sourceDocuments: null },
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
                  <form onSubmit={onSubmitResume}>
                    <input type="submit" value="Upload Resumes 📂" className={`py-2 px-6 mb-4 rounded-full border border-gray-500 shadow hover:shadow-lg ${colorClass}`} />
                    <input type="file" name="file" onChange={(e) => setFile(e.target.files?.[0])} />
                  </form>
                  {/* <Button
                      handleSubmit={handleSubmitUpload}
                      endpoint=""
                      buttonText=" Upload Resumes 📂"
                  /> */}
              </ButtonContainer>
              <select value={userID} onChange={handleUserIDChange}>
                    <option value={1}>Nasir</option>
                    <option value={2}>Maysum</option>
              </select>
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
              />
            </>
          }
          rightChildren={
            <>
              <ResultWithSources
                messages={messages}
                pngFile="wizard"
                maxMsgs={3}
              />
            </>
          }
          />
            

            
        </div>
    </>
    );
}
