import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import {put} from "@vercel/blob";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

export async function POST(req, res) {
  const data = await req.formData();  
  const file = data.get('file');
  console.log(file);

  if (!file) {
    console.log("No file?")
    return NextResponse.json({ success: false })
  }

  if (file.name) {
    /* UPLOAD TO PINECONE */
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    
    if (file.length === 0) {
        console.log("No documents found.");
        throw new Error("No documents created from the resource.");
    }

    const loader = new PDFLoader(file);
    const doc = await loader.load();

    const splitter = new CharacterTextSplitter({
        separator: " ",
        chunkSize: 250,
        chunkOverlap: 10,
    });

    const splitDocs = await splitter.splitDocuments(doc);

    await PineconeStore.fromDocuments(
        splitDocs, 
        new OpenAIEmbeddings(), 
        { pineconeIndex, namespace: file.name }
    );

    console.log("Successfully uploaded to Pinecone");

    /* UPLOAD TO BLOB STORAGE */
    const blob = await put(file.name, file, {
      access: "public",
    })

    console.log("Successfully uploaded to Blob Storage");

    // Getting keys 
    const indexStats = await pineconeIndex.describeIndexStats();
    const ns = Object.keys(indexStats["namespaces"]);

    return NextResponse.json(blob);
  }

  // With the file data in the buffer, you can do whatever you want with it.
  // For this, we'll just write it to the filesystem in a new location
  // const bytes = await file.arrayBuffer()
  // const buffer = Buffer.from(bytes)
    
  // const path = `data/input_resume/${file.name}`
  // await writeFile(path, buffer)
  // console.log(`open ${path} to see the uploaded file`)

  // return NextResponse.json({ success: true })

};