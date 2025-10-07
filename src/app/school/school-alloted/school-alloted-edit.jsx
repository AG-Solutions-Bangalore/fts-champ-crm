import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiMutation } from "@/hooks/use-mutation";
import { decryptId } from "@/utils/encyrption/encyrption";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FETCH_SCHOOL_ALLOT_LIST,
  FETCH_SCHOOL_ALLOT_LIST_BY_ID,
  UPDATE_DETAILS_SUMBIT,
} from "../../../api";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import useNumericInput from "@/hooks/use-numeric-input";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableShimmer } from "../loadingtable/TableShimmer";

const SchoolAllotEdit = () => {
  const navigate = useNavigate();
  const { id, year } = useParams();
  const queryClient = useQueryClient();
  const donorId = decryptId(id);
  const donorYear = decryptId(year);
  const [schoolalot, setSchoolalot] = useState({
    schoolalot_financial_year: "",
    schoolalot_from_date: "",
    schoolalot_to_date: "",
    schoolalot_school_id: "",
    rept_fin_year: "",
  });
  const keyDown = useNumericInput();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [schoolData, setSchoolData] = useState([]);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const { trigger } = useApiMutation();
  const { trigger: Updatetrigger, loading: updateloading } = useApiMutation();
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  // Fetch donor & school data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const donorRes = await trigger({
          url: `${FETCH_SCHOOL_ALLOT_LIST}/${donorId}`,
        });
        setSchoolalot(donorRes?.individualCompanys || {});

        const schoolsRes = await trigger({
          url: `${FETCH_SCHOOL_ALLOT_LIST_BY_ID}/${donorId}/${donorYear}`,
        });
        const schools = schoolsRes?.schools || [];
        setSchoolData(schools);

        // Preselect already allotted schools
        const savedIds = (
          donorRes?.individualCompanys?.schoolalot_school_id || ""
        ).split(",");
        const defaultSelectedIds = schools
          .filter((s) => savedIds.includes(s.school_code))
          .map((s) => s.school_code);
        setSelectedSchoolIds(defaultSelectedIds);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [donorId, donorYear]);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  const handlePageChange = (newPageIndex) => {
    const targetPage = newPageIndex + 1;
    // const cachedData = queryClient.getQueryData([
    //   "donors",
    //   debouncedSearchTerm,
    //   targetPage,
    // ]);

    // if (cachedData) {
    //   setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));
    // } else {
      table.setPageIndex(newPageIndex);
    // }
  };
  const handlePageInput = (e) => {
    const value = e.target.value;
    setPageInput(value);

    if (value && !isNaN(value)) {
      const pageNum = parseInt(value);
      if (pageNum >= 1 && pageNum <= table.getPageCount()) {
        handlePageChange(pageNum - 1);
      }
    }
  };
  const columns = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={
            selectedSchoolIds.length ===
              schoolData.filter((s) => s.status_label !== "Allotted").length &&
            schoolData.length > 0
          }
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedSchoolIds(
                schoolData
                  .filter((s) => s.status_label !== "Allotted")
                  .map((s) => s.school_code)
              );
            } else setSelectedSchoolIds([]);
          }}
          aria-label="Select all schools"
        />
      ),
      cell: ({ row }) => {
        const code = row.original.school_code;
        const disabled = row.original.status_label === "Allotted";
        return (
          <Checkbox
            checked={selectedSchoolIds.includes(code)}
            disabled={disabled}
            onCheckedChange={(checked) => {
              setSelectedSchoolIds((prev) =>
                checked ? [...prev, code] : prev.filter((id) => id !== code)
              );
            }}
            aria-label={`Select school ${code}`}
          />
        );
      },
    },
    { id: "state", header: "State", accessorFn: (row) => row.school_state },
    { id: "district", header: "District", accessorFn: (row) => row.district },
    { id: "achal", header: "Achal", accessorFn: (row) => row.achal },
    { id: "cluster", header: "Cluster", accessorFn: (row) => row.cluster },
    {
      id: "subCluster",
      header: "Sub Cluster",
      accessorFn: (row) => row.sub_cluster,
    },
    { id: "village", header: "Village", accessorFn: (row) => row.village },
    {
      id: "schoolCode",
      header: "School Code",
      accessorFn: (row) => row.school_code,
    },
  ];

  const table = useReactTable({
    data: schoolData,
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

  const onSubmit = async () => {
    if (!selectedSchoolIds.length)
      return toast.error("Select at least one school");

    setLoading(true);
    const payload = {
      donor_related_id: donorId,
      schoolalot_financial_year: schoolalot.schoolalot_financial_year,
      schoolalot_from_date: schoolalot.schoolalot_from_date,
      schoolalot_to_date: schoolalot.schoolalot_to_date,
      schoolalot_school_id: selectedSchoolIds.join(","),
      rept_fin_year: schoolalot.rept_fin_year,
    };

    try {
      const res = await Updatetrigger({
        url: `${UPDATE_DETAILS_SUMBIT}/${donorId}`,
        method: "put",
        data: payload,
      });

      if (res?.code === 200) {
        toast.success(res.msg);
        navigate("/school/alloted");
      } else {
        toast.error(res.msg || "Unexpected error");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };
  const generatePageButtons = () => {
    const currentPage = pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
    const buttons = [];

    buttons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePageChange(0)}
        className="h-8 w-8 p-0 text-xs"
      >
        1
      </Button>
    );

    if (currentPage > 3) {
      buttons.push(
        <span key="ellipsis1" className="px-2">
          ...
        </span>
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i - 1)}
            className="h-8 w-8 p-0 text-xs"
          >
            {i}
          </Button>
        );
      }
    }

    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages - 1)}
          className="h-8 w-8 p-0 text-xs"
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };
  return (
    <div className="p-4 space-y-4">
      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label required>School Allot Year</Label>
          <Input value={schoolalot.schoolalot_financial_year} disabled />
        </div>
        <div>
          <Label required>From Date</Label>
          <Input value={schoolalot.schoolalot_from_date} disabled type="date" />
        </div>
        <div>
          <Label required>To Date</Label>
          <Input value={schoolalot.schoolalot_to_date} disabled type="date" />
        </div>
      </div>

      {/* Table */}
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search allotment..."
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
      <div className="rounded-none border  flex flex-col">
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
            {loading ? (
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
                  No schools found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-1">
        <div className="text-sm text-muted-foreground">
          Showing {schoolData?.data?.from || 0} to {schoolData?.data?.to || 0}{" "}
          of {schoolData?.data?.total || 0} schools
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
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
              max={table.getPageCount()}
              value={pageInput}
              onChange={handlePageInput}
              onBlur={() => setPageInput("")}
              onKeyDown={keyDown}
              className="w-16 h-8 text-sm"
              placeholder="Page"
            />
            <span>of {table.getPageCount()}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <Button onClick={onSubmit} disabled={updateloading}>
          {updateloading ? "Updating..." : "Update"}
        </Button>
      </div>
    </div>
  );
};

export default SchoolAllotEdit;
