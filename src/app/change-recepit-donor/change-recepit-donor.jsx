import {
  CHANGE_DONOR,
  CHANGE_RECEPIT_DONOR,
  UPDATE_CHANGE_RECEPIT,
} from "@/api";
import { Badge } from "@/components/ui/badge";
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
import { useApiMutation } from "@/hooks/use-mutation";
import useNumericInput from "@/hooks/use-numeric-input";
import { useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  File,
  FileText,
  IndianRupee,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  User,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TableShimmer } from "../school/loadingtable/TableShimmer";
const SuperReceiptDonor = () => {
  const [receiptRefNo, setReceiptRefNo] = useState("");
  const [receiptData, setReceiptData] = useState(null);
  const [showDonorSelection, setShowDonorSelection] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState();
  const [rowSelection, setRowSelection] = useState({});
  const [pageInput, setPageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const queryClient = useQueryClient();
  const keyDown = useNumericInput();

  const { trigger: fetchReceipt, loading: loadingrecepit } = useApiMutation();
  const { trigger: updateDonor, loading: isUpdating } = useApiMutation();
  const handleFetchReceipt = async () => {
    if (!receiptRefNo.trim()) {
      toast.warning("Please enter receipt reference number");
      return;
    }
    try {
      const res = await fetchReceipt({
        url: CHANGE_RECEPIT_DONOR,
        method: "post",
        data: { receipt_ref_no: receiptRefNo },
      });
      if (res.code == 200) {
        setReceiptData(res);
      } else {
        toast.error(res?.msg || "Failed to fetch receipt");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.msg || "Error fetching receipt");
    }
  };
  const {
    data: donors,
    isFetching,
    prefetchPage,
    refetch: donorsRefetch,
  } = useGetMutation("chnage-donor", CHANGE_DONOR, {
    page: pagination.pageIndex + 1,
    ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
  });
  const handleOpenDonorSelection = () => {
    setShowDonorSelection(true);
    donorsRefetch();
  };
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const totalPages = receiptData?.schools?.last_page || 1;

    if (currentPage < totalPages) {
      prefetchPage({ page: currentPage + 1 });
    }
    if (currentPage > 1) {
      prefetchPage({ page: currentPage - 1 });
    }
  }, [
    pagination.pageIndex,
    debouncedSearchTerm,
    receiptData?.schools?.last_page,
    prefetchPage,
  ]);
  const handleUpdateDonor = async () => {
    if (!selectedDonor || !receiptData) return;
    try {
      const res = await updateDonor({
        url: `${UPDATE_CHANGE_RECEPIT}/${receiptData.receipts[0].id}`,
        method: "put",
        data: {
          indicomp_fts_id: selectedDonor.indicomp_fts_id,
          receipt_ref_no: receiptRefNo,
        },
      });
      if (res.code == 200) {
        toast.success(res.msg);
        setShowDonorSelection(false);
        setSelectedDonor(null);
        handleFetchReceipt();
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update donor");
    }
  };
  const handleClear = () => {
    setReceiptRefNo("");
    setReceiptData(null);
    setShowDonorSelection(false);
    setSelectedDonor(null);
  };
  const columns = [
    {
      id: "select",
      header: "Select",

      cell: ({ row }) => {
        const isSelected =
          selectedDonor?.indicomp_fts_id === row.original.indicomp_fts_id;

        return (
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={`text-xs font-medium transition-all ${
              isSelected
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                : "bg-white text-primary border border-primary/30 hover:bg-primary/10"
            }`}
            onClick={() => setSelectedDonor(row.original)}
          >
            {isSelected ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Selected
              </span>
            ) : (
              "Select"
            )}
          </Button>
        );
      },
      size: 90,
    },
    {
      accessorKey: "indicomp_full_name",
      header: "Donor Name",
      id: "Donor Name",
      cell: ({ row }) => {
        const isSelected =
          selectedDonor?.indicomp_fts_id === row.original.indicomp_fts_id;
        return (
          <div className="flex items-center gap-2">
            {isSelected && <ArrowRight className="w-4 h-4 text-teal-500" />}
            <span
              className={
                isSelected ? "font-semibold text-teal-600" : "text-gray-800"
              }
            >
              {row.original.indicomp_full_name}
            </span>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "indicomp_mobile_phone",
      header: "Mobile",
      id: "Mobile",
      cell: ({ row }) => {
        const isSelected =
          selectedDonor?.indicomp_fts_id === row.original.indicomp_fts_id;
        return (
          <span
            className={
              isSelected ? "text-teal-500 font-medium" : "text-gray-700"
            }
          >
            {row.original.indicomp_mobile_phone || "N/A"}
          </span>
        );
      },
      size: 130,
    },
    {
      accessorKey: "indicomp_type",
      header: "Type",
      id: "Type",
      cell: ({ row }) => (
        <Badge className="bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-medium">
          {row.original.indicomp_type}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "chapter_name",
      header: "Chapter",
      id: "Chapter",
      cell: ({ row }) => (
        <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-none text-xs font-medium">
          {row.original.chapter_name}
        </Badge>
      ),
      size: 120,
    },
  ];

  const table = useReactTable({
    data: donors?.individualCompanies || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    // manualPagination: true,
    // pageCount: schoolData?.schools?.last_page || -1,
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
  const handlePageChange = (newPageIndex) => {
    const targetPage = newPageIndex + 1;
    const cachedData = queryClient.getQueryData([
      "chnage-donor",
      debouncedSearchTerm,
      targetPage,
    ]);

    if (cachedData) {
      setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));
    } else {
      table.setPageIndex(newPageIndex);
    }
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
    <div className="max-w-screen-lg mx-auto p-4 space-y-6">
      {!receiptData && (
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row w-full max-w-5xl bg-white/95 backdrop-blur-md border border-primary/20 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="hidden md:flex flex-1 bg-gradient-to-b from-primary to-secondary text-black flex-col justify-center items-center p-10">
              <h2 className="text-4xl font-extrabold mb-4 text-black">
                Donor Management
              </h2>
              <p className="text-black/80 text-lg text-center">
                Quickly fetch and update donor details using your receipt
                number. Everything you need is in one place.
              </p>
            </div>

            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-primary mb-4"
              >
                Change Receipt Donor
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-black/70 mb-6"
              >
                Enter your receipt reference number to fetch donor details
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <Input
                  value={receiptRefNo}
                  onChange={(e) => setReceiptRefNo(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="e.g: GEN/6/2024-25"
                  onKeyDown={(e) => e.key === "Enter" && handleFetchReceipt()}
                  className={`peer w-full text-base rounded-xl border px-4 py-3 focus:ring-2 transition-all text-black placeholder-black/50 ${
                    searchFocused
                      ? "border-primary ring-primary/30"
                      : "border-gray-300"
                  }`}
                />

<Button
  onClick={handleFetchReceipt}
  disabled={loadingrecepit}
  className={`w-full sm:w-36 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 ${
    loadingrecepit
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
  }`}
>
  {loadingrecepit ? (
    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  ) : (
    <Search className="w-5 h-5 inline transition-transform duration-300 group-hover:rotate-12" />
  )}
  Search
</Button>

              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-black/60 text-sm"
              >
                Press <span className="text-primary font-medium">Enter</span> or
                click <span className="text-primary font-medium">Search</span>{" "}
                to continue
              </motion.p>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {receiptData && !showDonorSelection && (
          <motion.div
            key="receipt-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-1.5 transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </motion.div>

                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Receipt: <span className="text-primary">{receiptRefNo}</span>
                </h2>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenDonorSelection}
                  className="text-primary border-primary/30 bg-primary/10 hover:bg-primary/30 flex items-center gap-1.5 transition-all duration-200"
                >
                  <Edit2 className="w-4 h-4" />
                  Change Donor
                </Button>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                className="bg-accent/10 rounded-2xl shadow-lg p-6 border-t-4 border-accent transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Receipt Details
                  </h3>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <div>
                    <p className="text-sm">Receipt No.</p>
                    <p className="font-medium text-foreground">
                      {receiptData.receipts[0].receipt_no}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Date</p>
                    <p className="font-medium flex items-center gap-1 text-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      {receiptData.receipts[0].receipt_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Receipt ID</p>
                    <p className="font-medium text-foreground">
                      {receiptData.receipts[0].id}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                className="bg-accent/10 rounded-2xl shadow-lg p-6 border-t-4 border-accent transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Current Donor
                  </h3>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <div>
                    <p className="text-sm">Name</p>
                    <p className="font-medium text-foreground">
                      {
                        receiptData.receipts[0].individual_company
                          .indicomp_full_name
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Promoter</p>
                    <p className="font-medium flex items-center gap-1 text-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      {receiptData.receipts[0].individual_company
                        .indicomp_promoter || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Chapter</p>
                    <p className="font-medium text-foreground">
                      {receiptData.receipts[0].chapter.chapter_name} (
                      {receiptData.receipts[0].chapter.chapter_code})
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Donation Info */}
              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                className="bg-accent/10 rounded-2xl shadow-lg p-6 border-t-4 border-accent transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full text-primary">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Donation Info
                  </h3>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <div>
                    <p className="text-sm">Type</p>
                    <p className="font-medium px-2 py-1 bg-primary/20 text-primary rounded-md text-xs inline-block">
                      {receiptData.receipts[0].receipt_donation_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Exemption</p>
                    <p className="font-medium px-2 py-1 bg-primary/20 text-primary rounded-md text-xs inline-block">
                      {receiptData.receipts[0].receipt_exemption_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Amount</p>
                    <p className="font-medium text-accent text-lg flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {receiptData.receipts[0].receipt_total_amount}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donor Selection */}
      <AnimatePresence>
        {showDonorSelection && (
          <>
            {selectedDonor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-6 rounded-2xl overflow-hidden border border-primary/20 shadow-md bg-gradient-to-br from-background via-primary/5 to-primary/10"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-primary-foreground tracking-wide">
                    Selected Donor
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30 backdrop-blur-sm">
                    <Check className="w-3.5 h-3.5" />
                    Active
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-full p-3.5 text-primary-foreground shadow-lg ring-2 ring-white/80">
                      <User className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {selectedDonor.indicomp_full_name}
                      </h3>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>
                            {selectedDonor.indicomp_mobile_phone || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{selectedDonor.chapter_name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCircle className="w-4 h-4 text-primary" />
                          <span>{selectedDonor.indicomp_type || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleUpdateDonor}
                    >
                      {isUpdating ? "Updating..." : "Update Donor"}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              key="donor-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-full p-2">
                <div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => setShowDonorSelection(false)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>{" "}
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search recepit..."
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setSearchTerm("");
                            }
                          }}
                          className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                        />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          Columns <ChevronDown className="ml-2 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {table
                          ?.getAllColumns()
                          ?.filter((column) => column.getCanHide())
                          ?.map((column) => (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="text-xs capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {/* Table */}
                <div className="rounded-none border flex flex-col">
                  <Table className="flex-1">
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="h-10 px-3 bg-[var(--team-color)] text-[var(--label-color)]  text-sm font-medium"
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
                        <TableShimmer columns={table.getVisibleFlatColumns()} />
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
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center text-sm"
                          >
                            No recepit found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="text-sm text-muted-foreground">
                    Showing {receiptData?.data?.from || 0} to{" "}
                    {receiptData?.data?.to || 0} of{" "}
                    {receiptData?.data?.total || 0} recepits
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SuperReceiptDonor;
