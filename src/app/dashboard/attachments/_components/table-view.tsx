"use client";

import AttachmentUploadDialog from "@/components/attachment/attachment-upload-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import DeleteConfirmDialog from "@/components/resource/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Attachment } from "@/generated/prisma";
import { useControlDialog } from "@/hooks/use-control-dialog";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, PlusIcon, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type ActionType = "create" | "edit" | "delete";
interface Action {
  type: ActionType;
  obj?: Attachment;
  isOpen: boolean;
}

export function TableView() {
  const [currentAction, setCurrentAction] = useState<Action>({
    type: "create",
    obj: undefined,
    isOpen: false,
  });

  // Fetch data with trpc
  const { isLoading, data, error, refetch } = trpc.attachment.list.useQuery();

  const uploadDialogControl = useControlDialog<Attachment>();

  // Action handlers
  const openCreateSheet = useCallback(() => {
    uploadDialogControl.openWithData();
  }, [uploadDialogControl]);

  const openDeleteDialog = useCallback((obj: Attachment) => {
    setCurrentAction({ type: "delete", obj, isOpen: true });
  }, []);

  const closeAction = useCallback(() => {
    setCurrentAction((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Replace with your actual delete mutation
  const deleteMutation = trpc.attachment.delete.useMutation({
    onSuccess: () => {
      refetch();
      closeAction();
      toast.success("Attachment deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete attachment. Please try again.");
    },
  });

  const handleDeleteConfirm = useCallback(async () => {
    if (currentAction.obj) {
      deleteMutation.mutate({ id: currentAction.obj.id });
    }
  }, [currentAction.obj, deleteMutation]);

  // Define columns
  const columns = useMemo<ColumnDef<Attachment>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "id",
        header: ({ column }: { column: Column<Attachment, unknown> }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row }) => {
          const obj = row.original;
          return (
            <Button variant="link" className={cn("w-full cursor-pointer")}>
              {obj.id}
            </Button>
          );
        },
        size: 32,
        enableHiding: false,
      },
      {
        id: "originalName",
        accessorKey: "originalName",
        header: ({ column }: { column: Column<Attachment, unknown> }) => (
          <DataTableColumnHeader column={column} title="Original name" />
        ),
        cell: ({ row }) => {
          const obj = row.original;
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 text-left justify-start"
            >
              <div className="truncate max-w-[200px]">
                {obj.originalName || "Untitled"}
              </div>
            </Button>
          );
        },
        enableSorting: false,
        enableColumnFilter: true,
      },
      {
        accessorKey: "filename",
        header: "Stored Filename",
        sortable: true,
        filterable: true,
        enableHiding: true,
      },
      {
        accessorKey: "mimetype",
        header: "Type",
        sortable: true,
        filterable: true,
        cell: ({ row }) => {
          const mimetype = row.getValue("mimetype") as string;
          // You could map mimetypes to more friendly names or icons
          const typeMap: Record<string, string> = {
            "image/jpeg": "JPEG Image",
            "image/png": "PNG Image",
            "application/pdf": "PDF Document",
            "text/plain": "Text File",
            // Add more as needed
          };
          return typeMap[mimetype] || mimetype;
        },
      },

      {
        accessorKey: "size",
        header: "Size",
        sortable: true,
        cell: ({ row }) => {
          const size = parseFloat(row.getValue("size"));
          // Convert bytes to KB, MB, GB
          if (size < 1024) return `${size} Bytes`;
          if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
          if (size < 1024 * 1024 * 1024)
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
          return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        },
      },
      {
        accessorKey: "ownerId",
        header: "Owner",
        sortable: true,
        filterable: true, // You might filter by owner ID or name (if included)
        cell: ({ row }) => {
          // If you included owner in the Prisma query, you'd access row.original.owner.name
          return row.getValue("ownerId") || "N/A"; // Or 'row.original.owner?.name'
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<Attachment, unknown> }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
          const obj = row.original;
          const date =
            obj.createdAt instanceof Date
              ? obj.createdAt
              : new Date(obj.createdAt);
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "updatedAt",
        accessorKey: "updatedAt",
        header: ({ column }: { column: Column<Attachment, unknown> }) => (
          <DataTableColumnHeader column={column} title="Updated" />
        ),
        cell: ({ row }) => {
          const obj = row.original;
          const date =
            obj.updatedAt instanceof Date
              ? obj.updatedAt
              : new Date(obj.updatedAt);
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const obj = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit attachment</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onSelect={() => openDeleteDialog(obj)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 100,
      },
    ],
    [openDeleteDialog]
  );

  const parsed = useMemo(() => {
    return (
      data?.items.map((obj) => ({
        ...obj,
        createdAt: new Date(obj.createdAt),
        updatedAt: new Date(obj.updatedAt),
      })) || []
    );
  }, [data]);

  // DataTable hook
  const { table } = useDataTable({
    data: parsed,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => `${row.id}`,
  });

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">Error loading</div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between">
        {/* <Heading
        title="Attachments"
        description="Manage your attachments"
        /> */}
        <Button onClick={openCreateSheet}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
      <Separator />

      <div className="data-table-container">
        {isLoading ? (
          <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
        ) : (
          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={currentAction.isOpen && currentAction.type === "delete"}
        onOpenChange={closeAction}
        onConfirm={handleDeleteConfirm}
      />

      <AttachmentUploadDialog control={uploadDialogControl} />
    </>
  );
}
