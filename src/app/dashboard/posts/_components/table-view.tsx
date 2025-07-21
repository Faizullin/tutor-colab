"use client";

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
import { Post } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, PlusIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Heading } from "../../_components/common/heading";

type QueryParams = Parameters<typeof trpc.post.adminList.useQuery>[0];

export function PostTableView() {
  const router = useRouter();
  const deleteConfirmDialogControl = useDeleteConfirmDialogControl<Post>({
    onConfirm: ({ items }) => {
      if (items?.length === 1) {
        deleteMutation.mutateAsync(items[0].id).then(() => {
          deleteConfirmDialogControl.close();
        });
      }
    },
  });

  const deleteConfirmDialogControlOpenWithData =
    deleteConfirmDialogControl.openWithData;
  const openDeleteDialog = useCallback(
    (obj: Post) => {
      deleteConfirmDialogControlOpenWithData({
        items: [obj],
      });
    },
    [deleteConfirmDialogControlOpenWithData]
  );

  const deleteMutation = trpc.post.adminDelete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Post deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete post. Please try again.");
    },
  });

  const openEdit = useCallback(
    (obj: Post) => {
      router.push(`/dashboard/posts/${obj.id}/`);
    },
    [router]
  );

  // Define columns
  const columns = useMemo<ColumnDef<Post>[]>(
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
        header: ({ column }: { column: Column<Post, unknown> }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row }) => (
          <Button
            variant="link"
            className={cn("w-full cursor-pointer")}
            onClick={() => openEdit(row.original)}
          >
            {row.original.id}
          </Button>
        ),
        enableHiding: false,
        enableSorting: true,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="truncate max-w-[200px]">{row.original.title}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <div className="truncate max-w-[150px]">
            {(row.original as any).owner?.username || "Unknown"}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<Post, unknown> }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
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
        header: ({ column }: { column: Column<Post, unknown> }) => (
          <DataTableColumnHeader column={column} title="Updated" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.updatedAt);
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
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => openEdit(obj)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit post</span>
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
    [openDeleteDialog, openEdit]
  );

  const [parsedData, setParsedData] = useState<Post[]>([]);
  const [parsedPagination, setParsedPagination] = useState({
    pageCount: 1,
  });

  // DataTable hook
  const { table } = useDataTable({
    data: parsedData,
    columns,
    pageCount: parsedPagination.pageCount,
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
    trpc.post.adminList.useQuery(queryParams);

  useEffect(() => {
    if (!data) return;
    const parsed =
      data.items.map((obj) => ({
        ...obj,
        createdAt: new Date(obj.createdAt),
        updatedAt: new Date(obj.updatedAt),
      })) || [];
    setParsedData(parsed as any);
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
        <Heading title="Posts" description="Manage your posts" />
        <Button
          onClick={() => router.push("/dashboard/posts/new")}
          className="h-8"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New Post
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
    </>
  );
}
