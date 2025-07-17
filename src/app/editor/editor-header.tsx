import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Code2, Play, Menu, Save } from "lucide-react";
import { languageOptions } from "../utils/constants";
import { SupportedLanguage } from "../utils/editor-config";
import AiButton from "@/components/AiButton";
import ConversionCodePanel from "@/components/codeConversion/conversion";

interface EditorHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  onRun: () => void;
  loading: boolean;
  onToggleSidebar: () => void;
  onSave: () => void;
  isDirty: boolean;
  fileName?: string;
}

export default function EditorHeader({
  language,
  onLanguageChange,
  onRun,
  loading,
  onToggleSidebar,
  onSave,
  isDirty,
  fileName
}: EditorHeaderProps) {
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
              {isDirty && <span className="text-emerald-400 text-xs ml-1">*</span>}
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* <RoomPanel/> */}
        <ConversionCodePanel/>
        <AiButton />
        
        <Button
          onClick={onSave}
          disabled={loading || !isDirty}
          size="sm"
          variant="ghost"
          className={`gap-1 h-8 px-3 transition-colors ${
            isDirty 
              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-[#2a2a2a]' 
              : 'text-gray-500'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
        
        <div className="h-6 w-px bg-gray-800" />
        
        <Select value={language} onValueChange={onLanguageChange}>
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
          onClick={onRun}
          disabled={loading}
          size="sm"
          className={`text-white gap-1 h-8 px-3 transition-colors ${
            loading 
              ? 'bg-emerald-600 opacity-80 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          {loading ? "Running..." : "Run Code"}
        </Button>
      </div>
    </header>
  );
}