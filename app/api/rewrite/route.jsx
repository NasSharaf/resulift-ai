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
        { pineconeIndex,}
    );

    console.log("Successfully uploaded to DB");

    /** STEP THREE: CREATE CHAIN TO GENERATE RESUMES **/
    // Alright, finally we have all the context and we can initialize the chain!
    const response = await initChain(
        jobDesc,
        splitDocs
    );

    /** STEP FOUR: FORMAT OUTPUT INTO JSON AND THEN JSON TO PDF **/
    
    // return res.status(200).json({ output: research });
    return NextResponse.json({ output: response }, { status: 200 })
}

const initChain = async(jobDesc, resume) => {
    try {
        // Load vector db
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
          });
      
        const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings(),
            { pineconeIndex }
        );

        const vectorStoreRetriever = vectorStore.asRetriever();

        // initialize model
        const llm = new ChatOpenAI({
            temperature: 0.1,
            modelName: "gpt-3.5-turbo",
        });

        // initialize chat prompt
        // Create a system & human prompt for the chat model
        const SYSTEM_TEMPLATE = `Display the following bits of context and then answer the questions. 
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
            llm,
            new StringOutputParser()
        ])

        // return the response
        const response = await chain.invoke("What is the name of the person in this resume and what did they do?");
        return response
    } catch (error) {
        console.error(
          `An error occurred during the initialization of the Chat Prompt: ${error.message}`
        );
        throw error; // rethrow the error to let the calling function know that an error occurred
    }
};