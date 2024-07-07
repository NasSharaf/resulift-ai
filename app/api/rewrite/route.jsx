// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PineconeStore } from "@langchain/pinecone";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
  } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

// export async function GET(req, res) {
//     // Check environment variables
//     if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
//         throw new Error("Pinecone environment or api key vars missing");
//     }
//     /** STEP ONE: LOAD DOCUMENT */
//     const resumes = await list();
//     console.log(resumes);
//     const loader = new DirectoryLoader(
//         "resumatch-ai/data/input_resume",
//         {
//           ".pdf": (path) => new PDFLoader(path, "/pdf"),
//         }
//     );

//     const docs = await loader.load();

//     if (docs.length === 0) {
//         console.log("No documents found.");
//         throw new Error("No documents created from the resource.");
//     }

//     const splitter = new CharacterTextSplitter({
//         separator: " ",
//         chunkSize: 250,
//         chunkOverlap: 10,
//     });

//     const splitDocs = await splitter.splitDocuments(docs);

// }

export async function POST(req, res) {
    const body = await req.json();
    const {firstMsg, jobDesc} = body;

    // Check environment variables
    if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
        throw new Error("Pinecone environment or api key vars missing");
    }
    /** STEP ONE: LOAD DOCUMENT */
    const resumes = await list();
    let blob = await fetch(resumes.blobs[0].url).then(r => r.blob());
    // const loader = new DirectoryLoader(
    //     resumes.blobs.url,
    //     {
    //       ".pdf": (path) => new PDFLoader(path, "/pdf"),
    //     }
    // );
    const loader = new WebPDFLoader(blob);

    const docs = await loader.load();

    if (docs.length === 0) {
        console.log("No documents found.");
        throw new Error("No documents created from the resource.");
    }

    const splitter = new CharacterTextSplitter({
        separator: " ",
        chunkSize: 250,
        chunkOverlap: 10,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Alright, finally we have all the context and we can initialize the chain!
    const response = await initChain(
        jobDesc,
        splitDocs
    );
    
    // return res.status(200).json({ output: research });
    return NextResponse.json({ output: response.content }, { status: 200 })
}

const initChain = async(jobDesc, resumeEmbeddings) => {
    try {
        // initialize model
        const llm = new ChatOpenAI({
            temperature: 0.2,
            modelName: "gpt-3.5-turbo",
        });
        // initialize chat prompt
        const chatPrompt = ChatPromptTemplate.fromTemplate(
                "Do not make anything up. Use the information from my resume: {resumeEmbeddings} to write a resume for this job description: {jobDesc}."
        );
        // initialize chain
        const chain = chatPrompt.pipe(llm);
        const response = await chain.invoke({ resumeEmbeddings: resumeEmbeddings, jobDesc: jobDesc });
        // log response
        return response
    } catch (error) {
        console.error(
          `An error occurred during the initialization of the Chat Prompt: ${error.message}`
        );
        throw error; // rethrow the error to let the calling function know that an error occurred
    }
};