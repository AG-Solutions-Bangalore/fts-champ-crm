import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Download, Eye, ArrowUpDown, ChevronDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DOWNLOAD_DONOR } from '@/api';
import Cookies from 'js-cookie';

const DonorDownload = () => {
  const token = Cookies.get('token');
  const [formData, setFormData] = useState({
    indicomp_type: '',
    indicomp_donor_type: ''
  });

  const [jsonData, setJsonData] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const donorTypes = [
    { value: 'Member', label: 'Member' },
    { value: 'Donor', label: 'Donor' },
    { value: 'Member+Donor', label: 'Member+Donor' },
    { value: 'None', label: 'None' }
  ];

  const donorCategories = [
    { value: 'Member', label: 'Member' },
    { value: 'Donor', label: 'Donor' },
    { value: 'Member+Donor', label: 'Member+Donor' },
    { value: 'None', label: 'PSU' },
    { value: 'Trust', label: 'Trust' },
    { value: 'Society', label: 'Society' },
    { value: 'Others', label: 'Others' }
  ];

  const downloadMutation = useMutation({
    mutationFn: async (downloadData) => {
      const response = await axios.post(DOWNLOAD_DONOR, downloadData, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      return response.data;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donor_list.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Donor list downloaded successfully!');
      setFormData({
        indicomp_type: '',
        indicomp_donor_type: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to download donor list');
      console.error('Download error:', error);
    }
  });

  const viewMutation = useMutation({
    mutationFn: async (downloadData) => {
      const response = await axios.post(DOWNLOAD_DONOR, downloadData, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      return response.data;
    },
    onSuccess: async (blob) => {
      const text = await blob.text();
      const rows = text.split('\n').filter(Boolean);
      const headers = rows[0].split(',');
      const data = rows.slice(1).map(row => {
        const values = row.split(',');
        const obj = {};
        headers.forEach((header, idx) => {
          const cleanHeader = header.replace(/^"|"$/g, '');
          const cleanValue = values[idx] ? values[idx].replace(/^"|"$/g, '') : '';
          obj[cleanHeader] = cleanValue;
        });
        return obj;
      });
      setJsonData(data);
    },
    onError: () => {
      toast.error('Failed to fetch donor data');
    }
  });

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDownload = (e) => {
    e.preventDefault();
    downloadMutation.mutate(formData);
  };

  const handleSubmitView = (e) => {
    e.preventDefault();
    viewMutation.mutate(formData);
  };

  const columns = [
    {
      id: 'S. No.',
      header: 'S. No.',
      cell: ({ row }) => {
        const globalIndex = row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
      size: 60,
    },
    {
      accessorKey: 'FTS Id',
      id: 'FTS Id',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="px-2 h-8 text-xs"
        >
          FTS Id
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('FTS Id')}</div>,
      size: 80,
    },
    {
      accessorKey: 'Title',
      id: 'Title',
      header: 'Title',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Title')}</div>,
      size: 80,
    },
    {
      accessorKey: 'Name',
      id: 'Name',
      header: 'Name',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Name')}</div>,
      size: 150,
    },
    {
      accessorKey: 'Type',
      id: 'Type',
      header: 'Type',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Type')}</div>,
      size: 100,
    },
    {
      accessorKey: 'Contact Name',
      id: 'Contact Name',
      header: 'Contact Name',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Contact Name')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Designation',
      id: 'Designation',
      header: 'Designation',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Designation')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Father Name',
      id: 'Father Name',
      header: 'Father Name',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Father Name')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Mother Name',
      id: 'Mother Name',
      header: 'Mother Name',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Mother Name')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Gender',
      id: 'Gender',
      header: 'Gender',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Gender')}</div>,
      size: 80,
    },
    {
      accessorKey: 'Spouse',
      id: 'Spouse',
      header: 'Spouse',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Spouse')}</div>,
      size: 100,
    },
    {
      accessorKey: 'DOB',
      id: 'DOB',
      header: 'DOB',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('DOB')}</div>,
      size: 100,
    },
    {
      accessorKey: 'DOA',
      id: 'DOA',
      header: 'DOA',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('DOA')}</div>,
      size: 100,
    },
    {
      accessorKey: 'PAN No',
      id: 'PAN No',
      header: 'PAN No',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('PAN No')}</div>,
      size: 100,
    },
    {
      accessorKey: 'Mobile',
      id: 'Mobile',
      header: 'Mobile',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Mobile')}</div>,
      size: 100,
    },
    {
      accessorKey: 'Whatsapp',
      id: 'Whatsapp',
      header: 'Whatsapp',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Whatsapp')}</div>,
      size: 100,
    },
    {
      accessorKey: 'Email',
      id: 'Email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.getValue('Email') || '';
        const shortEmail = email.length > 25 ? email.slice(0, 25) + '…' : email;
        return <div className="text-xs font-medium">{shortEmail}</div>;
      },
      size: 150,
    },
    {
      accessorKey: 'Website',
      id: 'Website',
      header: 'Website',
      cell: ({ row }) => {
        const website = row.getValue('Website') || '';
        const shortWebsite = website.length > 20 ? website.slice(0, 20) + '…' : website;
        return <div className="text-xs font-medium">{shortWebsite}</div>;
      },
      size: 120,
    },
    {
      accessorKey: '1st Address',
      id: '1st Address',
      header: '1st Address',
      cell: ({ row }) => {
        const address = row.getValue('1st Address') || '';
        const shortAddress = address.length > 30 ? address.slice(0, 30) + '…' : address;
        return <div className="text-xs font-medium">{shortAddress}</div>;
      },
      size: 200,
    },
    {
      accessorKey: 'Area',
      id: 'Area',
      header: 'Area',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Area')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Landmark',
      id: 'Landmark',
      header: 'Landmark',
      cell: ({ row }) => {
        const landmark = row.getValue('Landmark') || '';
        const shortLandmark = landmark.length > 20 ? landmark.slice(0, 20) + '…' : landmark;
        return <div className="text-xs font-medium">{shortLandmark}</div>;
      },
      size: 120,
    },
    {
      accessorKey: 'City',
      id: 'City',
      header: 'City',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('City')}</div>,
      size: 100,
    },
    {
      accessorKey: 'State',
      id: 'State',
      header: 'State',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('State')}</div>,
      size: 100,
    },
    {
      accessorKey: 'Pincode',
      id: 'Pincode',
      header: 'Pincode',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Pincode')}</div>,
      size: 80,
    },
    {
      accessorKey: '2nd Address',
      id: '2nd Address',
      header: '2nd Address',
      cell: ({ row }) => {
        const address = row.getValue('2nd Address') || '';
        const shortAddress = address.length > 30 ? address.slice(0, 30) + '…' : address;
        return <div className="text-xs font-medium">{shortAddress}</div>;
      },
      size: 200,
    },
    {
      accessorKey: 'Corr. Preffer',
      id: 'Corr. Preffer',
      header: 'Corr. Preffer',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Corr. Preffer')}</div>,
      size: 100,
    },
    {
      accessorKey: 'CSR',
      id: 'CSR',
      header: 'CSR',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('CSR')}</div>,
      size: 80,
    },
    {
      accessorKey: 'Belongs To',
      id: 'Belongs To',
      header: 'Belongs To',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Belongs To')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Donor Type',
      id: 'Donor Type',
      header: 'Donor Type',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Donor Type')}</div>,
      size: 120,
    },
    {
      accessorKey: 'Promoter',
      id: 'Promoter',
      header: 'Promoter',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Promoter')}</div>,
      size: 100,
    },
    {
      accessorKey: 'Source',
      id: 'Source',
      header: 'Source',
      cell: ({ row }) => <div className="text-xs font-medium">{row.getValue('Source')}</div>,
      size: 100,
    },
    {
      accessorKey: 'Remarks',
      id: 'Remarks',
      header: 'Remarks',
      cell: ({ row }) => {
        const remarks = row.getValue('Remarks') || '';
        const shortRemarks = remarks.length > 50 ? remarks.slice(0, 50) + '…' : remarks;
        return <div className="text-xs font-medium">{shortRemarks}</div>;
      },
      size: 200,
    },
  ];

  const table = useReactTable({
    data: jsonData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
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

  return (
    <div className="w-full max-w-full mx-auto border rounded-md shadow-sm">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Download className="w-5 h-5" />
          Download Donors
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">
          Leave fields blank to get all records
        </div>
      </div>

      <div className="p-4">
        <form className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="indicomp_donor_type" className="text-sm">Category</Label>
              <Select value={formData.indicomp_donor_type} onValueChange={(value) => handleSelectChange('indicomp_donor_type', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {donorTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="indicomp_type" className="text-sm">Source</Label>
              <Select value={formData.indicomp_type} onValueChange={(value) => handleSelectChange('indicomp_type', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {donorCategories.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleSubmitDownload} disabled={downloadMutation.isPending} className="flex items-center gap-2 h-9">
              <Download className="w-4 h-4" />
              {downloadMutation.isPending ? 'Downloading...' : 'Download'}
            </Button>

            <Button type="button" onClick={handleSubmitView} disabled={viewMutation.isPending} className="flex items-center gap-2 h-9">
              <Eye className="w-4 h-4" />
              {viewMutation.isPending ? 'Loading...' : 'View'}
            </Button>
          </div>
        </form>

        {/* Table display */}
        {jsonData && (
          <div className="mt-6">
            <div className="flex items-center justify-between py-1 mb-3">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search donors..."
                  value={table.getState().globalFilter || ''}
                  onChange={(event) => table.setGlobalFilter(event.target.value)}
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

            {/* Table */}
            <div className="rounded-none border min-h-[20rem] flex flex-col overflow-x-auto">
              <Table className="flex-1 min-w-max">
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
                  {viewMutation.isPending ? (
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
                        No donors found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Total Donors: {table.getFilteredRowModel().rows.length}
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
        )}
      </div>
    </div>
  );
};

export default DonorDownload;