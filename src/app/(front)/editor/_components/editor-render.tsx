"use client";

import CodeSuggestion from "@/components/basic-editor/CodeSuggestion/codeSuggesstion";
import PythonTutorVisualizationEditor from "@/components/editor";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Switch } from "@/components/ui/switch";
import { useControlledToggle } from "@/hooks/use-controlled-toggle";
import { cn } from "@/lib/utils";
import { useAIStore } from "@/store/useAIStore";
import { defaultEditorOptions, SupportedLanguage } from "@/utils/editor-config";
import { Editor } from "@monaco-editor/react";
import { Lightbulb, Maximize2, Save, Smartphone, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useProjectEditor, useProjectEditorContent } from "./context";
import { DemoContainer } from "./demo-container";
import EditorHeader from "./editor-header";
import FileExplorer from "./file-explorer";
import SidebarNav from "./sidebar-nav";
import TerminalPanel from "./terminal-panel";
import { EditProjectFile } from "./types";
import { Log } from "@/lib/log";

export function EditorRender() {
  const {
    loading: initialLoading,
    currentEditProjectFileUid,
    setCurrentEditProjectFileUid,
    saveProjectFileContentMutation,
    projectFileListQuery,
    project,
    demo,
  } = useProjectEditor();
  const { editorRef: storeEditorRef } = useProjectEditorContent();
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("files");
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const { setCode: setAICode, setCodeForConversion } = useAIStore();
  const editorRef = useRef<any>(null);
  const {
    code: fileContent,
    setCode: setFileContent,
    language,
    setLanguage,
    status,
    output,
  } = useProjectEditorContent();

  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(false);
  const [showAiSettingsPanel, setShowAiSettingsPanel] = useState(false);
  const codeSuggestionRef = useRef<any>(null);
  const [files, setFiles] = useState<EditProjectFile[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) && window.innerWidth < 768;
      setIsMobile(mobileCheck);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const selectedProjectFile = useMemo(() => {
    return files.find((file) => file.uid === currentEditProjectFileUid) || null;
  }, [files, currentEditProjectFileUid]);

  useEffect(() => {
    if (selectedProjectFile && selectedProjectFile.file.language) {
      setLanguage(selectedProjectFile.file.language as SupportedLanguage);
    }
  }, [selectedProjectFile, setLanguage]);

  const setContent = useCallback(
    (
      content: string,
      options?: { isDirty?: boolean; overrideFile?: EditProjectFile }
    ) => {
      setFileContent(content);
      setCodeForConversion(content);
      setAICode(content);
      if (options?.isDirty) {
        setIsDirty(options?.isDirty);
      } else {
        setIsDirty(true);
      }
      const selectedFile = files.find(
        (file) => file.uid === currentEditProjectFileUid
      );
      if (selectedFile) {
        setFiles((prev) =>
          prev.map((f) =>
            f.uid === selectedFile.uid
              ? options?.overrideFile ||
                ({ ...f, file: { ...f.file, content } } as EditProjectFile)
              : f
          )
        );
      }
    },
    [
      setFileContent,
      setCodeForConversion,
      setAICode,
      files,
      currentEditProjectFileUid,
    ]
  );

  const handleEditorChange = (value: string | undefined) => {
    const updatedValue = value || "";
    setContent(updatedValue);
    // if (session.status !== "authenticated" && selectedProjectFile) {
    //   const localFiles = JSON.parse(localStorage.getItem("localFiles") || "[]");
    //   const updatedFiles = localFiles.map((file: any) =>
    //     file.name === selectedFile.name
    //       ? { ...file, content: updatedValue }
    //       : file
    //   );
    //   localStorage.setItem("localFiles", JSON.stringify(updatedFiles));
    // }
  };

  const handleSaveFile = async () => {
    if (!selectedProjectFile) {
      throw new Error(`selectedProjectFile can not be null!`);
    }
    if (!selectedProjectFile.synced) {
      throw new Error(`selectedProjectFile must be synced`);
    }
    try {
      const response = await saveProjectFileContentMutation.mutateAsync({
        id: selectedProjectFile.file.id,
        content: fileContent,
        language: language,
      });
      setContent(response.content, {
        isDirty: false,
        overrideFile: {
          ...selectedProjectFile,
          file: response,
        },
      });
      toast.success("File saved successfully!");
    } catch (error) {
      toast.error("Failed to save file");
      Log.error("Error saving file:", error);
    }
  };

  const toggleSidebar = () => {
    setCollapsedSidebar(!collapsedSidebar);
  };

  const handleEditorDidMount = (editor: any) => {
    if (!editorRef.current) {
      editorRef.current = editor;
      storeEditorRef.current = editor;
    }
  };

  // Toggle AI suggestions and panel
  const toggleAiSuggestions = () => {
    setShowAiSettingsPanel(!showAiSettingsPanel);
  };

  // Force suggestions to generate when button is clicked
  const handleForceSuggestions = () => {
    if (
      codeSuggestionRef.current &&
      typeof codeSuggestionRef.current.forceFetchSuggestions === "function"
    ) {
      codeSuggestionRef.current.forceFetchSuggestions();
    }
  };

  // Sync project/files
  useEffect(() => {
    if (project && projectFileListQuery.data) {
      const parsedFiles: EditProjectFile[] =
        (projectFileListQuery.data as any).map((file: any) => ({
          uid: `${file.id}`,
          synced: true,
          file: file,
        })) ?? [];
      if (
        !currentEditProjectFileUid &&
        project.files.length > 0 &&
        projectFileListQuery.data
      ) {
        const foundFile = parsedFiles.find(
          (item) => item.file.id === project.files[0].id
        );
        setCurrentEditProjectFileUid(foundFile?.uid || null);
      }
    }
  }, [
    project,
    currentEditProjectFileUid,
    projectFileListQuery.data,
    setCurrentEditProjectFileUid,
  ]);

  const {
    value: loadFilesControlledToggleValue,
    setValue: setLoadFilesControlledToggleValue,
  } = useControlledToggle({
    defaultValue: true,
  });
  useEffect(() => {
    if (projectFileListQuery.data) {
      setLoadFilesControlledToggleValue(false);
      const parsedFiles =
        (projectFileListQuery.data as any).map((file: any) => ({
          uid: `${file.id}`,
          synced: true,
          file: file,
        })) ?? [];

      setFiles(parsedFiles);
    }
  }, [projectFileListQuery.data, setLoadFilesControlledToggleValue]);

  useEffect(() => {
    if (selectedProjectFile && !loadFilesControlledToggleValue) {
      setLoadFilesControlledToggleValue(true);
      setLanguage(selectedProjectFile.file.language as SupportedLanguage);
      setContent(selectedProjectFile.file.content, {
        isDirty: false,
      });
    }
  }, [
    selectedProjectFile,
    setContent,
    setLanguage,
    loadFilesControlledToggleValue,
    setLoadFilesControlledToggleValue,
  ]);

  useEffect(() => {
    setLoadFilesControlledToggleValue(false);
  }, [currentEditProjectFileUid, setLoadFilesControlledToggleValue]);

  const [maximized, setMaximized] = useState(false);
  const saveFileDisabled =
    saveProjectFileContentMutation.isPending ||
    initialLoading ||
    !isDirty ||
    demo;

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-center p-6">
        <div className="max-w-md mx-auto">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <Smartphone className="h-16 w-16 text-gray-500 absolute" />
            <XCircle className="h-8 w-8 text-red-500 absolute bottom-0 right-0" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-400 mb-4">
            Nice try, but not today!
          </h1>
          <p className="text-gray-300 mb-6">
            We admire your enthusiasm, but coding on a phone is like trying to
            paint a masterpiece with your elbow. Some things just need the right
            tools.
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm mb-2">Friendly heads-up:</p>
            <p className="text-gray-400 text-sm">
              This code editor needs a larger screen and a proper keyboard to
              work well. Your phone screen is just too small for a good coding
              experience.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-emerald-400 text-sm">
              Come back on a laptop, desktop, or tablet with keyboard. Your code
              (and fingers) will thank you!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PythonTutorVisualizationEditor.Root language={language}>
      <DemoContainer files={files} setFiles={setFiles} />
      <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-100">
        <EditorHeader
          onToggleSidebar={toggleSidebar}
          isDirty={isDirty}
          fileName={selectedProjectFile?.file.name}
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
                    <FileExplorer files={files} setFiles={setFiles} />
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors"
            />

            <ResizablePanel defaultSize={80} className="flex flex-col">
              <ResizablePanelGroup
                direction="vertical"
                className={cn("h-full", maximized ? "fixed inset-0 z-50" : "")}
              >
                <ResizablePanel defaultSize={70} className="min-h-[30%]">
                  <div className={"h-full w-full overflow-hidden"}>
                    {selectedProjectFile ? (
                      <div className="flex flex-col h-full">
                        <div className="px-4 py-1 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-300">
                              {selectedProjectFile.file.name}
                            </span>
                            {isDirty && (
                              <span className="ml-2 text-xs text-gray-500">
                                (unsaved)
                              </span>
                            )}
                          </div>

                          <Button
                            size="default"
                            variant="ghost"
                            className={`h-7 px-2 ${
                              aiSuggestionsEnabled
                                ? "text-yellow-400 hover:text-yellow-300"
                                : "text-gray-400 hover:text-gray-300"
                            } hover:bg-[#252525] transition-colors`}
                            onClick={toggleAiSuggestions}
                          >
                            <Lightbulb className="h-3.5 w-3.5 mr-1" />
                            AI Suggestions
                          </Button>
                          <div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-[#252525] transition-colors"
                              onClick={handleSaveFile}
                              disabled={saveFileDisabled}
                            >
                              <Save className="h-3.5 w-3.5 mr-1" />
                              Save
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-emerald-400 hover:bg-[#2a2a2a] transition-colors"
                              onClick={() => setMaximized(!maximized)}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {showAiSettingsPanel && (
                          <div className="px-4 py-2 border-b border-gray-500 bg-[#474545] flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-300 mr-3">
                                Enable AI suggestions
                              </span>
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
                        <ResizablePanelGroup
                          direction="horizontal"
                          className="h-full"
                        >
                          <ResizablePanel defaultSize={70}>
                            <div className="w-full h-full relative">
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
                                  quickSuggestions: {
                                    other: true,
                                    comments: true,
                                    strings: true,
                                  },
                                  suggestOnTriggerCharacters: true,
                                  autoClosingBrackets: "always",
                                  autoIndent: "full",
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
                                    showIssues: true,
                                  },
                                }}
                                loading={
                                  <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
                                    <div className="text-emerald-400">
                                      Loading editor...
                                    </div>
                                  </div>
                                }
                              />

                              <CodeSuggestion
                                ref={codeSuggestionRef}
                                code={fileContent}
                                editorRef={editorRef}
                                onApplySuggestion={setContent}
                                isEnabled={aiSuggestionsEnabled}
                              />
                            </div>
                          </ResizablePanel>
                          <ResizableHandle
                            withHandle
                            className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors"
                          />
                          <ResizablePanel defaultSize={30} className="w-1/3">
                            <PythonTutorVisualizationEditor.RenderVisual />
                          </ResizablePanel>
                        </ResizablePanelGroup>
                      </div>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-gray-400">
                        <p className="mb-2">No file selected</p>
                        <p className="text-sm">
                          Select a file from the explorer or create a new one
                        </p>
                      </div>
                    )}
                  </div>
                </ResizablePanel>

                <ResizableHandle
                  withHandle
                  className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors"
                />

                <ResizablePanel defaultSize={30} className="min-h-[15%]">
                  <TerminalPanel output={output} status={status} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </PythonTutorVisualizationEditor.Root>
  );
}
