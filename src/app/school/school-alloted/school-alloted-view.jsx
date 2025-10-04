import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMutation } from "@/hooks/use-get-mutation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SCHOOL_ALLOT_VIEW_LIST } from "../../../api";
import { decryptId } from "@/utils/encyrption/encyrption";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const TableShimmer = ({ columns, rows = 7 }) =>
  Array.from({ length: rows }).map((_, idx) => (
    <TableRow key={idx} className="animate-pulse h-10">
      {columns.map((col) => (
        <TableCell key={col.id} className="py-1 px-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </TableCell>
      ))}
    </TableRow>
  ));

const SchoolAllotView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const donorId = decryptId(id);

  // Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageInput, setPageInput] = useState("");

  // Fetch paginated data
  const {
    data: schoolAllot,
    isError,
    isFetching,
  } = useGetMutation(
    `schoolallotlist-${donorId}-${pagination.pageIndex}`,
    `${SCHOOL_ALLOT_VIEW_LIST}/${donorId}`,
    { page: pagination.pageIndex + 1, limit: pagination.pageSize }
  );

  const schools = schoolAllot?.SchoolAlotView || [];
  const totalSchools = schoolAllot?.total || 0;
  const totalPages = Math.ceil(totalSchools / pagination.pageSize);

  const columns = [
    {
      id: "serialNo",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex =
          pagination.pageIndex * pagination.pageSize + row.index + 1;
        return (
          <div className="text-xs font-medium text-center">{globalIndex}</div>
        );
      },
      size: 60,
    },
    {
      accessorKey: "achal",
      id: "achal",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
          className="px-2 h-8 text-xs font-medium"
        >
          Ackal
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("achal");
        return name ? (
          <div className="text-[13px] font-medium">{name}</div>
        ) : null;
      },
      size: 150,
    },
    {
      accessorKey: "cluster",
      id: "cluster",
      header: "Cluster",
      cell: ({ row }) => {
        const { cluster, sub_cluster } = row.original;
        if (!cluster && !sub_cluster) return null;
        return (
          <div className="space-y-1">
            {cluster && <div className="text-xs">{cluster}</div>}
            {sub_cluster && (
              <div className="text-xs text-blue-600">
                <span className="font-medium">Sub Cluster:</span> {sub_cluster}
              </div>
            )}
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "village",
      id: "village",
      header: "Village",
      cell: ({ row }) => {
        const { village, district } = row.original;
        if (!village && !district) return null;
        return (
          <div className="space-y-1">
            {village && <div className="text-xs">{village}</div>}
            {district && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">District:</span> {district}
              </div>
            )}
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "school_state",
      id: "state",
      header: "State",
      cell: ({ row }) => {
        const state = row.original.school_state;
        return state ? <div className="text-xs">{state}</div> : null;
      },
      size: 120,
    },
    {
      accessorKey: "school_code",
      id: "schoolCode",
      header: "School Code",
      cell: ({ row }) => {
        const { school_code, status_label } = row.original;
        if (!school_code && !status_label) return null;
        return (
          <div className="space-y-1">
            {school_code && <div className="text-xs">{school_code}</div>}
            {status_label && (
              <div className="text-xs text-blue-600">
                <span className="font-medium">Status:</span> {status_label}
              </div>
            )}
          </div>
        );
      },
      size: 150,
    },
  ];

  const table = useReactTable({
    data: schools,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Page change helpers
  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    setPagination((prev) => ({ ...prev, pageIndex: page }));
  };

  const handlePageInput = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) setPageInput(val);
  };

  const keyDown = (e) => {
    if (e.key === "Enter") {
      const page = parseInt(pageInput, 10);
      if (!isNaN(page)) handlePageChange(page - 1);
    }
  };

  const generatePageButtons = () =>
    Array.from({ length: totalPages }).map((_, i) => (
      <Button
        key={i}
        variant={i === pagination.pageIndex ? "default" : "outline"}
        size="sm"
        onClick={() => handlePageChange(i)}
      >
        {i + 1}
      </Button>
    ));

  return (
    <div className="p-4 space-y-4">
      {/* Table */}
      <div className="rounded-none border min-h-[31rem] flex flex-col">
        <Table className="flex-1">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-3 bg-[var(--team-color)] text-[var(--label-color)] text-sm font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableShimmer columns={table.getVisibleFlatColumns()} />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-1">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  {isError ? "Failed to load schools." : "No schools found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            totalSchools
          )}{" "}
          of {totalSchools} schools
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex - 1)}
            disabled={pagination.pageIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {generatePageButtons()}
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span>Go to</span>
            <Input
              type="tel"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={handlePageInput}
              onBlur={() => setPageInput("")}
              onKeyDown={keyDown}
              className="w-16 h-8 text-sm"
              placeholder="Page"
            />
            <span>of {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={pagination.pageIndex + 1 >= totalPages}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SchoolAllotView;
