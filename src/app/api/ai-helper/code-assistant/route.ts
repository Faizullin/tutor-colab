import { authOptions } from "@/lib/options";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
// import { aiRateLimit } from "@/lib/ratelimit";
// import redis from "@/redis/redis"; // Ensure it's configured for Upstash
// import UserLimitModel from "@/models/User_limit";
// import { ConnectoDatabase } from "@/lib/db";

// const MAX_LOGGED_IN_REQUESTS = 5;
// const MAX_GUEST_REQUESTS = 2;
// const ONE_DAY_IN_SECONDS = 86400;

export async function POST(req: NextRequest) {
  try {
    await getServerSession(authOptions);
    const { prompt, code } = await req.json();

    if (!prompt || !code) {
      return NextResponse.json(
        { message: "Prompt and code are required" },
        { status: 400 }
      );
    }

    // const MAX_DAILY_REQUESTS = isGuest ? MAX_GUEST_REQUESTS : MAX_LOGGED_IN_REQUESTS;

    // // If user is not logged in and is a guest
    // if (isGuest) {
    //   // Do guest-specific checks
    //   const redisKey = `guest:daily_requests`;
    //   const requestCount = await redis.incr(redisKey);

    //   // If this is the first request of the day, set expiry
    //   if (requestCount === 1) {
    //     await redis.expire(redisKey, ONE_DAY_IN_SECONDS);
    //   }

    //   if (requestCount > MAX_GUEST_REQUESTS) {
    //     return NextResponse.json(
    //       { message: `Guest users are limited to ${MAX_GUEST_REQUESTS} AI conversations per day.` },
    //       { status: 429 }
    //     );
    //   }
    // } else {
    //   // Logged-in user specific checks
    //   // Check existing AI rate limit
    //   const limitResult = await aiRateLimit(userId);
    //   if (!limitResult.success) {
    //     return NextResponse.json(
    //       { message: limitResult.message },
    //       { status: 429 }
    //     );
    //   }

    // // Check Redis for short-term limit for logged-in users
    // const redisKey = `user:${userId}:daily_requests`;

    // // Increment request count atomically
    // const requestCount = await redis.incr(redisKey);

    // // If this is the first request of the day, set expiry
    // if (requestCount === 1) {
    //   await redis.expire(redisKey, ONE_DAY_IN_SECONDS);
    // }

    // if (requestCount > MAX_LOGGED_IN_REQUESTS) {
    //   return NextResponse.json(
    //     { message: `You have exceeded the daily limit of ${MAX_LOGGED_IN_REQUESTS} AI requests.` },
    //     { status: 429 }
    //   );
    // }

    // // Store the request count in the database for permanent tracking
    // await UserLimitModel.findOneAndUpdate(
    //   { userId },
    //   { $inc: { fileCount: 1 } },
    //   { upsert: true, new: true }
    // );
    // }

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
      maxOutputTokens: 3072,
      temperature: 0.7,
    });

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("Missing Gemini API key");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const fullPrompt = `You are an expert programming assistant.  
    Analyze the following code and **respond according to the user's request**.  
    
    ### Code:  
    \`\`\`  
    ${code}  
    \`\`\`  
    
    ### User Request:  
    ${prompt}  
    
    ### Guidelines for Response:  
    - If the user asks for **fixes**, find and fix **bugs** (if any).  
    - If the user asks for **improvements**, suggest better coding practices.  
    - If the user asks for **a function**, **only** return the requested function without extra explanations.  
    - Always format the response properly in **Markdown** and use **valid code syntax**.  
    
    Now, generate the best possible response in **Markdown format**.`;

    try {
      const stream = await llm.stream(fullPrompt);
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.content) {
                const content =
                  typeof chunk.content === "string"
                    ? chunk.content
                    : JSON.stringify(chunk.content);
                controller.enqueue(new TextEncoder().encode(content));
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
    } catch (streamError: any) {
      console.error("Error creating stream:", streamError);
      return NextResponse.json(
        { message: "Error generating AI response", error: streamError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in Gemini API:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
