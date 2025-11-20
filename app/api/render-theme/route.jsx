// app/api/render-theme/route.js
import { NextResponse } from "next/server";

// Set max duration for theme rendering
export const maxDuration = 20;

export async function POST(req) {
  try {
    const body = await req.json();
    const { jsonResume } = body;

    if (!jsonResume) {
      return NextResponse.json(
        { error: "Missing jsonResume" },
        { status: 400 }
      );
    }

    // IMPORTANT: dynamic import so Next.js doesn't try to bundle fs
    const theme = await import("jsonresume-theme-onepage-plus");
    const renderTheme = theme.render;

    const html = renderTheme(jsonResume);

    return NextResponse.json({ html }, { status: 200 });
  } catch (err) {
    console.error("render-theme error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
