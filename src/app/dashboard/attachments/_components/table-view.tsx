"use client";

import AttachmentUploadDialog, {
  useAttachmentUploadDialogControl,
} from "@/components/attachment/attachment-upload-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import DeleteConfirmDialog, {
  useDeleteConfirmDialogControl,
} from "@/components/resource/delete-confirm-dialog";
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
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { Column, ColumnDef } from "@tanstack/react-table";
import { EyeIcon, MoreHorizontal, PlusIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Heading } from "../../_components/common/heading";

type QueryParams = Parameters<typeof trpc.attachment.adminList.useQuery>[0];

export function TableView() {
  const uploadDialogControl = useAttachmentUploadDialogControl({
    onSuccess: () => {
      refetch();
      toast.success("Attachment uploaded successfully!");
    },
  });

  const deleteConfirmDialogControl = useDeleteConfirmDialogControl<Attachment>({
    onConfirm: ({ items }) => {
      if (items?.length === 1) {
        deleteMutation.mutateAsync(items[0].id).then(() => {
          deleteConfirmDialogControl.close();
        });
      }
    },
  });

  // Action handlers
  const openCreateSheet = useCallback(() => {
    uploadDialogControl.openWithData();
  }, [uploadDialogControl]);

  const deleteConfirmDialogControlOpenWithData =
    deleteConfirmDialogControl.openWithData;
  const openDeleteDialog = useCallback(
    (obj: Attachment) => {
      deleteConfirmDialogControlOpenWithData({
        items: [obj],
      });
    },
    [deleteConfirmDialogControlOpenWithData]
  );

  // Replace with your actual delete mutation
  const deleteMutation = trpc.attachment.adminDelete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Attachment deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete attachment. Please try again.");
    },
  });

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
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
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
        enableHiding: false,
        enableSorting: true,
      },
      {
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
                <EyeIcon className="h-4 w-4" />
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
      },
    ],
    [openDeleteDialog]
  );

  const [parsedData, setParsedData] = useState<Attachment[]>([]);
  const [parsedPageination, setParsedPagination] = useState({
    pageCount: 1,
  });
  // DataTable hook
  const { table } = useDataTable({
    data: parsedData,
    columns,
    pageCount: parsedPageination.pageCount,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
    getRowId: (row) => `${row.id}`,
  });

  const tableState = table.getState();
  const queryParams: QueryParams = useMemo(() => {
    const parsed = {
      filter: tableState.columnFilters.reduce((acc, filter) => {
        if (filter.value) {
          (acc as any)[filter.id] = filter.value;
        }
        return acc;
      }, {}),
      orderBy: { field: "id", direction: "desc" },
      pagination: {
        skip: tableState.pagination.pageIndex * tableState.pagination.pageSize,
        take: tableState.pagination.pageSize,
      },
    };
    if (tableState.sorting[0]) {
      parsed.orderBy = {
        field: tableState.sorting[0].id,
        direction: tableState.sorting[0].desc ? "desc" : "asc",
      };
    }
    return parsed as QueryParams;
  }, [tableState.sorting, tableState.pagination, tableState.columnFilters]);

  // Fetch data with trpc
  const { isLoading, data, error, refetch } =
    trpc.attachment.adminList.useQuery(queryParams);
  useEffect(() => {
    if (!data) return;
    const parsed =
      data.items.map((obj) => ({
        ...obj,
        createdAt: new Date(obj.createdAt),
        updatedAt: new Date(obj.updatedAt),
      })) || [];
    setParsedData(parsed);
    setParsedPagination({
      pageCount: Math.ceil(data.total / data.meta.take),
    });
  }, [data]);

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">Error loading</div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title="Attachments" description="Manage your attachments" />
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

      <DeleteConfirmDialog control={deleteConfirmDialogControl} />

      <AttachmentUploadDialog control={uploadDialogControl} />
    </>
  );
}
