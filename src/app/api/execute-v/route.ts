import { NextRequest, NextResponse } from "next/server";

const LanguageEngineDataMap = {
  cpp: {
    url: "https://pythontutor.com/web_exec_cpp.py",
  },
  python3: {
    url: "https://pythontutor.com/web_exec_py3.py",
  },
};

export async function POST(request: NextRequest) {
  try {
    const { code, language, user_uuid, session_uuid } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Don't encode the user script here - let URLSearchParams handle it
    // const encodedScript = encodeURIComponent(code);
    const options: Record<string, any> = {
      cumulative_mode: false,
      heap_primitives: false,
      show_only_outputs: false,
      origin: "opt-frontend.js",
      fe_disableHeapNesting: true,
      fe_textualMemoryLabels: false,
    };

    if (language === "cpp") {
      options["cpp_version"] = "cpp_g++9.3.0";
    }

    // Build URL parameters manually to avoid double encoding
    const params = new URLSearchParams();
    params.append("user_script", code); // Let URLSearchParams encode this
    params.append("raw_input_json", ""); // Empty as per the correct URL
    params.append("options_json", JSON.stringify(options));
    params.append("n", "251");

    // Add UUIDs if provided
    if (user_uuid) {
      params.append("user_uuid", user_uuid);
    }
    if (session_uuid) {
      params.append("session_uuid", session_uuid);
    }

    const pythonTutorUrlPath =
      LanguageEngineDataMap[language as keyof typeof LanguageEngineDataMap]
        ?.url;

    if (!pythonTutorUrlPath) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
    }

    // Build the Python Tutor URL
    const pythonTutorUrl = `${pythonTutorUrlPath}?${params.toString()}`;
    console.log("Python Tutor URL Path:", pythonTutorUrl);

    // Make request to Python Tutor
    const response = await fetch(pythonTutorUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Python Tutor API responded with status: ${response.status}`
      );
    }

    const data = await response.text();

    return NextResponse.json({
      success: true,
      data,
      url: pythonTutorUrl,
      user_uuid,
      session_uuid,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      {
        error: "Failed to execute code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
