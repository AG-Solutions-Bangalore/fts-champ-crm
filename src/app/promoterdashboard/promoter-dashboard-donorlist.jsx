import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DonorMembersTable = ({ data = [] }) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    {
      accessorKey: "indicomp_full_name",
      header: "Name",
      cell: ({ row }) => (
        <div className="text-xs font-medium">
          {row.original.indicomp_full_name}
        </div>
      ),
    },
    {
      accessorKey: "indicomp_mobile_phone",
      header: "Mobile",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.indicomp_mobile_phone}</div>
      ),
    },
    {
      accessorKey: "indicomp_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.indicomp_type}
        </Badge>
      ),
    },
    {
      accessorKey: "chapter_name",
      header: "Chapter",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.chapter_name || "-"}</div>
      ),
    },
    {
      accessorKey: "last_payment_date",
      header: "Last Receipt",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {moment(row.original.last_payment_date).format("DD MMM YYYY")}
        </Badge>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card className="px-4 py-2">
      <CardHeader className="pb-3 py-2">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base">Donors</CardTitle>

          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search members..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getAllColumns().map((column) => (
                <TableHead key={column.id} className="text-xs">
                  {column.columnDef.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-xs py-6"
                >
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </Card>
  );
};

export default DonorMembersTable;
