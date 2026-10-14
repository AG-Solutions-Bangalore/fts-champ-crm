import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "@/config/base-url";
import { toast } from "sonner";
import moment from "moment";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  FileText,
  CheckCircle,
  Check,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PanVerify = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState("");
  const [limit, setLimit] = useState("");
  const [appliedLimit, setAppliedLimit] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmRecord, setConfirmRecord] = useState(null);

  // Check if current logged-in user is testmasteradmin
  const isTestMasterAdmin = useMemo(() => {
    const nameL = Cookies.get("name");
    const emailL = Cookies.get("email");
    const usernameL = Cookies.get("username");
    const loginUserL = Cookies.get("login_username");
    const localUser =
      typeof window !== "undefined"
        ? localStorage.getItem("username") ||
        localStorage.getItem("login_username") ||
        ""
        : "";

    return [usernameL, emailL, nameL, loginUserL, localUser].some((val) => {
      if (!val || typeof val !== "string") return false;
      const clean = val.trim().toLowerCase();
      return (
        clean === "testmasteradmin" ||
        clean === "test master admin" ||
        clean.startsWith("testmasteradmin@")
      );
    });
  }, []);

  // Limit input handlers (accepts only integers)
  const handleLimitChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setLimit(val);
  };

  const handleLimitKeyDown = (e) => {
    if (
      ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight"].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))
    ) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleGetDetails();
      }
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Mutation to trigger POST /api/getPanNoDetails with limit
  const getPanNoDetailsMutation = useMutation({
    mutationFn: async (limitValue) => {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("limit", limitValue);

      const response = await axios.post(
        `${BASE_URL}/api/getPanNoDetails`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "PAN details fetched successfully!");
      setAppliedLimit(limit);
      setPageIndex(0);
      refetch();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to get PAN details"
      );
    },
  });

  const handleGetDetails = () => {
    if (!limit || String(limit).trim() === "" || parseInt(limit, 10) <= 0) {
      toast.error("Limit field is required. Please enter a valid number.");
      return;
    }
    getPanNoDetailsMutation.mutate(limit);
  };

  // Fetch API for ispan-no-verified with page and limit params
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["ispan-no-verified", pageIndex + 1, appliedLimit],
    queryFn: async () => {
      const token = Cookies.get("token");
      const params = new URLSearchParams();
      params.append("page", (pageIndex + 1).toString());
      if (appliedLimit) {
        params.append("limit", appliedLimit);
      }

      const response = await axios.get(
        `${BASE_URL}/api/ispan-no-verified?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled: !!isTestMasterAdmin,
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  // Verify Mutation (PUT /api/ispan-no-verified/{id}) with indicomp_fts_id
  const verifyMutation = useMutation({
    mutationFn: async ({ id, indicomp_fts_id }) => {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/ispan-no-verified/${id}`,
        { indicomp_fts_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "PAN verified successfully");
      setConfirmRecord(null);
      refetch();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to verify PAN"
      );
    },
  });

  // Parse raw list from response
  const rawList = useMemo(() => {
    const root = apiResponse?.data ?? apiResponse;
    if (Array.isArray(root)) return root;
    if (root && typeof root === "object") {
      if (Array.isArray(root.data)) return root.data;
      if (Array.isArray(root.ispan_no_verified)) return root.ispan_no_verified;
      if (Array.isArray(apiResponse?.ispan_no_verified)) return apiResponse.ispan_no_verified;
      if (Array.isArray(root.list)) return root.list;
      const firstArrayKey = Object.keys(root).find((k) => Array.isArray(root[k]));
      if (firstArrayKey) return root[firstArrayKey];
    }
    return [];
  }, [apiResponse]);

  // Filter out records where isverified_pan_no is 'yes' (or verified with matching names)
  // Only display unverified records in the list view
  const unverifiedRecords = useMemo(() => {
    return rawList.filter((item) => {
      const isVerified = String(item?.isverified_pan_no || "").trim().toLowerCase() === "yes";
      return !isVerified;
    });
  }, [rawList]);

  const effectivePageSize = useMemo(() => {
    const parsed = parseInt(appliedLimit, 10);
    return parsed > 0 ? parsed : pageSize;
  }, [appliedLimit, pageSize]);

  // Pagination calculations based on filtered records
  const { totalRecords, totalPages, fromRecord, toRecord, displayItems } = useMemo(() => {
    const total = unverifiedRecords.length;
    const pages = Math.max(1, Math.ceil(total / effectivePageSize));
    const from = total > 0 ? pageIndex * effectivePageSize + 1 : 0;
    const to = Math.min((pageIndex + 1) * effectivePageSize, total);
    const items = unverifiedRecords.slice(
      pageIndex * effectivePageSize,
      (pageIndex + 1) * effectivePageSize
    );

    return {
      totalRecords: total,
      totalPages: pages,
      fromRecord: from,
      toRecord: to,
      displayItems: items,
    };
  }, [unverifiedRecords, pageIndex, effectivePageSize]);

  // Helper to format dates to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-" || dateStr === "null" || dateStr === "undefined") {
      return "-";
    }
    const m = moment(dateStr);
    return m.isValid() ? m.format("DD-MM-YYYY") : dateStr;
  };

  // Helper for conditional date column:
  // "if indicomp_type value is individual then show indicomp_dob_annualday else other than individual show indicomp_doa"
  const getDateDisplay = (item) => {
    const type = String(item?.indicomp_type || "").trim().toLowerCase();
    const rawDate = type === "individual" ? item?.indicomp_dob_annualday : item?.indicomp_doa;
    return formatDate(rawDate);
  };

  // Helper to check name mismatch
  const checkNameMismatch = (item) => {
    const donorName = String(item?.indicomp_full_name || "").trim().toLowerCase();
    const panName = String(item?.full_name || "").trim().toLowerCase();
    return donorName !== panName;
  };

  // Helper to format status with badges
  const renderStatus = (status) => {
    if (!status) return <span className="text-muted-foreground">-</span>;
    const str = String(status).toLowerCase();
    if (str === "valid" || str === "verified" || str === "active") {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 text-[10px] px-1.5 py-0 h-5 font-medium capitalize">
          {status}
        </Badge>
      );
    }
    if (str === "invalid" || str === "failed") {
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 font-medium capitalize">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">
        {status}
      </Badge>
    );
  };

  // Pagination navigation handlers
  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pageIndex + 1 < totalPages) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const target = parseInt(pageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPageIndex(target - 1);
      setPageInput("");
    }
  };

  if (!isTestMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-6">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          PAN verification is restricted and only accessible for Test Master Admin login.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex flex-col gap-2 p-0 m-0">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-1">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">PAN Verify</h1>
            <Badge variant="secondary" className="text-xs">
              Pending: {totalRecords}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Input field for limit (accepts only integers, required) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Limit <span className="text-destructive">*</span>:
            </span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={limit}
              onChange={handleLimitChange}
              onKeyDown={handleLimitKeyDown}
              placeholder="e.g. 50"
              className="w-20 h-8 text-xs"
            />
          </div>

          {/* 2. Button as getdetails */}
          <Button
            size="sm"
            onClick={handleGetDetails}
            disabled={getPanNoDetailsMutation.isPending || isFetching}
            className="h-8 px-3 text-xs font-medium gap-1.5 min-w-[100px]"
          >
            {getPanNoDetailsMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Get Details</span>
            )}
          </Button>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching || getPanNoDetailsMutation.isPending}
            className="h-8 px-2.5 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Loading banner when getPanNoDetails is in progress */}
      {getPanNoDetailsMutation.isPending && (
        <div className="flex items-center gap-2.5 p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-medium">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Fetching PAN details from server (Limit: {limit})... Please wait.</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Failed to fetch PAN verify list: </span>
            <span>
              {error?.response?.data?.message ||
                error?.message ||
                "Unknown error occurred"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-auto text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Table Area */}
      <div className="rounded-none border flex flex-col w-full bg-white dark:bg-card overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-[var(--team-color)]">
            <TableRow className="bg-[var(--team-color)] hover:bg-[var(--team-color)] border-none">
              <TableHead className="w-[3.5%] h-10 font-semibold text-center text-xs text-white px-1">
                Sl.No
              </TableHead>
              {/* 1. pan_no */}
              <TableHead className="w-[8%] h-10 font-semibold text-xs text-white px-1.5">
                PAN No
              </TableHead>
              {/* 2. indicomp_full_name */}
              <TableHead className="w-[12%] h-10 font-semibold text-xs text-white px-1.5">
                Donar Name
              </TableHead>
              {/* 3. indicomp_type */}
              <TableHead className="w-[6.5%] h-10 font-semibold text-xs text-white px-1">
                Type
              </TableHead>
              {/* 4. DOB / DOA (conditional on indicomp_type) */}
              <TableHead className="w-[7.5%] h-10 font-semibold text-xs text-white px-1">
                DOB / DOA
              </TableHead>
              {/* 5. indicomp_father_name */}
              <TableHead className="w-[9.5%] h-10 font-semibold text-xs text-white px-1.5">
                Father Name
              </TableHead>
              {/* 6. full_name */}
              <TableHead className="w-[12%] h-10 font-semibold text-xs text-white px-1.5">
                Pan Name
              </TableHead>
              {/* 7. category */}
              <TableHead className="w-[6%] h-10 font-semibold text-xs text-white px-1">
                Category
              </TableHead>
              {/* 8. dob */}
              <TableHead className="w-[7.5%] h-10 font-semibold text-xs text-white px-1">
                DOB
              </TableHead>
              {/* 9. father_name */}
              <TableHead className="w-[9.5%] h-10 font-semibold text-xs text-white px-1.5">
                Father Name
              </TableHead>
              {/* 10. status */}
              <TableHead className="w-[5.5%] h-10 font-semibold text-xs text-white px-1">
                Status
              </TableHead>
              {/* 11. actions - only for testmasteradmin */}
              {isTestMasterAdmin && (
                <TableHead className="w-[12.5%] h-10 text-center font-semibold text-xs text-white px-1">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {getPanNoDetailsMutation.isPending ? (
              <TableRow>
                <TableCell
                  colSpan={isTestMasterAdmin ? 12 : 11}
                  className="h-44 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2.5 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-foreground">Getting PAN Details...</p>
                    <p className="text-xs text-muted-foreground">
                      Please wait while the server retrieves PAN records for limit {limit}.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="h-10 animate-pulse">
                  <TableCell className="text-center px-1"><div className="h-3.5 w-5 bg-muted rounded mx-auto" /></TableCell>
                  <TableCell className="px-1.5"><div className="h-3.5 w-16 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1.5"><div className="h-3.5 w-20 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1"><div className="h-3.5 w-12 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1"><div className="h-3.5 w-14 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1.5"><div className="h-3.5 w-16 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1.5"><div className="h-3.5 w-20 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1"><div className="h-3.5 w-10 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1"><div className="h-3.5 w-14 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1.5"><div className="h-3.5 w-16 bg-muted rounded" /></TableCell>
                  <TableCell className="px-1"><div className="h-3.5 w-10 bg-muted rounded" /></TableCell>
                  {isTestMasterAdmin && (
                    <TableCell className="text-center px-1">
                      <div className="h-3.5 w-16 bg-muted rounded mx-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : displayItems.length > 0 ? (
              displayItems.map((item, index) => {
                const serialNumber = pageIndex * effectivePageSize + index + 1;
                const isNameMismatch = checkNameMismatch(item);

                return (
                  <TableRow
                    key={item.id ?? index}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {/* S. No. */}
                    <TableCell className="text-center text-xs font-medium text-muted-foreground px-1 py-1.5">
                      {serialNumber}
                    </TableCell>

                    {/* 1. pan_no */}
                    <TableCell className="text-xs font-mono font-semibold tracking-tight px-1.5 py-1.5 truncate" title={item.pan_no || item.indicomp_pan_no}>
                      {item.pan_no || item.indicomp_pan_no || "-"}
                    </TableCell>

                    {/* 2. indicomp_full_name */}
                    <TableCell className="text-xs font-medium px-1.5 py-1.5 break-words leading-tight" title={item.indicomp_full_name}>
                      {item.indicomp_full_name || "-"}
                    </TableCell>

                    {/* 3. indicomp_type */}
                    <TableCell className="text-xs px-1 py-1.5">
                      {item.indicomp_type ? (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                          {item.indicomp_type}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    {/* 4. DOB / DOA (conditional on indicomp_type) */}
                    <TableCell className="text-xs px-1 py-1.5 whitespace-nowrap">
                      {getDateDisplay(item)}
                    </TableCell>

                    {/* 5. indicomp_father_name */}
                    <TableCell className="text-xs px-1.5 py-1.5 text-muted-foreground break-words leading-tight" title={item.indicomp_father_name}>
                      {item.indicomp_father_name || "-"}
                    </TableCell>

                    {/* 6. full_name */}
                    <TableCell className="text-xs font-medium px-1.5 py-1.5 break-words leading-tight" title={item.full_name}>
                      {item.full_name || "-"}
                    </TableCell>

                    {/* 7. category */}
                    <TableCell className="text-xs capitalize px-1 py-1.5 truncate" title={item.category}>
                      {item.category || "-"}
                    </TableCell>

                    {/* 8. dob */}
                    <TableCell className="text-xs px-1 py-1.5 whitespace-nowrap">
                      {formatDate(item.dob)}
                    </TableCell>

                    {/* 9. father_name */}
                    <TableCell className="text-xs px-1.5 py-1.5 text-muted-foreground break-words leading-tight" title={item.father_name}>
                      {item.father_name || "-"}
                    </TableCell>

                    {/* 10. status */}
                    <TableCell className="text-xs px-1 py-1.5">
                      {renderStatus(item.status)}
                    </TableCell>

                    {/* 11. actions - only for testmasteradmin */}
                    {isTestMasterAdmin && (
                      <TableCell className="text-center px-1 py-1.5">
                        <div className="flex items-center justify-center gap-1 flex-nowrap">
                          {/* Error badge for mismatch */}
                          {isNameMismatch ? (
                            <Badge
                              variant="destructive"
                              className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-300 gap-0.5 text-[10px] px-1 py-0 h-5 font-medium shrink-0"
                              title="Name mismatch"
                            >
                              <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                              <span>Mismatch</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 gap-0.5 text-[10px] px-1 py-0 h-5 font-medium shrink-0"
                              title="Names matched"
                            >
                              <span>Matched</span>
                            </Badge>
                          )}

                          {/* Verify API trigger action */}
                          <Button
                            variant={isNameMismatch ? "destructive" : "default"}
                            size="sm"
                            disabled={verifyMutation.isPending}
                            onClick={() => setConfirmRecord(item)}
                            className="h-6 px-1.5 text-[11px] gap-0.5 font-medium shrink-0"
                            title="Trigger verification"
                          >
                            {verifyMutation.isPending && confirmRecord?.id === item.id ? (
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            ) : (
                              <Check className="h-2.5 w-2.5" />
                            )}
                            <span>Verify</span>
                          </Button>

                          {/* View details */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedRecord(item)}
                            className="h-6 w-6 text-primary hover:bg-primary/10 shrink-0"
                            title="View Record Details"
                          >
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isTestMasterAdmin ? 12 : 11}
                  className="h-32 text-center text-muted-foreground text-sm"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                    <FileText className="h-8 w-8 text-muted-foreground/60" />
                    <p className="font-medium text-foreground">No pending records found</p>
                    <p className="text-xs text-muted-foreground">
                      All PAN records are verified or no unverified records returned from the API.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t bg-muted/20 text-xs">
          <div className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{fromRecord}</span> to{" "}
            <span className="font-medium text-foreground">{toRecord}</span> of{" "}
            <span className="font-medium text-foreground">{totalRecords}</span> entries
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pageIndex <= 0 || isLoading || isFetching}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>

            {/* Current Page Indicator */}
            <span className="px-2 font-medium">
              Page {pageIndex + 1} of {totalPages}
            </span>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pageIndex + 1 >= totalPages || isLoading || isFetching}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            {/* Go to page form */}
            {totalPages > 1 && (
              <form onSubmit={handleJumpToPage} className="flex items-center gap-1.5 ml-2">
                <span className="text-muted-foreground">Go to:</span>
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder="#"
                  className="w-14 h-8 text-xs text-center px-1"
                />
                <Button type="submit" variant="secondary" size="sm" className="h-8 px-2 text-xs">
                  Go
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before PUT /api/ispan-no-verified/{id} */}
      <AlertDialog
        open={!!confirmRecord}
        onOpenChange={(open) => !open && setConfirmRecord(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Verify PAN Record</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-xs pt-2">
                <p className="text-muted-foreground">
                  Confirm verification trigger for this record (<code>PUT /api/ispan-no-verified/{confirmRecord?.id}</code> with <code>indicomp_fts_id</code>):
                </p>

                <div className="p-3 bg-muted/60 rounded-md border space-y-1.5 text-foreground">
                  <div>
                    <span className="font-semibold text-muted-foreground">PAN No:</span>{" "}
                    <span className="font-mono font-bold">
                      {confirmRecord?.pan_no || confirmRecord?.indicomp_pan_no}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Donor Name (CRM):</span>{" "}
                    <span className="font-medium">{confirmRecord?.indicomp_full_name || "-"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">PAN Name:</span>{" "}
                    <span className="font-medium">{confirmRecord?.full_name || "-"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">FTS ID:</span>{" "}
                    <span className="font-medium">{confirmRecord?.indicomp_fts_id || "-"}</span>
                  </div>

                  {confirmRecord && checkNameMismatch(confirmRecord) && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-200 text-red-600 rounded flex items-center gap-1.5 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Notice: Donor Name and PAN Name do not match!</span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={verifyMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRecord) {
                  verifyMutation.mutate({
                    id: confirmRecord.id,
                    indicomp_fts_id: confirmRecord.indicomp_fts_id,
                  });
                }
              }}
              disabled={verifyMutation.isPending}
              className="gap-1.5"
            >
              {verifyMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>Confirm & Verify</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Record Details Dialog for Action button */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>PAN Record Details</span>
            </DialogTitle>
            <DialogDescription>
              Details for PAN:{" "}
              <span className="font-mono font-semibold text-foreground">
                {selectedRecord?.pan_no || selectedRecord?.indicomp_pan_no}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    PAN No
                  </span>
                  <p className="mt-1 font-mono font-semibold">
                    {selectedRecord.pan_no || selectedRecord.indicomp_pan_no || "-"}
                  </p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Status
                  </span>
                  <div className="mt-1">{renderStatus(selectedRecord.status)}</div>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Donor Name
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.indicomp_full_name || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    PAN Name
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.full_name || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Type
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.indicomp_type || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Category
                  </span>
                  <p className="mt-1 capitalize font-medium">{selectedRecord.category || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    DOB / DOA
                  </span>
                  <p className="mt-1 font-medium">{getDateDisplay(selectedRecord)}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    DOB (PAN)
                  </span>
                  <p className="mt-1 font-medium">{formatDate(selectedRecord.dob)}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Father Name (CRM)
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.indicomp_father_name || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Father Name (PAN)
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.father_name || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    FTS ID
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.indicomp_fts_id || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Masked Aadhaar
                  </span>
                  <p className="mt-1 font-mono font-medium">{selectedRecord.masked_aadhaar || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Email
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.indicomp_email || selectedRecord.email || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Phone Number
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.indicomp_mobile_phone || selectedRecord.phone_number || "-"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Verified PAN No
                  </span>
                  <p className="mt-1 font-medium">{selectedRecord.isverified_pan_no || "No"}</p>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    Name Match
                  </span>
                  <div className="mt-1">
                    {checkNameMismatch(selectedRecord) ? (
                      <Badge variant="destructive" className="text-[11px]">Mismatch</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-[11px]">Matched</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PanVerify;
