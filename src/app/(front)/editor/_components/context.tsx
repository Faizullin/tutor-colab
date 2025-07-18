"use client";

import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

// --- Types ---
export interface FileType {
    id: string;
    name: string;
    path: string;
    content?: string;
}

export interface ProjectType {
    id: string;
    name: string;
    files: FileType[];
    ownerId: number;
}

export interface ProjectEditorContextType {
    projectId?: string | string[];
    project: ProjectType | null;
    files: FileType[];
    currentFileId: string | null;
    editorContent: string;
    loading: boolean;
    saveStatus: string;
    isDirty: boolean;
    setEditorContent: (value: string) => void;
    selectFile: (id: string) => void;
    saveFile: () => Promise<void>;
    addNewFile: (fileName: string) => Promise<FileType | null>;
}

interface ProjectEditorProviderProps {
    children: ReactNode;
    slug: string;
}

// Create the Context
const ProjectEditorContext = createContext<ProjectEditorContextType | null>(null);

// Custom Hook to consume the context
export const useProjectEditor = () => {
    const context = useContext(ProjectEditorContext);
    if (context === null) {
        throw new Error('useProjectEditor must be used within a ProjectEditorProvider');
    }
    return context;
};

// Provider Component
export const ProjectEditorProvider = ({ children, slug }: ProjectEditorProviderProps) => {
    const router = useRouter();

    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [editorContent, setEditorContent] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [isDirty, setIsDirty] = useState<boolean>(false);

    // tRPC queries
    const projectQuery = trpc.project.getBySlug.useQuery(
        { slug: slug },
        { enabled: !!slug }
    );
    const fileQuery = trpc.file.getById.useQuery(
        { id: currentFileId as string },
        { enabled: !!currentFileId }
    );

    // tRPC mutations
    const updateFileMutation = trpc.file.update.useMutation();
    const createFileMutation = trpc.file.create.useMutation();

    // Sync project/files
    useEffect(() => {
        if (projectQuery.data) {
            if (!currentFileId && projectQuery.data.files.length > 0) {
                setCurrentFileId(projectQuery.data.files[0].id);
            }
        }
    }, [projectQuery.data, currentFileId]);

    // Sync file content
    useEffect(() => {
        if (fileQuery.data) {
            setEditorContent(fileQuery.data.content || '');
            setIsDirty(false);
        }
    }, [fileQuery.data]);

    const handleEditorChange = useCallback((value: string) => {
        setEditorContent(value);
        setSaveStatus('');
        setIsDirty(true);
    }, []);

    const saveFileContent = useCallback(async () => {
        if (!currentFileId) {
            alert('No file selected to save.');
            return;
        }
        setSaveStatus('saving');
        try {
            await updateFileMutation.mutateAsync({
                id: currentFileId,
                content: editorContent,
            });
            setSaveStatus('saved');
            setIsDirty(false);
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
            setSaveStatus('error');
            alert('Failed to save file.');
        }
    }, [currentFileId, editorContent, updateFileMutation]);

    const addNewFile = useCallback(async (fileName: string) => {
        if (!projectQuery.data) return null;
        if (!fileName.trim()) {
            alert('File name cannot be empty.');
            return null;
        }
        try {
            const newFile = await createFileMutation.mutateAsync({
                projectId: projectId as string,
                name: fileName,
                path: `/${fileName}`,
            });
            setCurrentFileId(newFile.id);
            setEditorContent('');
            setSaveStatus('');
            setIsDirty(false);
            alert('File created successfully!');
            return newFile;
        } catch (error) {
            alert('Failed to create file.');
            return null;
        }
    }, [projectQuery.data, projectId, createFileMutation]);

    const contextValue: ProjectEditorContextType = {
        projectId,
        project: projectQuery.data ?? null,
        files: projectQuery.data?.files ?? [],
        currentFileId,
        editorContent,
        loading: projectQuery.isLoading || fileQuery.isLoading,
        saveStatus,
        isDirty,
        setEditorContent: handleEditorChange,
        selectFile: setCurrentFileId,
        saveFile: saveFileContent,
        addNewFile,
    };

    return (
        <ProjectEditorContext.Provider value={contextValue}>
            {children}
        </ProjectEditorContext.Provider>
    );
};