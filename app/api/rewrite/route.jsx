// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

const resumeFormat = z.object({
    experience: z.string().describe("User's experiences with bullets of what was done at each role"),
    education: z.string().describe("User's education, certifications, and degrees"),
    skills: z.string().describe("User's skills, strengths, and knowledge"),
    projects: z.string().describe("Any relevant projects or side activities the user may have made"),
    publications: z.string().describe("Any articles, papers, or publications the user may have authored"),
});

const parser = StructuredOutputParser.fromZodSchema(resumeFormat);

export async function POST(req, res) {
    const body = await req.json();
    const {firstMsg, jobDesc, userID} = body;

    // Check environment variables
    if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
        throw new Error("Pinecone environment or api key vars missing");
    }

    console.log(userID);

    /** STEP ONE: LOAD DOCUMENT */
    const resumes = await list();

    console.log(resumes.blobs[0]["pathname"])

    let fetchUrl = "";
    for(const blob of resumes.blobs) {
        if(blob["pathname"] === userID) {
            fetchUrl = blob["url"];
        } else {
            console.log(" URL not found!!! ")
        }
    }

    let blob = await fetch(fetchUrl).then(r => r.blob());

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

    /** STEP TWO: UPLOAD TO PINECONE AND QUERY **/
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    console.log(pineconeIndex);

    await PineconeStore.fromDocuments(
        splitDocs, 
        new OpenAIEmbeddings(), 
        { pineconeIndex, namespace: userID.toString() }
    );

    console.log("Successfully uploaded to DB");

    /** STEP THREE: CREATE CHAIN TO GENERATE RESUMES **/
    // Alright, finally we have all the context and we can initialize the chain!
    const response = await initChain(
        jobDesc,
        splitDocs,
        userID
    );

    /** STEP FOUR: FORMAT OUTPUT INTO JSON AND THEN JSON TO PDF **/
    // return res.status(200).json({ output: research });
    return NextResponse.json({ output: response }, { status: 200 })
}

const initChain = async(jobDesc, resume, userID) => {
    try {
        console.log("From init chain: " + userID);

        // Load vector db
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
          });
      
        const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

        const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(),{ 
                pineconeIndex, 
                namespace: userID.toString() 
            }
        );

        const vectorStoreRetriever = vectorStore.asRetriever();

        // initialize model
        const llm = new ChatOpenAI({
            temperature: 0.2,
            modelName: "gpt-3.5-turbo",
        });

        // initialize chat prompt
        // Create a system & human prompt for the chat model
        const SYSTEM_TEMPLATE = `You are an expert human resources professional and specialize in rewriting resumes. Use the following context to answer the question.  
        Do not make anything up.
        ----------------
        {context}`;

        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            ["human", "{question}"],
        ]);

        // initialize chain
        const chain = RunnableSequence.from([
            {
                context: vectorStoreRetriever.pipe(formatDocumentsAsString),
                question: new RunnablePassthrough(),
            },
            chatPrompt,
            llm.withStructuredOutput(resumeFormat),
        ]);

        //const chain = llm.withStructuredOutput(resumeFormat);
        // return the response
        const response = await chain.invoke("return the users resume as completely as possible");
        console.log(response);
        return response
    } catch (error) {
        console.error(
          `An error occurred during the initialization of the Chat Prompt: ${error.message}`
        );
        throw error; // rethrow the error to let the calling function know that an error occurred
    }
};