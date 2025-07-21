"use client";

import { SupportedLanguage } from "@/utils/editor-config";
import { trpc } from "@/utils/trpc";
import { editor } from "monaco-editor";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  ReactNode,
  RefObject,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import { EditProjectFile, ProjectRouterOutputs } from "./types";

interface ProjectEditorContextType {
  project: ProjectRouterOutputs | null;
  currentEditProjectFileUid: EditProjectFile["uid"] | null;
  loading: boolean;
  setCurrentEditProjectFileUid: Dispatch<
    SetStateAction<EditProjectFile["uid"] | null>
  >;
  projectFileListQuery: ReturnType<
    typeof trpc.project.protectedUserProjectFileList.useQuery
  >;
  saveProjectFileContentMutation: ReturnType<
    typeof trpc.project.protectedSaveProjectFileContent.useMutation
  >;
  addProjectFileMutation: ReturnType<
    typeof trpc.project.protectedAddProjectFile.useMutation
  >;
  deleteProjectFileMutation: ReturnType<
    typeof trpc.project.protectedDeleteProjectFile.useMutation
  >;
  demo?: boolean;
}

interface ProjectEditorProviderProps {
  children: ReactNode;
  initialData?: ProjectRouterOutputs;
  demo?: boolean;
}

// Create the Context
const ProjectEditorContext = createContext<ProjectEditorContextType | null>(
  null
);

// Custom Hook to consume the context
export const useProjectEditor = () => {
  const context = useContext(ProjectEditorContext);
  if (context === null) {
    throw new Error(
      "useProjectEditor must be used within a ProjectEditorProvider"
    );
  }
  return context;
};

// Provider Component
export const ProjectEditorProvider = ({
  children,
  initialData,
  demo,
}: ProjectEditorProviderProps) => {
  const [currentEditProjectFileUid, setCurrentEditProjectFileUid] = useState<
    EditProjectFile["uid"] | null
  >(null);
  const projectFileListQuery =
    trpc.project.protectedUserProjectFileList.useQuery(initialData?.id as any, {
      enabled: !!initialData && !demo,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    });

  const saveProjectFileContentMutation =
    trpc.project.protectedSaveProjectFileContent.useMutation();

  const addProjectFileMutation =
    trpc.project.protectedAddProjectFile.useMutation();

  const deleteProjectFileMutation =
    trpc.project.protectedDeleteProjectFile.useMutation();

  const contextValue: ProjectEditorContextType = {
    project: initialData ?? null,
    currentEditProjectFileUid,
    setCurrentEditProjectFileUid,
    loading: projectFileListQuery.isLoading,
    saveProjectFileContentMutation,
    addProjectFileMutation,
    deleteProjectFileMutation,
    projectFileListQuery,
    demo,
  };

  return (
    <ProjectEditorContext.Provider value={contextValue}>
      {children}
    </ProjectEditorContext.Provider>
  );
};

type RunStatus = "idle" | "success" | "error";

interface ProjectEditorContentContextType {
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  language: SupportedLanguage;
  setLanguage: Dispatch<SetStateAction<SupportedLanguage>>;
  status: RunStatus;
  setStatus: Dispatch<SetStateAction<RunStatus>>;
  output: string;
  setOutput: Dispatch<SetStateAction<string>>;
  editorRef: RefObject<editor.IStandaloneCodeEditor | null>;
}

const ProjectEditorContentContext =
  createContext<ProjectEditorContentContextType>({
    code: "",
    setCode: function (): void {
      throw new Error("Function not implemented.");
    },
    language: "javascript",
    setLanguage: function (): void {
      throw new Error("Function not implemented.");
    },
    status: "idle",
    setStatus: function (): void {
      throw new Error("Function not implemented.");
    },
    output: "",
    setOutput: function (): void {
      throw new Error("Function not implemented.");
    },
    editorRef: { current: null },
  });

export const useProjectEditorContent = () => {
  const context = useContext(ProjectEditorContentContext);
  if (context === null) {
    throw new Error(
      "useProjectEditorContent must be used within a ProjectEditorContentProvider"
    );
  }
  return context;
};

export const ProjectEditorContentProvider = ({
  children,
}: PropsWithChildren) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [output, setOutput] = useState("");

  return (
    <ProjectEditorContentContext.Provider
      value={{
        editorRef,
        code,
        setCode,
        language,
        setLanguage,
        status,
        setStatus,
        output,
        setOutput,
      }}
    >
      {children}
    </ProjectEditorContentContext.Provider>
  );
};
