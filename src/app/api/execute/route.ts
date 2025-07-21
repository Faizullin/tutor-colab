import { NextResponse } from "next/server";
import { PythonTutorProvider } from "./_providers/python-tutor-provider";

const providerMapping = {
  pythontutor: new PythonTutorProvider(),
};

export async function POST(req: Request) {
  try {
    // const ip = req.headers.get("x-forward-for") || "127.0.0.1";
    // const rateLimitResult = await rateLimit(ip);

    // if (!rateLimitResult.success) {
    //   return NextResponse.json(
    //     { error: rateLimitResult.message },
    //     { status: 429 }
    //   );
    // }
    const data = await req.json();

    if (!data.provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    const provider =
      providerMapping[data.provider as keyof typeof providerMapping];
    if (!provider) {
      throw NextResponse.json({ error: "Incorrect provider" }, { status: 400 });
    }

    const result = await provider.execute(data);

    return NextResponse.json({
      result,
      // remainingRequests: rateLimitResult.remaining,
    });
  } catch (error) {
    console.error("Error in execute route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
