import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMutation } from "@/hooks/use-get-mutation";
import useNumericInput from "@/hooks/use-numeric-input";
import { decryptId } from "@/utils/encyrption/encyrption";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { SCHOOL_ALLOT_VIEW_LIST } from "../../../api";
import { TableShimmer } from "../loadingtable/TableShimmer";
const SchoolAllotView = () => {
  const { id } = useParams();
  const donorId = decryptId(id);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageInput, setPageInput] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: schoolAllot,
    isError,
    isFetching,
  } = useGetMutation(
    `schoolallotlist-${donorId}-${pagination.pageIndex}`,
    `${SCHOOL_ALLOT_VIEW_LIST}/${donorId}`,
    { page: pagination.pageIndex + 1, limit: pagination.pageSize }
  );
  const keyDown = useNumericInput();
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
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
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search alloted..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchTerm("");
              }
            }}
            className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Columns <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="text-xs capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-none border flex flex-col">
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
