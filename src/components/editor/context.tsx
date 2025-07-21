"use client";

import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useProjectEditorContent } from "@/app/(front)/editor/_components/context";
import { Log } from "@/lib/log";
import { SupportedLanguage } from "@/utils/editor-config";
import { toast } from "sonner";
import { PythonTutorClientProvider } from "./provider";
import { VisualDataType } from "./types";
import type {
  ExecutionResponse,
  ExecutionTrace,
} from "./visualization/base/types";

const provider = new PythonTutorClientProvider();

type EditorContextType = {
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  language: SupportedLanguage | null;
  executionTrace: ExecutionTrace | null;
  setExecutionTrace: Dispatch<SetStateAction<ExecutionTrace | null>>;
  goToStep: (step: number) => void;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  result: string;
  setResult: Dispatch<SetStateAction<string>>;
  viewMode: "visual" | "json";
  setViewMode: Dispatch<SetStateAction<"visual" | "json">>;

  currentVisualData: VisualDataType;
  setCurrentVisualData: Dispatch<SetStateAction<VisualDataType>>;
  runCodeFn: (props: {
    code: string;
    language: SupportedLanguage | null;
  }) => Promise<ExecutionResponse<ExecutionTrace | string> | void>;
};

const EditorContext = createContext<EditorContextType>({
  code: "",
  setCode: function (): void {
    throw new Error("Function not implemented.");
  },
  language: null,
  executionTrace: null,
  setExecutionTrace: function (): void {
    throw new Error("Function not implemented.");
  },
  goToStep: function (): void {
    throw new Error("Function not implemented.");
  },
  error: "",
  setError: function (): void {
    throw new Error("Function not implemented.");
  },
  result: "",
  setResult: function (): void {
    throw new Error("Function not implemented.");
  },
  viewMode: "visual",
  setViewMode: function (): void {
    throw new Error("Function not implemented.");
  },
  currentVisualData: {
    currentStep: 0,
    flow: {
      nodes: {},
      edges: {},
    },
  },
  setCurrentVisualData: function (): void {
    throw new Error("Function not implemented.");
  },
  runCodeFn: async () => {
    throw new Error("Function not implemented.");
  },
});

export function PythonTutorVisualizationEditorProvider({
  children,
  language,
}: PropsWithChildren<{
  language: SupportedLanguage | null;
}>) {
  const [code, setCode] = useState("");
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(
    null
  );
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");

  const [currentVisualData, setCurrentVisualData] = useState<VisualDataType>({
    currentStep: 1,
    flow: {
      nodes: {},
      edges: {},
    },
  });
  const { setOutput, setStatus, editorRef } = useProjectEditorContent();

  const goToStep = (step: number) => {
    if (executionTrace && step >= 0 && step < executionTrace.trace.length) {
      setCurrentVisualData((prev) => ({
        ...prev,
        currentStep: step,
      }));
    }
  };

  const runCodeFn = useCallback(
    async (props: { code: string; language: SupportedLanguage | null }) => {
      if (!props.language) {
        throw new Error("Language must be selected to run code.");
      }
      setOutput("Running...");
      setStatus("idle");
      const toastId = toast.loading("Running code...");
      try {
        const service = provider.getService(props.language as any);
        const executionResponse = await provider.runCode(service, {
          code: props.code,
          language: props.language,
        });
        // if (response.status === 429) {
        //   toast.error("Rate limit exceeded! Please try again later.");
        //   setOutput("⚠️ Rate limit exceeded.");
        //   setStatus("error");
        //   return;
        // }
        if (!executionResponse.success) {
          setOutput(`Error: ${executionResponse.error?.trim()}`);
          setStatus("error");
        } else {
          let cleanOutput: string = "";
          if (typeof executionResponse.data === "string") {
            toast.error("Invalid response format. Expected ExecutionTrace.");
            setOutput("Invalid response format.");
            setStatus("error");
            return;
          } else {
            if (executionResponse.data.trace.length > 0) {
              const lastTraceStep =
                executionResponse.data.trace[
                  executionResponse.data.trace.length - 1
                ];
              cleanOutput = (
                lastTraceStep.stdout ||
                lastTraceStep.exception_msg ||
                ""
              )
                .split("\n")
                .filter((line: string) => line.trim() !== "")
                .join("\n")
                .trim();
            }
            setOutput(cleanOutput || "No output generated");
            setStatus("success");
            setExecutionTrace({
              ...executionResponse.data,
              status: "success",
            });
            toast.success("Code executed successfully!");
          }
        }
        return executionResponse;
      } catch (error) {
        toast.error("Failed to execute code. Please try again.");
        setOutput("Failed to execute code.");
        setStatus("error");
        Log.error("Execution error:", error);
      } finally {
        toast.dismiss(toastId);
      }
    },
    [setOutput, setStatus]
  );

  const decorationsRef = useRef<string[]>([]);
  useEffect(() => {
    const currentLine =
      executionTrace?.trace?.[currentVisualData.currentStep]?.line;
    if (editorRef.current && currentLine) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new (window as any).monaco.Range(
              currentLine,
              1,
              currentLine,
              1
            ),
            options: {
              isWholeLine: true,
              className: "monaco-current-line-highlight",
            },
          },
        ]
      );
    }
  }, [currentVisualData.currentStep, editorRef, executionTrace?.trace]);

  const value = {
    code,
    setCode,
    language,
    executionTrace,
    setExecutionTrace,
    goToStep,
    error,
    setError,
    result,
    setResult,
    viewMode,
    setViewMode,

    currentVisualData,
    setCurrentVisualData,
    runCodeFn,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function usePythonTutorVisualizationEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error(
      "usePythonTutorVisualizationEditor must be used within an EditorProvider"
    );
  }
  return context;
}
