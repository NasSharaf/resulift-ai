import { NextResponse } from "next/server";

// Theme registry
// Dynamic imports for themes
const THEMES = {
  even: () => import("jsonresume-theme-even"),
  paper: () => import("jsonresume-theme-paper"),
  onepage: () => import("jsonresume-theme-onepage"),
  elegant: () => import("jsonresume-theme-elegant"),
  flat: () => import("jsonresume-theme-flat")
};

export const maxDuration = 20;

export async function POST(req) {
  try {
    const { jsonResume, theme = "even" } = await req.json();

    if (!jsonResume) {
      return NextResponse.json({ error: "Missing jsonResume" }, { status: 400 });
    }

    if (!THEMES[theme]) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    // Dynamically import the theme
    const themeModule = await THEMES[theme]();
    const renderer = themeModule.render;

    if (typeof renderer !== 'function') {
      return NextResponse.json({ error: "Theme rendering failed" }, { status: 500 });
    }

    const html = renderer(jsonResume);

    return NextResponse.json({ html });
  } catch (err) {
    console.error("render-theme error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}