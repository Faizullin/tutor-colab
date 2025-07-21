import AiButton from "@/components/basic-editor/AiButton";
import ConversionCodePanel from "@/components/basic-editor/codeConversion/conversion";
import { usePythonTutorVisualizationEditor } from "@/components/editor/context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languageOptions } from "@/utils/constants";
import { SupportedLanguage } from "@/utils/editor-config";
import { useMutation } from "@tanstack/react-query";
import { Code2, Menu, Play } from "lucide-react";
import { useCallback } from "react";
import { useProjectEditorContent } from "./context";

interface EditorHeaderProps {
  onToggleSidebar: () => void;
  isDirty: boolean;
  fileName?: string;
}

export default function EditorHeader({
  onToggleSidebar,
  isDirty,
  fileName,
}: EditorHeaderProps) {
  const { language, code, setLanguage } = useProjectEditorContent();
  const { runCodeFn } = usePythonTutorVisualizationEditor();
  const runCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await runCodeFn({
        code,
        language,
      });
      return response;
    },
  });
  const runCodeMutateAsync = runCodeMutation.mutateAsync;
  const handleRunCode = useCallback(async () => {
    await runCodeMutateAsync(code);
  }, [code, runCodeMutateAsync]);

  return (
    <header className="h-12 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#252525] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-gray-200">CodeX</span>
          {fileName && (
            <>
              <span className="text-gray-500 mx-1">-</span>
              <span className="text-gray-300 text-sm">{fileName}</span>
              {isDirty && (
                <span className="text-emerald-400 text-xs ml-1">*</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* <RoomPanel/> */}
        <ConversionCodePanel />
        <AiButton />

        <div className="h-6 w-px bg-gray-800" />

        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as SupportedLanguage)}
        >
          <SelectTrigger className="w-[150px] bg-[#252525] border-gray-800 h-8 text-sm text-gray-200 focus:ring-emerald-500 focus:ring-opacity-30">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] text-gray-200 border-gray-800">
            {languageOptions.map((lang) => (
              <SelectItem
                key={lang.value}
                value={lang.value}
                className="hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:text-emerald-400"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{lang.icon}</span>
                  {lang.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleRunCode}
          disabled={runCodeMutation.isPending}
          size="sm"
          className={`text-white gap-1 h-8 px-3 transition-colors ${
            runCodeMutation.isPending
              ? "bg-emerald-600 opacity-80 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          {runCodeMutation.isPending ? "Running..." : "Run Code"}
        </Button>
      </div>
    </header>
  );
}
