import { rateLimit } from "@/lib/ratelimit";
import { NextResponse } from "next/server";

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

// Piston language aliases
const languageMappingPiston: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  c: "c",
  cpp: "cpp",
};

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forward-for") || "127.0.0.1";
    const rateLimitResult = await rateLimit(ip);

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: rateLimitResult.message }, { status: 429 });
    }
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 });
    }

    const pistonLanguage = languageMappingPiston[language];

    if (!pistonLanguage) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    const pistonResponse = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLanguage,
        version: "*", // Latest version
        files: [{ name: "code", content: code }],
        stdin: "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    const result = await pistonResponse.json();

    return NextResponse.json({
      output: result.run.stdout || "",
      error: result.run.stderr || "",
      remainingRequests: rateLimitResult.remaining,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
