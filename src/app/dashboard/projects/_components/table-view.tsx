"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { Column, ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Heading } from "../../_components/common/heading";
import {
  CreateProjectDialog,
  useCreateProjectDialogControl,
} from "./create-project-dialog";

type QueryParams = Parameters<typeof trpc.project.adminList.useQuery>[0];

export function ProjectTableView() {
  const createProjectDialogControl = useCreateProjectDialogControl();

  // Define columns
  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }: { column: Column<Project, unknown> }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row }) => (
          <div className={cn("w-full")}>{row.original.id}</div>
        ),
        enableHiding: false,
        enableSorting: true,
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <div className="truncate max-w-[200px]">{row.original.slug}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="truncate max-w-[200px]">{row.original.name}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="truncate max-w-[300px]">
            {row.original.description || ""}
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: true,
      },
      {
        accessorKey: "ownerId",
        header: "Owner",
        cell: ({ row }) => (
          <div className="truncate max-w-[150px]">{row.original.ownerId}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<Project, unknown> }) => (
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
        header: ({ column }: { column: Column<Project, unknown> }) => (
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
    ],
    []
  );

  const [parsedData, setParsedData] = useState<Project[]>([]);
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
  const { isLoading, data, error } =
    trpc.project.adminList.useQuery(queryParams);

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
        <Heading title="Projects" description="List of projects" />
        <Button onClick={() => createProjectDialogControl.openWithData()}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      <Separator />

      <div className="data-table-container">
        {isLoading ? (
          <DataTableSkeleton columnCount={7} rowCount={8} filterCount={2} />
        ) : (
          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        )}
      </div>
      <CreateProjectDialog control={createProjectDialogControl} />
    </>
  );
}
