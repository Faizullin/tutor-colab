"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/utils/trpc";
import { Edit, FileCode, Plus, RefreshCw, Trash2Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useProjectEditor } from "./context";
import { EditProjectFile } from "./types";

interface FileExplorerItemProps {
  item: EditProjectFile;
  level?: number;
  onFileSelect?: (file: EditProjectFile) => void;
  onDeleteFile?: (file: EditProjectFile) => void;
  onEditFile?: (file: EditProjectFile) => void;
  selectedFile?: EditProjectFile | null;
}

function FileExplorerItem({
  item,
  level = 0,
  onFileSelect,
  onDeleteFile,
  onEditFile,
  selectedFile,
}: FileExplorerItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedFile && selectedFile.uid === item.uid;

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 hover:bg-[#252525] ${
        isSelected ? "bg-[#2a2a2a] border-l-2 border-emerald-400" : ""
      } text-gray-300 hover:text-white rounded cursor-pointer group transition-colors`}
      style={{ paddingLeft: `${level * 8 + 8}px` }}
      onClick={() => onFileSelect && onFileSelect(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FileCode className="w-4 h-4 text-emerald-400" />
      <span className="text-sm truncate flex-grow">{item.file.name}</span>
      {isHovered && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onEditFile?.(item);
            }}
            title="Edit File"
          >
            <Edit className="w-3.5 h-3.5 text-gray-400 hover:text-emerald-400 transition-colors" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile?.(item);
            }}
            title="Delete File"
          >
            <Trash2Icon className="w-3.5 h-3.5 text-gray-400 hover:text-red-400 transition-colors" />
          </Button>
        </>
      )}
    </div>
  );
  // return (
  //   <div>
  //     <div
  //       className="flex items-center gap-1 px-2 py-1 hover:bg-[#252525] text-gray-300 hover:text-white rounded cursor-pointer group transition-colors"
  //       style={{ paddingLeft: `${level * 8 + 4}px` }}
  //       onClick={() => setExpanded(!expanded)}
  //     >
  //       {expanded ? (
  //         <ChevronDown className="w-3.5 h-3.5" />
  //       ) : (
  //         <ChevronRight className="w-3.5 h-3.5" />
  //       )}
  //       {expanded ? (
  //         <FolderOpen className="w-4 h-4 text-emerald-600" />
  //       ) : (
  //         <Folder className="w-4 h-4 text-emerald-600" />
  //       )}
  //       <span className="text-sm font-medium">{item.file.name}</span>
  //     </div>
  //      {expanded &&
  //       item.children?.map((child) => (
  //         <FileExplorerItem
  //           key={child.name}
  //           files={child}
  //           level={level + 1}
  //           onFileSelect={onFileSelect}
  //           onDeleteFile={onDeleteFile}
  //           onEditFile={onEditFile}
  //           selectedFile={selectedFile}
  //         />
  //       ))}
  //   </div>
  // );
}

export default function FileExplorer({
  files,
  setFiles,
}: {
  files: EditProjectFile[];
  setFiles: Dispatch<SetStateAction<EditProjectFile[]>>;
}) {
  const trpcUtils = trpc.useUtils();
  const {
    addProjectFileMutation,
    currentEditProjectFileUid,
    setCurrentEditProjectFileUid,
    project,
    deleteProjectFileMutation,
    loading,
    saveProjectFileContentMutation,
    demo,
  } = useProjectEditor();
  // const [searchTerm, setSearchTerm] = useState("");
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [isFileLimitModalOpen, setIsFileLimitModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileToDelete, setFileToDelete] = useState<EditProjectFile | null>(
    null
  );
  const [fileToEdit, setFileToEdit] = useState<EditProjectFile | null>(null);
  const session = useSession();

  const handleCreateFile = async () => {
    if (!fileName.trim()) {
      toast.error("Please enter a file name!");
      return;
    }

    if (session.status !== "authenticated" || demo) {
      const newFile: EditProjectFile = {
        uid: `${Date.now()}-${fileName}`,
        synced: false,
        file: {
          name: fileName,
          content: "",
          language: "",
        },
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      // EditorStorageService.setStorageData();

      toast.success("File created locally!");
      setIsNewFileModalOpen(false);
      setFileName("");
      setCurrentEditProjectFileUid(newFile.uid);
      return;
    }

    try {
      await addProjectFileMutation.mutateAsync({
        language: "plaintext", // Default language, can be changed later
        name: fileName,
        projectId: project!.id,
      });
      toast.success("File created successfully!");
      setIsNewFileModalOpen(false);
      setFileName("");
      trpcUtils.project.protectedUserProjectFileList.invalidate(project!.id);
    } catch (error: any) {
      if (error.status === 403) {
        setIsNewFileModalOpen(false);
        // setIsFileLimitModalOpen(true);
      } else {
        toast.error("Failed to create file.");
        console.error("Error creating file:", error);
      }
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    if (session.status !== "authenticated" || demo) {
      // Delete file locally for unauthenticated users
      const updatedFiles = files.filter((f) => f.uid !== fileToDelete.uid);
      setFiles(updatedFiles);
      // localStorage.setItem("localFiles", JSON.stringify(updatedFiles));

      toast.success("File deleted locally!");
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
      return;
    }
    if (!fileToDelete.synced) {
      throw new Error(`fileToDelete  must be synced`);
    }

    try {
      await deleteProjectFileMutation.mutateAsync(fileToDelete.file.id);
      toast.success("File deleted successfully!");
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
      trpcUtils.project.protectedUserProjectFileList.invalidate(project!.id);
    } catch (error) {
      toast.error("Failed to delete file.");
      console.error("Error deleting file:", error);
    }
  };

  const saveMutationAsync = saveProjectFileContentMutation.mutateAsync;
  const handleRename = async () => {
    if (!fileToEdit) {
      toast.error("No file selected for editing.");
      return;
    }
    if (!fileName.trim()) {
      toast.error("File name cannot be empty.");
      return;
    }
    if (!fileToEdit.synced) {
      throw new Error(`fileToEdit must be synced`);
    }
    if (session.status !== "authenticated" || demo) {
      // Edit file locally for unauthenticated users
      const updatedFiles = files.map((f) =>
        f.uid === fileToEdit.uid ? { ...f, name: fileName } : f
      );
      setFiles(updatedFiles);
      toast.success(`File renamed to "${fileName}" locally!`);
      setIsEditModalOpen(false);
      setFileToEdit(null);
      setFileName("");
      return;
    }
    try {
      await saveMutationAsync({
        id: fileToEdit.file.id,
        name: fileName,
      });
      toast.success(`File renamed to "${fileName}" successfully!`);
      setIsEditModalOpen(false);
      setFileToEdit(null);
      setFileName("");
      trpcUtils.project.protectedUserProjectFileList.invalidate(project!.id);
    } catch {
      toast.error("Failed to rename file.");
    }
  };

  const handleFileSelect = (file: EditProjectFile) => {
    setCurrentEditProjectFileUid(file.uid);
  };

  const initiateFileDelete = (file: EditProjectFile) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const initiateFileEdit = (file: EditProjectFile) => {
    setFileToEdit(file);
    setFileName(file.file.name);
    setIsEditModalOpen(true);
  };

  // const filteredFiles =
  //   searchTerm.trim() === ""
  //     ? files
  //     : files
  //         .map((folder) => {
  //           if (folder.type === "folder") {
  //             const filteredChildren = folder.children?.filter((file) =>
  //               file.name.toLowerCase().includes(searchTerm.toLowerCase())
  //             );

  //             return {
  //               ...folder,
  //               children: filteredChildren,
  //               expanded:
  //                 filteredChildren && filteredChildren.length > 0
  //                   ? true
  //                   : folder.expanded,
  //             };
  //           }
  //           return folder;
  //         })
  //         .filter(
  //           (folder) =>
  //             folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //             (folder.children && folder.children.length > 0)
  //         );

  const selectedFile = useMemo(
    () => files.find((i) => i.uid === currentEditProjectFileUid) || null,
    [currentEditProjectFileUid, files]
  );
  const handleFetchAll = useCallback(() => {
    trpcUtils.project.protectedUserProjectFileList.invalidate(project!.id);
  }, [project, trpcUtils.project.protectedUserProjectFileList]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] relative">
      <div className="p-2 border-b border-gray-800 flex justify-between items-center">
        <span className="text-gray-300 text-sm font-medium">EXPLORER</span>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-gray-400 hover:text-emerald-400 hover:bg-[#252525] transition-colors"
            onClick={() => setIsNewFileModalOpen(true)}
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          {session.status === "authenticated" && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-gray-400 hover:text-emerald-400 hover:bg-[#252525] transition-colors"
              onClick={handleFetchAll}
              disabled={loading || demo}
              title="Refresh"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      </div>
      {/* 
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            className="h-7 pl-8 text-sm bg-[#252525] border-gray-800 text-gray-300 placeholder:text-gray-500 focus:border-emerald-600 focus:ring-emerald-600 focus:ring-opacity-20"
            placeholder="Search files"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div> */}

      <ScrollArea className="flex-1 overflow-auto">
        {files.length > 0 ? (
          files.map((file) => (
            <FileExplorerItem
              key={file.uid}
              item={file}
              onFileSelect={handleFileSelect}
              onDeleteFile={initiateFileDelete}
              onEditFile={initiateFileEdit}
              selectedFile={selectedFile}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 p-4 text-sm">
            {loading ? "Loading files..." : "No files found"}
          </div>
        )}
      </ScrollArea>

      {/* Create File Dialog */}
      <Dialog open={isNewFileModalOpen} onOpenChange={setIsNewFileModalOpen}>
        <DialogContent className="bg-[#1e1e1e] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Create a New File</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter file name (e.g. main.js)"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-[#252525] border-gray-800 text-white focus:border-emerald-600 focus:ring-emerald-600 focus:ring-opacity-20"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
              onClick={() => setIsNewFileModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFile}
              className="bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit File Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#1e1e1e] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new name for &quot;{fileToEdit?.file.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter new file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-[#252525] border-gray-800 text-white focus:border-emerald-600 focus:ring-emerald-600 focus:ring-opacity-20"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              className="bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1e1e1e] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete &quot;{fileToDelete?.file.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFile}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
