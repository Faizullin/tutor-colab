"use client";

import { ArrowLeft, Code, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CodeEditorRender } from "./code-editor/render";
import { getDefaultCode } from "./code-editor/utils";
import { useEditor } from "./context";
import { useRunMutation } from "./hooks";
import EditorStorageService from "./utils/storage-service";
import Visualization from "./visualization";
import { TraceStep } from "./visualization/base/types";
import CppVisualizationService from "./visualization/types/cpp/service";

const LanguageOptionsList = [
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
];

const ServiceDict = {
  cpp: new CppVisualizationService(),
};

export const EditorRender = () => {
  const {
    language,
    setLanguage,
    code,
    setCode,
    setExecutionTrace,
    setCurrentStep,
    setIsLoading,
    setError,
    setResult,
  } = useEditor();

  const runMutation = useRunMutation({
    service: ServiceDict[language as keyof typeof ServiceDict],
  });

  const handleRunClick = useCallback(() => {
    runMutation
      .mutateAsync({
        language,
        code,
      })
      .then((response) => {
        if (response.success) {
          const parsed = JSON.parse(response.data);
          setExecutionTrace(parsed);
          setCurrentStep(0);
          setIsLoading(false);
          setError("");
          setResult("");
          const traces = parsed.trace as TraceStep[];
          if (traces.length === 1) {
            if (traces[0].event === "uncaught_exception") {
              setError(
                traces[0].exception_msg || "An error occurred during execution."
              );
              return;
            }
          }
          EditorStorageService.setItem({
            code,
            trace: traces,
            savedAt: new Date(),
            status: "success",
          });
        }
      });
  }, [
    runMutation,
    code,
    language,
    setExecutionTrace,
    setCurrentStep,
    setIsLoading,
    setError,
    setResult,
  ]);

  const loadHelpReadyRef = useRef(false);
  useEffect(() => {
    if (!loadHelpReadyRef.current) {
      loadHelpReadyRef.current = true;
      if (!code) {
        const savedData = EditorStorageService.getItem();
        if (savedData) {
          setExecutionTrace(savedData);
          setCurrentStep(0);
          setCode(savedData.code);
        } else {
          setCode(getDefaultCode(language));
        }
      }
    }
  }, [code, language, setCode, setExecutionTrace, setCurrentStep]);

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Code className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Code Lab</h1>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LanguageOptionsList.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleRunClick}
                disabled={runMutation.isPending}
                className="gap-2"
              >
                {runMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Resizable 2 Panel Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
            <Visualization.Render />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-muted hover:bg-primary transition-colors"
          />

          {/* Right Panel - Code Editor */}
          <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
            <CodeEditorRender />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
