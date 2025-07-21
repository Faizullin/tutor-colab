"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import { Separator } from "@/components/ui/separator";
import { UserAccount } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { Column, ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Heading } from "../../_components/common/heading";

type QueryParams = Parameters<typeof trpc.user.adminList.useQuery>[0];

export function UserTableView() {
  // Define columns
  const columns = useMemo<ColumnDef<UserAccount>[]>(
    () => [
      //   {
      //     id: "select",
      //     header: ({ table }) => (
      //       <Checkbox
      //         checked={
      //           table.getIsAllPageRowsSelected() ||
      //           (table.getIsSomePageRowsSelected() && "indeterminate")
      //         }
      //         onCheckedChange={(value) =>
      //           table.toggleAllPageRowsSelected(!!value)
      //         }
      //         aria-label="Select all"
      //       />
      //     ),
      //     cell: ({ row }) => (
      //       <Checkbox
      //         checked={row.getIsSelected()}
      //         onCheckedChange={(value) => row.toggleSelected(!!value)}
      //         aria-label="Select row"
      //       />
      //     ),
      //     enableSorting: false,
      //     enableHiding: false,
      //   },
      {
        accessorKey: "id",
        header: ({ column }: { column: Column<UserAccount, unknown> }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row }) => (
          <div className={cn("w-full")}>{row.original.id}</div>
        ),
        enableHiding: false,
        enableSorting: true,
      },
      {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => (
          <div className="truncate max-w-[200px]">{row.original.username}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="truncate max-w-[200px]">{row.original.email}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <div className="truncate max-w-[100px]">{row.original.role}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<UserAccount, unknown> }) => (
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
        header: ({ column }: { column: Column<UserAccount, unknown> }) => (
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
        accessorKey: "uid",
        header: "UID",
        cell: ({ row }) => (
          <div className="truncate max-w-[200px]">{row.original.uid}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
    ],
    []
  );

  const [parsedData, setParsedData] = useState<UserAccount[]>([]);
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
  const { isLoading, data, error } = trpc.user.adminList.useQuery(queryParams);

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
        <Heading title="Users" description="List of registered users" />
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
    </>
  );
}
