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

const TableShimmer = ({ columns, rows = 7 }) => {
  return Array.from({ length: rows }).map((_, index) => (
    <TableRow key={index} className="animate-pulse h-11">
      {columns.map((column) => (
        <TableCell key={column.id} className="py-1 px-3">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </TableCell>
      ))}
    </TableRow>
  ));
};

const SchoolAllotEdit = () => {
  const navigate = useNavigate();
  const { id, year } = useParams();

  const donorId = decryptId(id);
  const donorYear = decryptId(year);

  const [schoolalot, setSchoolalot] = useState({
    schoolalot_financial_year: "",
    schoolalot_from_date: "",
    schoolalot_to_date: "",
    schoolalot_school_id: "",
    rept_fin_year: "",
  });
  const [schoolData, setSchoolData] = useState([]);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const { trigger } = useApiMutation();
  const { trigger: Updatetrigger, loading: updateloading } = useApiMutation();

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
    getCoreRowModel: getCoreRowModel(),
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
      <div className="rounded-none border min-h-[30rem] flex flex-col">
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
