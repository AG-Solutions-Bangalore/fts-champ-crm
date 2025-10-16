import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Edit, ArrowUpDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ADMIN_DATASOURCE_LIST } from '@/api';
import CreateDatasourceAdmin from './create-datasource-admin';
import EditDatasourceAdmin from './edit-datasource-admin';

const DatasourceListAdmin = ({datasources,refetch}) => {
  const [editDatasource, setEditDatasource] = useState(null);
  const chapterId = Cookies.get("chapter_id");

  // const { data: datasourceData, isLoading, isError, refetch, isFetching } = useQuery({
  //   queryKey: ['chapter-datasource-admin', chapterId],
  //   queryFn: async () => {
  //     const response = await axios.get(ADMIN_DATASOURCE_LIST, {
  //       headers: {
  //         Authorization: `Bearer ${Cookies.get('token')}`,
  //       },
  //     });
  //     return response.data;
  //   },
  //   enabled: !!chapterId,
  // });

  // const datasources = datasourceData?.datasource || [];


  const [datasourceSorting, setDatasourceSorting] = useState([]);
  const [datasourceColumnFilters, setDatasourceColumnFilters] = useState([]);
  const [datasourceColumnVisibility, setDatasourceColumnVisibility] = useState({});
  const [datasourceRowSelection, setDatasourceRowSelection] = useState({});
  const [datasourceGlobalFilter, setDatasourceGlobalFilter] = useState("");

  const datasourceColumns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex = row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
      size: 60,
    },
    {
      accessorKey: "data_source_type",
      id: "Data Source Type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Data Source Type
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-[13px] font-medium">{row.getValue("Data Source Type")}</div>
      ),
      size: 200,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const datasource = row.original;
        const dataAccess = row.original.data_source_type
        const restrictedSources = ["Ekal Run", "Sakranti", "Seva Patra"];
        const canEdit = !restrictedSources.includes(dataAccess)
        return (
          <div className="flex flex-row">
            {canEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setEditDatasource(datasource)}
                    disabled={datasource.chapter_id === 0}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Data Source</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  const datasourceTable = useReactTable({
    data: datasources,
    columns: datasourceColumns,
    onSortingChange: setDatasourceSorting,
    onColumnFiltersChange: setDatasourceColumnFilters,
    onGlobalFilterChange: setDatasourceGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setDatasourceColumnVisibility,
    onRowSelectionChange: setDatasourceRowSelection,
    state: {
      sorting: datasourceSorting,
      columnFilters: datasourceColumnFilters,
      globalFilter: datasourceGlobalFilter,
      columnVisibility: datasourceColumnVisibility,
      rowSelection: datasourceRowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // const DatasourceTableShimmer = () => {
  //   return Array.from({ length: 5 }).map((_, index) => (
  //     <TableRow key={index} className="animate-pulse h-11"> 
  //       {datasourceTable.getVisibleFlatColumns().map((column) => (
  //         <TableCell key={column.id} className="py-1">
  //           <div className="h-8 bg-gray-200 rounded w-full"></div> 
  //         </TableCell>
  //       ))}
  //     </TableRow>
  //   ));
  // };

  // if (isError) {
  //   return (
  //     <div className="w-full p-4">
  //       <div className="flex items-center justify-center h-64">
  //         <div className="text-center">
  //           <div className="text-destructive font-medium mb-2">
  //             Error Fetching Data Source Data
  //           </div>
  //           <Button onClick={() => refetch()} variant="outline" size="sm">
  //             Try Again
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (isLoading) {
  //   return (
  //     <div className="min-h-[20rem] bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
  //       <div className="flex items-center gap-2">
  //         <Loader2 className="w-6 h-6 animate-spin" />
  //         <span>Loading data source data...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between py-1 ">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-500" />
          <Input
            placeholder="Search data sources..."
            value={datasourceTable.getState().globalFilter || ""}
            onChange={(event) => datasourceTable.setGlobalFilter(event.target.value)}
            className="pl-7 h-8 text-xs bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
          <CreateDatasourceAdmin refetch={refetch} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-none border min-h-[20rem] flex flex-col">
        <Table className="flex-1">
          <TableHeader>
            {datasourceTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="h-9 px-3 bg-[var(--team-color)] text-white text-xs font-medium"
                    style={{ width: header.column.columnDef.size }}
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
            { datasourceTable.getRowModel().rows?.length ? (
              datasourceTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-9 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-1 text-xs">
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
                <TableCell colSpan={datasourceColumns.length} className="h-24 text-center text-xs">
                  No data sources found for this chapter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-2 ">
        <div className="flex-1 text-xs text-muted-foreground">
          Total Data Sources: {datasourceTable.getFilteredRowModel().rows.length}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => datasourceTable.previousPage()}
            disabled={!datasourceTable.getCanPreviousPage()}
            className="h-8 text-xs"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => datasourceTable.nextPage()}
            disabled={!datasourceTable.getCanNextPage()}
            className="h-8 text-xs"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      {editDatasource && (
        <EditDatasourceAdmin
          datasourceData={editDatasource}
          open={!!editDatasource}
          onClose={() => setEditDatasource(null)}
          refetch={refetch}
        />
      )}
    </div>
  );
}

export default DatasourceListAdmin;