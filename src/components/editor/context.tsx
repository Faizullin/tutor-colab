"use client";

import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";
import { useLoadMutation } from "./hooks";

import type { ExecutionTrace } from "./visualization/base/types";
import { VisualDataType } from "./visualization/types";

type EditorContextType = {
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  actions: {
    loadMutation: ReturnType<typeof import("./hooks").useLoadMutation>;
  };
  // Visualization state
  executionTrace: ExecutionTrace | null;
  setExecutionTrace: Dispatch<SetStateAction<ExecutionTrace | null>>;
  goToStep: (step: number) => void;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  result: string;
  setResult: Dispatch<SetStateAction<string>>;
  viewMode: "visual" | "json";
  setViewMode: Dispatch<SetStateAction<"visual" | "json">>;

  currentVisualData: VisualDataType;
  setCurrentVisualData: Dispatch<SetStateAction<VisualDataType>>;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

type EditorProviderProps = PropsWithChildren;

export function EditorProvider({ children }: EditorProviderProps) {
  const loadMutation = useLoadMutation();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");

  // Visualization state
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
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

  const goToStep = (step: number) => {
    if (executionTrace && step >= 0 && step < executionTrace.trace.length) {
      setCurrentVisualData((prev) => ({
        ...prev,
        currentStep: step,
      }));
    }
  };

  const value = {
    language,
    setLanguage,
    code,
    setCode,
    actions: {
      loadMutation,
    },
    executionTrace,
    setExecutionTrace,
    goToStep,
    isLoading,
    setIsLoading,
    error,
    setError,
    result,
    setResult,
    viewMode,
    setViewMode,

    currentVisualData,
    setCurrentVisualData,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
