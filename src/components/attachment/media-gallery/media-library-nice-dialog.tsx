import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NiceModal, {
  NiceModalHocPropsExtended,
} from "@/store/nice-modal-context";
import { Attachment } from "@/generated/prisma";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  File,
  FileAudio,
  FileImage,
  FileVideo,
  Filter,
  Library,
  Search,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "image":
      return <FileImage className="w-8 h-8 text-blue-500" />;
    case "video":
      return <FileVideo className="w-8 h-8 text-purple-500" />;
    case "audio":
      return <FileAudio className="w-8 h-8 text-green-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

const getFileTypeFromMimeType = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  else if (mimeType.startsWith("video/")) return "video";
  else if (mimeType.startsWith("audio/")) return "audio";
  else if (mimeType === "application/json") return "json";
  else if (mimeType === "application/pdf") return "document";
  else if (mimeType === "text/plain") return "document";
  return "document";
};

const MediaLibraryNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    args: {
      objectId: Attachment["objectId"];
      objectType: Attachment["objectType"];
      config?: {
        initialFileType?:
          | "all"
          | "image"
          | "video"
          | "audio"
          | "document"
          | "json";
      };
    };
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const [activeTab, setActiveTab] = useState("attachments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState<string>("all");
  const [filterByCurrentObject, setFilterByCurrentObject] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(20);

  const staticFileTypeFilters = useMemo(() => {
    return [
      { label: "All", value: "all" },
      { label: "Images", value: "image" },
      { label: "Videos", value: "video" },
      { label: "Audio", value: "audio" },
      { label: "Documents", value: "document" },
      { label: "JSON", value: "json" },
    ];
  }, []);

  const filterParams = useMemo(() => {
    const filter: any = {};

    if (searchQuery.trim()) {
      filter.name = searchQuery.trim();
    }

    if (selectedFileType !== "all") {
      // Map file type to mime type pattern for filtering
      const typeMapping: Record<string, string> = {
        image: "image",
        video: "video",
        audio: "audio",
        document: "pdf",
        json: "json",
      };
      if (typeMapping[selectedFileType]) {
        filter.type = typeMapping[selectedFileType];
      }
    }

    if (
      filterByCurrentObject &&
      props.args?.objectId &&
      props.args?.objectType
    ) {
      filter.objectId = props.args.objectId;
      filter.objectType = props.args.objectType;
    }

    return {
      filter,
      orderBy: {
        field: "createdAt",
        direction: "desc",
      },
      pagination: {
        skip: currentPage * itemsPerPage,
        take: itemsPerPage,
      },
    };
  }, [
    searchQuery,
    selectedFileType,
    filterByCurrentObject,
    props.args,
    currentPage,
    itemsPerPage,
  ]); // Fetch media using tRPC
  const mediaListQuery = trpc.attachment.adminList.useQuery(filterParams as any);
  const mediaDeleteMutation = trpc.attachment.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Media deleted successfully");
      mediaListQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete media: ${error.message}`);
    },
  });

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (!file) {
        throw new Error("No file selected for upload");
      }
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (props.args.objectType) {
          formData.append("objectType", props.args.objectType);
        }
        if (props.args.objectId) {
          formData.append("objectId", props.args.objectId.toString());
        }
        // POST to the new upload API route
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (response.ok && result.attachment) {
          toast.success("Media uploaded successfully");
          mediaListQuery.refetch();
          setSelectedFile(null);
          setCurrentPage(0); // Reset to first page to see new upload
          setActiveTab("attachments");
        } else {
          toast.error(`Failed to upload media: ${result.message || result.error}`);
        }
      } catch (error) {
        toast.error(
          `Failed to upload media: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsUploading(false);
      }
    },
    [props.args, mediaListQuery]
  );

  const { mutateAsync: mediaDeleteMutateAsync } = mediaDeleteMutation;
  const handleDeleteFile = useCallback(
    async (attachmentId: Attachment["id"]) => {
      setIsDeleting(true);
      try {
        await mediaDeleteMutateAsync(attachmentId);
      } finally {
        setIsDeleting(false);
      }
    },
    [mediaDeleteMutateAsync]
  );

  // Debounced search handler
  const debouncedSetSearchQuery = useDebouncedCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page when searching
  }, 400);

  const handleSearch = useCallback(
    (query: string) => {
      debouncedSetSearchQuery(query);
    },
    [debouncedSetSearchQuery]
  );

  const handleFileTypeChange = useCallback((value: string) => {
    setSelectedFileType(value);
    setCurrentPage(0); // Reset to first page when changing filter
  }, []);

  const handleObjectFilterChange = useCallback((checked: boolean) => {
    setFilterByCurrentObject(checked);
    setCurrentPage(0); // Reset to first page when changing filter
  }, []);

  const onSelectMedia = useCallback(
    (media: Attachment) => {
      modal.resolve({
        result: {
          record: media,
        },
        reason: "submit",
      });
      modal.hide();
    },
    [modal]
  );

  const handleDeleteMedia = useCallback(
    async (mediaId: number) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this media file? This action cannot be undone."
      );
      if (!confirmed) {
        return;
      }
      await handleDeleteFile(mediaId);
    },
    [handleDeleteFile]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
      }
    },
    []
  );
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    await handleUploadFile(selectedFile);
  }, [selectedFile, handleUploadFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Enhanced view/download handlers
  const handleViewMedia = useCallback((media: Attachment) => {
    if (media.url) {
      window.open(media.url, "_blank");
    } else {
      toast.error("Media URL not available");
    }
  }, []);

  const handleDownloadMedia = useCallback((media: Attachment) => {
    if (media.url) {
      const link = document.createElement("a");
      link.href = media.url;
      link.download = media.originalName || media.filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("Media URL not available for download");
    }
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }, []);

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setActiveTab("attachments");
        setSearchQuery("");
        setSelectedFileType("all");
        setFilterByCurrentObject(false);
        setCurrentPage(0);
        setDragActive(false);
        setSelectedFile(null);
        modal.resolve({
          reason: "close",
        });
        modal.hide();
      }
    },
    [modal]
  );

  useEffect(() => {
    if (props.args.config?.initialFileType) {
      setSelectedFileType(props.args.config.initialFileType);
    }
  }, [props.args]);

  const renderMediaContent = () => {
    if (mediaListQuery.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-muted-foreground">Loading media...</div>
        </div>
      );
    }

    if (mediaListQuery.isError) {
      return (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <div className="text-red-500">
            <File className="h-12 w-12 mx-auto mb-2" />
          </div>
          <div className="text-sm text-center">
            <div className="font-medium text-red-600 mb-2">
              Failed to load media
            </div>
            <div className="text-muted-foreground">
              {mediaListQuery.error instanceof Error
                ? mediaListQuery.error.message
                : "Something went wrong"}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mediaListQuery.refetch()}
            disabled={mediaListQuery.isFetching}
          >
            {mediaListQuery.isFetching ? "Retrying..." : "Try Again"}
          </Button>
        </div>
      );
    }

    const attachments = mediaListQuery.data?.items || [];
    const total = mediaListQuery.data?.total || 0;
    const totalPages = Math.ceil(total / itemsPerPage);
    const hasNextPage = currentPage < totalPages - 1;
    const hasPreviousPage = currentPage > 0;

    if (attachments.length === 0) {
      return (
        <div className="text-center py-12">
          <File className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery || selectedFileType !== "all" || filterByCurrentObject
              ? "No media found matching your criteria"
              : "No media files available"}
          </p>
          {!searchQuery &&
            selectedFileType === "all" &&
            !filterByCurrentObject && (
              <Button
                variant="outline"
                onClick={() => setActiveTab("upload")}
                className="mt-4"
              >
                Upload your first file
              </Button>
            )}
        </div>
      );
    }

    // Smaller cards: less padding, smaller icon, tighter layout
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 px-1">
          {attachments.map((media) => {
            const fileType = getFileTypeFromMimeType(media.mimetype);

            return (
              <Card
                key={media.id}
                className="group hover:shadow-md transition-all duration-200 border-gray-100 hover:border-gray-200 bg-white/80 backdrop-blur-sm cursor-pointer"
                onClick={() => onSelectMedia(media)}
              >
                <CardContent className="p-2">
                  {/* Media Preview */}
                  <div className="aspect-square bg-gray-50 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                    {fileType === "image" && media.url ? (
                      <Image
                        src={media.url}
                        alt={media.originalName || "Media file"}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="flex flex-col items-center justify-center w-full h-full text-gray-400"
                      style={{
                        display:
                          fileType === "image" && media.url ? "none" : "flex",
                      }}
                    >
                      {getFileIcon(fileType)}
                    </div>
                  </div>
                  {/* Media Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate max-w-[80px]">
                        {media.originalName || media.filename || "Unnamed"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMedia(media.id);
                        }}
                        disabled={isDeleting}
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0"
                      >
                        {fileType}
                      </Badge>
                      <span className="text-[9px] text-gray-400 ml-auto">
                        {formatFileSize(media.size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMedia(media);
                        }}
                        className="h-5 w-5 p-0"
                        disabled={!media.url}
                        title="View"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMedia(media);
                        }}
                        className="h-5 w-5 p-0"
                        disabled={!media.url}
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {currentPage * itemsPerPage + 1} to{" "}
              {Math.min((currentPage + 1) * itemsPerPage, total)} of {total}{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={!hasPreviousPage || mediaListQuery.isLoading}
                className="h-8 px-3"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageIndex;
                  if (totalPages <= 5) {
                    pageIndex = i;
                  } else if (currentPage <= 2) {
                    pageIndex = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageIndex = totalPages - 5 + i;
                  } else {
                    pageIndex = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageIndex}
                      variant={
                        currentPage === pageIndex ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageIndex)}
                      disabled={mediaListQuery.isLoading}
                      className="h-8 w-8 p-0"
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={!hasNextPage || mediaListQuery.isLoading}
                className="h-8 px-3"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={modal.visible} onOpenChange={handleOnOpenChange}>
      <DialogContent className="!max-w-[900px] max-h-[700px] h-[700px] overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Manage Media Library
            {activeTab === "attachments" &&
              !mediaListQuery.isLoading &&
              mediaListQuery.data && (
                <Badge variant="outline" className="ml-2 text-sm">
                  {mediaListQuery.data?.total || 0} total
                </Badge>
              )}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50/80 rounded-lg p-1">
            <TabsTrigger
              value="attachments"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Library className="h-4 w-4 mr-2" />
              Attachments
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="attachments"
            className="space-y-6 overflow-y-auto max-h-[540px] h-[540px]"
          >
            {/* Filters Section */}

            <div className="space-y-4 p-4 bg-gray-50/50 rounded-xl backdrop-blur-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search media..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={selectedFileType}
                  onValueChange={handleFileTypeChange}
                >
                  <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="File type" />
                  </SelectTrigger>
                  <SelectContent>
                    {staticFileTypeFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        <div className="flex items-center gap-2">
                          {filter.value === "image" && (
                            <FileImage className="h-4 w-4" />
                          )}
                          {filter.value === "audio" && (
                            <FileAudio className="h-4 w-4" />
                          )}
                          {filter.value === "video" && (
                            <FileVideo className="h-4 w-4" />
                          )}
                          {filter.value === "all" && (
                            <Filter className="h-4 w-4" />
                          )}
                          <span>{filter.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>{" "}
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <Checkbox
                    id="filter-current-object"
                    checked={filterByCurrentObject}
                    onCheckedChange={handleObjectFilterChange}
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="filter-current-object"
                    className="text-sm font-medium text-gray-700"
                  >
                    Show only media from current object
                  </Label>
                </div>
              </div>
            </div>
            {/* Media Content */}
            <div
              className={`transition-all duration-300 ${
                dragActive && activeTab === "attachments"
                  ? "border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-xl p-4"
                  : ""
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => {
                handleDrop(e);
                if (selectedFile) {
                  handleUploadFile(selectedFile);
                }
              }}
            >
              {dragActive && activeTab === "attachments" && (
                <div className="absolute inset-4 bg-blue-100/80 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-blue-900">
                      Drop files here to upload
                    </p>
                  </div>
                </div>
              )}
              {renderMediaContent()}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="p-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-400 bg-blue-50/50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/30"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.7z"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Support for images, documents, videos, and more
                    </p>

                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <h4 className="font-medium mb-2 text-blue-900">
                    Selected File
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1 mr-2 text-sm">
                      {selectedFile.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                </div>
              )}{" "}
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>{" "}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                  }}
                  disabled={isUploading}
                >
                  Clear
                </Button>
              </div>
              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Upload Guidelines
                </h4>{" "}
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Maximum file size: 50MB per file</li>
                  <li>
                    • Supported formats: Images, Documents, Videos, Audio,
                    Archives
                  </li>
                  <li>• Files are automatically organized by type and date</li>
                  <li>
                    • Drag and drop files directly onto the attachments tab for
                    quick upload
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
});

export default MediaLibraryNiceDialog;
