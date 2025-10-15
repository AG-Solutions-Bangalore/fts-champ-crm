import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import mailSentGif from "../../assets/mail-sent-fast.gif";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Search, Loader2, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { MEMBER_DASHBOARD } from '@/api';
import Cookies from "js-cookie";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import BASE_URL from "@/config/base-url";
import { toast } from "sonner";

const MemberShipInactive = () => {
  const currentYear = Cookies.get('currentYear');
  const token = Cookies.get('token');
     const userType = Cookies.get('user_type_id');
  const activeYear = currentYear.split("-")[0] 
const [mailSending, setMailSending] = React.useState({});
  const {
    data: membershipData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['member-active'],
    queryFn: async () => {
      const response = await axios.get(MEMBER_DASHBOARD, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    },
    retry: 2,
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });


 const filteredData = useMemo(() => {
     return (
       membershipData?.data?.filter(
         (member) => member.last_payment_vailidity !== activeYear
       ) || []
     );
   }, [membershipData, activeYear]);
 
   const sendEmailMutation = useMutation({
    mutationFn: async (memberId) => {
      const response = await axios.get(`${BASE_URL}/api/send-membership-renewal-email/${memberId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: (data, memberId) => {
      toast.success(data.message || 'Email sent successfully');
      setMailSending(prev => ({ ...prev, [memberId]: false }));
    },
    onError: (error, memberId) => {
      const message = error.response?.data?.message || 'Failed to send email';
      toast.error(message);
      setMailSending(prev => ({ ...prev, [memberId]: false }));
    }
  });

  const handleSendEmail = (memberId, email) => {
    if (!email || email.toLowerCase() === 'null') {
      toast.error('No email address available for this member');
      return;
    }

    setMailSending(prev => ({ ...prev, [memberId]: true }));
    sendEmailMutation.mutate(memberId);
  };
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

const [searchValue, setSearchValue] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalFilter(searchValue);
    }, 400); // wait 400ms after typing stops

    return () => clearTimeout(handler);
  }, [searchValue]);
  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex = row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
   
    },
    {
      accessorKey: "indicomp_full_name",
      id: "Full Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Full Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Full Name") || "-"}</div>,
   
    },
    {
      accessorKey: "indicomp_email",
      id: "Email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Email
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Email") || "-"}</div>,
  
    },
    {
      accessorKey: "indicomp_mobile_phone",
      id: "Mobile Phone",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Mobile Phone
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Mobile Phone") || "-"}</div>,
 
    },
    {
      accessorKey: "indicomp_type",
      id: "Type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Type
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Type") || "-"}</div>,
  
    },
    {
      accessorKey: "indicomp_donor_type",
      id: "Donor Type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Donor Type
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Donor Type") || "-"}</div>,
    
    },
    {
      accessorKey: "chapter_name",
      id: "Chapter",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Chapter
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Chapter") || "-"}</div>,
   
    },
    {
      accessorKey: "last_payment_date",
      id: "Last Pay Date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Last Pay Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Last Pay Date") || "-"}</div>,
      
    },
    {
      accessorKey: "payment_count",
      id: "Pay Count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Pay Count
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Pay Count") || "0"}</div>,
      
    },
    ...(userType !== '4'
      ? [
    {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                  const memberId = row.original.id;
                  const email = row.original.indicomp_email;
                  const isValidEmail = email && email.toLowerCase() !== 'null';
              
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEmail(memberId, email)}
                      disabled={!isValidEmail || mailSending[memberId]}
                      className="h-7 w-7 p-0 flex items-center justify-center"
                    >
                      {mailSending[memberId] ? (
                       
                        <img
                          src={mailSentGif}
                          alt="Sending..."
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <Mail
                          className={`w-3 h-3 ${isValidEmail ? 'text-blue-500' : 'text-gray-300'}`}
                        />
                      )}
                    </Button>
                  );
                },
              }
            ]
            : []),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const TableShimmer = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <TableRow key={index} className="animate-pulse h-11"> 
        {table.getVisibleFlatColumns().map((column) => (
          <TableCell key={column.id} className="py-1">
            <div className="h-8 bg-gray-200 rounded w-full"></div> 
          </TableCell>
        ))}
      </TableRow>
    ));
  };
  
  if (isError) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-destructive font-medium mb-2">
              Error Fetching Membership Data
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full ">
      <div className="flex items-center justify-between py-1">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search members..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
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
      </div>

      {/* Table */}
      <div className="rounded-none grid grid-cols-1  overflow-x-auto overflow-hidden border min-h-[31rem] ">
        <Table className="flex-1">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="h-10 px-3 bg-[var(--team-color)] text-[var(--label-color)] text-sm font-medium"
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
            {isFetching && !table.getRowModel().rows.length ? (
              <TableShimmer />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-2 hover:bg-gray-50"
                >
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  No active members found for {activeYear}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-1">
        <div className="flex-1 text-sm text-muted-foreground">
          Inactive Members : &nbsp;
          {table.getFilteredRowModel().rows.length}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberShipInactive;