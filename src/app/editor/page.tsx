"use client";

import { useState, useEffect, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import EditorHeader from "./editor-header";
import FileExplorer from "./file-explorer";
import TerminalPanel from "./terminal-panel";
import SidebarNav from "./sidebar-nav";
import Editor from "@monaco-editor/react";
import { defaultEditorOptions, SupportedLanguage } from "@/app/utils/editor-config";
import { toast } from "react-hot-toast";
import useFileStore from "@/app/store/useFileStore";
import { Button } from "@/components/ui/button";
import { Save, Lightbulb, Laptop, Smartphone, XCircle } from "lucide-react";
import { useAIStore } from "../store/useAIStore";
import CodeSuggestion from "@/components/CodeSuggestion/codeSuggesstion";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const router = useRouter();
  const session = useSession();

  const {
    selectedFile,
    fileContent,
    setFileContent,
    saveFileContent,
    isLoading: isFileLoading,
    isDirty
  } = useFileStore();

  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [activeTab, setActiveTab] = useState("files");
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const { code, setCode, setCodeForConversion } = useAIStore();
  const editorRef = useRef<any>(null);
  
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(false);
  const [showAiSettingsPanel, setShowAiSettingsPanel] = useState(false);
  const codeSuggestionRef = useRef<any>(null);
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth < 768;
      setIsMobile(mobileCheck);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (selectedFile && selectedFile.language) {
      setLanguage(selectedFile.language as SupportedLanguage);
    }
  }, [selectedFile]);

  const handleEditorChange = (value: string | undefined) => {
    const updatedValue = value || "";
    setFileContent(updatedValue);
    setCodeForConversion(updatedValue);
    setCode(updatedValue);

    if (session.status !== 'authenticated' && selectedFile) {
      const localFiles = JSON.parse(localStorage.getItem('localFiles') || '[]');
      const updatedFiles = localFiles.map((file: any) => 
        file.name === selectedFile.name 
          ? { ...file, content: updatedValue } 
          : file
      );
      localStorage.setItem('localFiles', JSON.stringify(updatedFiles));
    }
  };

  

  const handleSaveFile = async () => {
    try {
      await saveFileContent();
      toast.success("File saved successfully!");
    } catch (error) {
      toast.error("Failed to save file");
      console.error("Error saving file:", error);
    }
  };

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    if (!selectedFile) {
      setFileContent(defaultEditorOptions.snippets[newLanguage] || "");
    }
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");
    setStatus("idle");
    const toastId = toast.loading("Running code...");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fileContent, language }),
      });
      const data = await response.json();

      if (response.status === 429) {
        toast.error("Rate limit exceeded! Please try again later.");
        setOutput("⚠️ Rate limit exceeded.");
        setStatus("error");
        return;
      }

      if (data.error) {
        setOutput(`Error: ${data.error.trim()}`);
        setStatus("error");
      } else {
        const cleanOutput = (data.output || "")
          .split("\n")
          .filter((line: string) => line.trim() !== "")
          .join("\n")
          .trim();

        setOutput(cleanOutput || "No output generated");
        setStatus("success");
        toast.success("Code executed successfully!");
      }
    } catch (error) {
      toast.error("Failed to execute code. Please try again.");
      setOutput("Failed to execute code.");
      setStatus("error");
      console.error("Execution error:", error);
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  const toggleSidebar = () => {
    setCollapsedSidebar(!collapsedSidebar);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Toggle AI suggestions and panel
  const toggleAiSuggestions = () => {
    setShowAiSettingsPanel(!showAiSettingsPanel);
  };

  // Force suggestions to generate when button is clicked
  const handleForceSuggestions = () => {
    if (codeSuggestionRef.current && typeof codeSuggestionRef.current.forceFetchSuggestions === 'function') {
      codeSuggestionRef.current.forceFetchSuggestions();
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-center p-6">
        <div className="max-w-md mx-auto">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <Smartphone className="h-16 w-16 text-gray-500 absolute" />
            <XCircle className="h-8 w-8 text-red-500 absolute bottom-0 right-0" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-400 mb-4">Nice try, but not today!</h1>
          <p className="text-gray-300 mb-6">
            We admire your enthusiasm, but coding on a phone is like trying to paint a masterpiece with your elbow. 
            Some things just need the right tools.
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm mb-2">Friendly heads-up:</p>
            <p className="text-gray-400 text-sm">
              This code editor needs a larger screen and a proper keyboard to work well. 
              Your phone screen is just too small for a good coding experience.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-emerald-400 text-sm">
              Come back on a laptop, desktop, or tablet with keyboard. Your code (and fingers) will thank you!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-100">
      <EditorHeader
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={runCode}
        loading={loading || isFileLoading}
        onToggleSidebar={toggleSidebar}
        onSave={handleSaveFile}
        isDirty={session.status === 'authenticated' ? isDirty : !!selectedFile?.content}
        fileName={selectedFile?.name}
      />
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel
            defaultSize={collapsedSidebar ? 5 : 20}
            minSize={collapsedSidebar ? 5 : 15}
            maxSize={30}
            className="flex"
          >
            <div className="flex h-full flex-1">
              <SidebarNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                collapsed={collapsedSidebar}
              />
              {!collapsedSidebar && (
                <div className="flex-1 border-r border-gray-800">
                  <FileExplorer />
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />

          <ResizablePanel defaultSize={80} className="flex flex-col">
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={70} className="min-h-[30%]">
                <div className="h-full w-full overflow-hidden">
                  {selectedFile ? (
                    <div className="flex flex-col h-full">
                      <div className="px-4 py-1 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-300">{selectedFile.name}</span>
                          {isDirty && <span className="ml-2 text-xs text-gray-500">(unsaved)</span>}
                        </div>
                        
                        <Button
                          size="default"
                          variant="ghost"
                          className={`h-7 px-2 ${aiSuggestionsEnabled ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-300'} hover:bg-[#252525] transition-colors`}
                          onClick={toggleAiSuggestions}
                        >
                          <Lightbulb className="h-3.5 w-3.5 mr-1" />
                          AI Suggestions
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-[#252525] transition-colors"
                          onClick={handleSaveFile}
                          disabled={isFileLoading || !isDirty}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      </div>
                      
                      {/* AI Settings Panel */}
                      {showAiSettingsPanel && (
                        <div className="px-4 py-2 border-b border-gray-500 bg-[#474545] flex items-center justify-between">
                            <div className="flex items-center">
                            <span className="text-sm text-gray-300 mr-3">Enable AI suggestions</span>
                            <Switch 
                              checked={aiSuggestionsEnabled} 
                              onCheckedChange={(checked: boolean) => {
                              setAiSuggestionsEnabled(checked);
                              if (checked) {
                                handleForceSuggestions();
                              }
                              }}
                              className=" data-[state=checked]:bg-emerald-600"
                            />
                            </div>
                          <div className="flex items-center">
                            {aiSuggestionsEnabled && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-3 text-xs bg-emerald-400/30 hover:bg-emerald-800/50 border-emerald-700 text-emerald-400 hover:text-emerald-300 mr-2"
                                onClick={handleForceSuggestions}
                              >
                                Generate Now
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 relative">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={language}
                          value={fileContent}
                          onChange={handleEditorChange}
                          onMount={handleEditorDidMount}
                          options={{
                            ...defaultEditorOptions.monaco,
                            minimap: { enabled: true },
                            quickSuggestions: { other: true, comments: true, strings: true },
                            suggestOnTriggerCharacters: true,
                            autoClosingBrackets: "always",
                            autoIndent: 'full',
                            tabCompletion: "on",
                            inlineSuggest: { enabled: true },
                            suggest: {
                              showInlineDetails: true,
                              showMethods: true,
                              showFunctions: true,
                              showConstructors: true,
                              showFields: true,
                              showVariables: true,
                              showClasses: true,
                              showStructs: true,
                              showInterfaces: true,
                              showModules: true,
                              showProperties: true,
                              showEvents: true,
                              showOperators: true,
                              showUnits: true,
                              showValues: true,
                              showConstants: true,
                              showEnums: true,
                              showEnumMembers: true,
                              showKeywords: true,
                              showWords: true,
                              showColors: true,
                              showFiles: true,
                              showReferences: true,
                              showFolders: true,
                              showTypeParameters: true,
                              showSnippets: true,
                              showUsers: true,
                              showIssues: true
                            }
                          }}
                          loading={
                            <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
                              <div className="text-emerald-400">Loading editor...</div>
                            </div>
                          }
                        />

                        <CodeSuggestion
                          ref={codeSuggestionRef}
                          code={fileContent}
                          editorRef={editorRef}
                          onApplySuggestion={setFileContent}
                          isEnabled={aiSuggestionsEnabled}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-gray-400">
                      <p className="mb-2">No file selected</p>
                      <p className="text-sm">Select a file from the explorer or create a new one</p>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />

              <ResizablePanel defaultSize={30} className="min-h-[15%]">
                <TerminalPanel
                  output={output}
                  status={status}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}