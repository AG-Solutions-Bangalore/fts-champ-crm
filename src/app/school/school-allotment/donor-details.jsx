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
import { useGetMutation } from "@/hooks/use-get-mutation";
import { useApiMutation } from "@/hooks/use-mutation";
import { decryptId } from "@/utils/encyrption/encyrption";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  DONOR_DETAILS_SUMBIT,
  SCHOOL_ALLOT_YEAR_BY_YEAR,
  SCHOOL_DATA_BY_ID,
  SCHOOL_DONOR_DETAILS_ALLOTED_LIST,
} from "../../../api";

const DonorDetails = () => {
  const navigate = useNavigate();
  const { id, year, fyear } = useParams();

  const donorId = decryptId(id);
  const donorYear = decryptId(year);
  const donorFYear = decryptId(fyear);

  const [userdata, setUserdata] = useState({});
  const [dateschool, setDateschool] = useState({});
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageInput, setPageInput] = useState("");

  const { trigger } = useApiMutation();
  const { trigger: submitDetails, loading: submitloading } = useApiMutation();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch donor info and dates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await trigger({ url: SCHOOL_DATA_BY_ID + donorId });
        setUserdata(userRes?.SchoolAlotDonor || {});

        const datesRes = await trigger({
          url: `${SCHOOL_ALLOT_YEAR_BY_YEAR}/${donorYear}`,
        });
        setDateschool(datesRes?.schoolallotyear || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch donor info or school dates");
      }
    };
    fetchData();
  }, [donorId, donorYear]);

  const { data: schoolDataRes, isFetching } = useGetMutation(
    "donorSchoolList",
    `${SCHOOL_DONOR_DETAILS_ALLOTED_LIST}/${donorYear}`,
    { search: debouncedSearchTerm, page: pagination.pageIndex + 1 }
  );

  const schoolData = schoolDataRes?.schools || [];
  const totalSchools = schoolDataRes?.data?.total || 0;
  const totalPages = Math.ceil(totalSchools / pagination.pageSize);

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
            } else {
              setSelectedSchoolIds([]);
            }
          }}
          aria-label="Select all schools"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedSchoolIds.includes(row.original.school_code)}
          disabled={row.original.status_label === "Allotted"}
          onCheckedChange={(checked) => {
            const id = row.original.school_code;
            setSelectedSchoolIds((prev) =>
              checked ? [...prev, id] : prev.filter((s) => s !== id)
            );
          }}
          aria-label={`Select school ${row.original.school_code}`}
        />
      ),
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
    { id: "status", header: "Status", accessorFn: (row) => row.status_label },
  ];

  const table = useReactTable({
    data: schoolData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onSubmit = async () => {
    if (!selectedSchoolIds.length)
      return toast.error("Select at least one school");

    const payload = {
      indicomp_fts_id: userdata.indicomp_fts_id,
      schoolalot_financial_year: donorYear,
      schoolalot_to_date: dateschool.school_allot_to,
      schoolalot_from_date: dateschool.school_allot_from,
      schoolalot_school_id: selectedSchoolIds.join(","),
      rept_fin_year: donorFYear,
    };

    try {
      const res = await submitDetails({
        url: DONOR_DETAILS_SUMBIT,
        method: "post",
        data: payload,
      });
      if (res.code === 200) {
        toast.success(res.msg);
        navigate("/students-schoolallot");
      } else {
        toast.error(res.msg || "Unexpected error");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit");
    }
  };

  // Shimmer Loader for Table
  const TableShimmer = ({ table }) => {
    return Array.from({ length: 7 }).map((_, index) => (
      <TableRow key={index} className="animate-pulse h-11">
        {table.getVisibleFlatColumns().map((column) => (
          <TableCell key={column.id} className="py-1">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </TableCell>
        ))}
      </TableRow>
    ));
  };

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

  const generatePageButtons = () => {
    let buttons = [];
    for (let i = 0; i < totalPages; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === pagination.pageIndex ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i + 1}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div className="p-4 bg-white space-y-4">
      {/* School Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <Label htmlFor="school-year">School Allot Year*</Label>
          <Input id="school-year" value={donorYear} disabled />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="from-date">From Date*</Label>
          <Input id="from-date" value={dateschool.school_allot_from} disabled />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="to-date">To Date*</Label>
          <Input id="to-date" value={dateschool.school_allot_to} disabled />
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <Label htmlFor="school-search" className="sr-only">
          Search Schools
        </Label>
        <Input
          id="school-search"
          placeholder="Search schools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

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
            {isFetching && !table.getRowModel().rows.length ? (
              <TableShimmer table={table} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="h-2">
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
              <TableRow className="h-12">
                <TableCell
                  colSpan={table.getHeaderGroups()[0].headers.length}
                  className="h-24 text-center text-sm"
                >
                  No schools found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-1">
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

      {/* Submit */}
      <div className="flex justify-end mt-4">
        <Button onClick={onSubmit} disabled={submitloading}>
          {submitloading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default DonorDetails;
