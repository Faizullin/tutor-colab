import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { codeSnippet } = await req.json();

    if (!codeSnippet || typeof codeSnippet !== "string") {
      return NextResponse.json(
        { message: "Invalid input: Code snippet must be a non-empty string." },
        { status: 400 }
      );
    }

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
      maxOutputTokens: 512,
      temperature: 0.3,
    });

    const prompt = `
        You are a **code review AI**. 
        Analyze the following code snippet and provide a **concise** response.

        **Code:**
        \`\`\`ts
        ${codeSnippet}
        \`\`\`

        ### **Response Format (Keep it short & useful)**
        ✅ **Errors Found (if any)**
        ✅ **Optimizations**
        ✅ **Best Practices**
        ✅ **Fixed Code Snippet (only show required changes)**
        `;

    const stream = await llm.stream(prompt);

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content && typeof chunk.content === "string") {
              controller.enqueue(new TextEncoder().encode(chunk.content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error in AI Suggestion:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
