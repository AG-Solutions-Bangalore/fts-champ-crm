import { useNavigate, useParams } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMutation } from "@/hooks/use-get-mutation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SCHOOL_ALLOT_VIEW_LIST } from "../../../api";
import { decryptId } from "@/utils/encyrption/encyrption";

const SchoolAllotView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const donorId = decryptId(id);
  const {
    data: schoolAllot,
    isError,
    isFetching,
  } = useGetMutation(
    `schoolallotlist-${donorId}`,
    `${SCHOOL_ALLOT_VIEW_LIST}/${donorId}`
  );

  const columns = [
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
    data: schoolAllot?.SchoolAlotView || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

  return (
    <>
      <div className="p-4 space-y-4">
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
      </div>
    </>
  );
};

export default SchoolAllotView;
