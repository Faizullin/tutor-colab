import { ApiError } from "@/lib/exception";

const languageMapping = {
  cpp: {
    url: "https://pythontutor.com/web_exec_cpp.py",
  },
  python3: {
    url: "https://pythontutor.com/web_exec_py3.py",
  },
};

export class PyTutorProviderException extends Error {
  constructor(
    message: string,
    public details: {
      code: string;
      apiError?: ApiError;
    }
  ) {
    super(message);
    this.name = "PyTutorProviderException";
    this.details = details;
  }
}

export class PythonTutorProvider {
  async execute(reqBody: any) {
    const { code, language, user_uuid, session_uuid } = reqBody;
    const selectedLang =
      languageMapping[language as keyof typeof languageMapping];

    if (!selectedLang) {
      throw new PyTutorProviderException("Language not selected", {
        code: "incorrect-selected",
      });
    }

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

    const pythonTutorUrlPath = selectedLang.url;
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
    return {
      success: true,
      data,
      url: pythonTutorUrl,
      user_uuid,
      session_uuid,
    };
  }
}
