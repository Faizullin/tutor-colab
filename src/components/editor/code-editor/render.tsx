import MonacoEditor from "@monaco-editor/react";
import { Code } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useEditor } from "../context";

import "./styles.css";

export const CodeEditorRender = () => {
  const { code, setCode, language, currentStep, executionTrace } = useEditor();
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Monaco uses different language ids
  const usedLanguageMonaco = useMemo(() => {
    switch (language) {
      case "cpp":
      case "c++":
      case "c":
        return "cpp";
      case "python":
        return "python";
      case "java":
        return "java";
      case "javascript":
        return "javascript";
      default:
        return "plaintext";
    }
  }, [language]);

  useEffect(() => {
    const currentLine = executionTrace?.trace?.[currentStep]?.line;
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
  }, [currentStep, executionTrace?.trace]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 py-3 border-b bg-card">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Code Editor
        </h3>
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          onMount={(editor) => {
            if (!editorRef.current) {
              editorRef.current = editor;
            }
          }}
          language={usedLanguageMonaco}
          theme="vs-dark"
          value={code}
          onChange={(value: string | undefined) => setCode(value || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
          }}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};
