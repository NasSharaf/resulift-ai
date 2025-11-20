import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  // Save to blob storage
  const blob = await put(file.name, file, { access: "public" });

  return NextResponse.json({
    resumeURL: blob.url,
    filename: file.name,
    success: true,
  });
}
