import React, { useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  Check,
  Loader2,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import {
  REMAINDER_GET_CHAPTERS,
  REMAINDER_SEND_REMINDER,
  REMAINDER_CLEAR_REMINDER_SENT,
  REMAINDER_UPDATE_REMINDER,
} from "@/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

const TestMasterAdmin = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [updatingChapterCode, setUpdatingChapterCode] = useState(null);

  // Send Reminder State
  const [recipientType, setRecipientType] = useState("1,2");

  // Clear Reminder Dialog State
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

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

  // 1. Fetch Chapters API (GET /api/getChapters)
  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["remainder-getChapters"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(REMAINDER_GET_CHAPTERS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const resData = response.data;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.data)) return resData.data;
      if (Array.isArray(resData?.chapters)) return resData.chapters;
      return [];
    },
    enabled: !!isTestMasterAdmin,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const chapters = useMemo(() => {
    return Array.isArray(rawData) ? rawData : [];
  }, [rawData]);

  // Counts for status
  const counts = useMemo(() => {
    let yes = 0;
    let no = 0;
    chapters.forEach((c) => {
      if (String(c.chapter_received_data).toLowerCase() === "yes") {
        yes++;
      } else {
        no++;
      }
    });
    return { total: chapters.length, yes, no };
  }, [chapters]);

  // 2. Send Reminder API (POST /api/sendReminder)
  const sendReminderMutation = useMutation({
    mutationFn: async ({ chapter_code, user_type }) => {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("chapter_code", chapter_code);
      formData.append("user_type", user_type);

      const response = await axios.post(REMAINDER_SEND_REMINDER, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Reminder sent successfully!");
      setRowSelection({});
      refetch();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reminder. Please try again."
      );
    },
  });

  // 3. Clear Reminder Sent API (GET /api/clearReminderSent)
  const clearReminderMutation = useMutation({
    mutationFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(REMAINDER_CLEAR_REMINDER_SENT, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Reminder sent cleared successfully!");
      setClearDialogOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to clear reminder sent."
      );
      setClearDialogOpen(false);
    },
  });

  // 4. Update Reminder API (POST /api/updateReminder)
  const updateReminderMutation = useMutation({
    mutationFn: async ({ chapter_code, status, user_type }) => {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("chapter_code", chapter_code);
      formData.append("status", status);
      if (user_type || recipientType) {
        formData.append("user_type", user_type || recipientType);
      }

      const response = await axios.post(REMAINDER_UPDATE_REMINDER, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Reminder status updated successfully!");
      setUpdatingChapterCode(null);
      setRowSelection({});
      refetch();
    },
    onError: (err) => {
      setUpdatingChapterCode(null);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update reminder status."
      );
    },
  });

  const handleToggleStatus = (code, currentStatus) => {
    const isCurrentlyYes = String(currentStatus).toLowerCase() === "yes";
    const newStatus = isCurrentlyYes ? "No" : "Yes";
    setUpdatingChapterCode(code);
    updateReminderMutation.mutate({
      chapter_code: code,
      status: newStatus,
      user_type: recipientType || "1,2",
    });
  };

  const handleBulkUpdateStatus = (status) => {
    if (selectedChapterCodes.length === 0) {
      toast.error("Please select at least one chapter.");
      return;
    }
    setUpdatingChapterCode("bulk");
    updateReminderMutation.mutate({
      chapter_code: selectedChapterCodes.join(","),
      status,
      user_type: recipientType || "1,2",
    });
  };

  const selectedChapterCodes = useMemo(() => {
    return Object.keys(rowSelection).filter((key) => rowSelection[key]);
  }, [rowSelection]);

  const allChapters = useMemo(() => {
    if (!globalFilter) return chapters;
    const lower = globalFilter.toLowerCase();
    return chapters.filter(
      (c) =>
        String(c.chapter_code).toLowerCase().includes(lower) ||
        String(c.chapter_name || "")
          .toLowerCase()
          .includes(lower)
    );
  }, [chapters, globalFilter]);

  const pendingChapters = useMemo(() => {
    return allChapters.filter(
      (c) => String(c.chapter_received_data).toLowerCase() !== "yes"
    );
  }, [allChapters]);

  const receivedChapters = useMemo(() => {
    return allChapters.filter(
      (c) => String(c.chapter_received_data).toLowerCase() === "yes"
    );
  }, [allChapters]);

  const handleSelectColumn = (colChapters) => {
    const allSelected =
      colChapters.length > 0 &&
      colChapters.every((c) => !!rowSelection[String(c.chapter_code)]);
    setRowSelection((prev) => {
      const updated = { ...prev };
      colChapters.forEach((c) => {
        if (allSelected) {
          delete updated[String(c.chapter_code)];
        } else {
          updated[String(c.chapter_code)] = true;
        }
      });
      return updated;
    });
  };

  const handleSendReminder = () => {
    if (selectedChapterCodes.length === 0) {
      toast.error("Please select at least one chapter.");
      return;
    }
    if (!recipientType) {
      toast.error("Please select a recipient (User, Admin, or Both).");
      return;
    }
    sendReminderMutation.mutate({
      chapter_code: selectedChapterCodes.join(","),
      user_type: recipientType,
    });
  };

  if (!isTestMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-6">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Remainder management is restricted and only accessible for Test Master Admin login.
        </p>
      </div>
    );
  }

  const GridShimmer = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6">
      {[1, 2, 3].map((col) => (
        <div
          key={col}
          className="bg-muted/20 border rounded-xl p-4 space-y-3"
        >
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse h-11 bg-muted/40 rounded-lg border p-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 w-3/4">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderChapterCard = (chapter, sourceCol) => {
    const code = String(chapter.chapter_code);
    const isSelected = !!rowSelection[code];
    const isYes =
      String(chapter.chapter_received_data).toLowerCase() === "yes";
    const displayName =
      (chapter.chapter_name || "-").replace(/\bchapter\b/gi, "").trim() ||
      chapter.chapter_name ||
      "-";

    return (
      <div
        key={`${sourceCol}-${code}`}
        onClick={() => {
          setRowSelection((prev) => {
            const updated = { ...prev };
            if (updated[code]) {
              delete updated[code];
            } else {
              updated[code] = true;
            }
            return updated;
          });
        }}
        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/40"
            : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {
              setRowSelection((prev) => {
                const updated = { ...prev };
                if (updated[code]) {
                  delete updated[code];
                } else {
                  updated[code] = true;
                }
                return updated;
              });
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select chapter ${displayName}`}
            className="translate-y-[1px]"
          />
          <span
            className="font-medium text-xs text-foreground truncate"
            title={displayName}
          >
            {displayName}
          </span>
        </div>

        {/* Interactive Status Toggle Badge / Button */}
        <div
          className="shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={updateReminderMutation.isPending}
            onClick={() =>
              handleToggleStatus(code, chapter.chapter_received_data)
            }
            title={`Data Received: ${
              isYes ? "Yes" : "No"
            }. Click to mark as ${isYes ? "No" : "Yes"}.`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer select-none ${
              isYes
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/60"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground dark:bg-muted/30"
            } ${
              updateReminderMutation.isPending &&
              updatingChapterCode === code
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            {updateReminderMutation.isPending &&
            updatingChapterCode === code ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isYes ? (
              <Check className="h-3 w-3 stroke-[2.5]" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>{isYes ? "Yes" : "No"}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Remainder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage chapter reminders and update data received status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Clear Reminder Sent Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setClearDialogOpen(true)}
            disabled={clearReminderMutation.isPending}
            className="h-9 gap-1.5 text-xs"
          >
            {clearReminderMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Clear Reminder Sent</span>
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 whitespace-nowrap">
            {/* Search */}
            <div className="relative w-44 sm:w-48 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chapters..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* User Type Dropdown */}
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger className="h-9 w-44 text-xs bg-background shrink-0">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1,2" className="text-xs">
                  Both (User & Admin)
                </SelectItem>
                <SelectItem value="1" className="text-xs">
                  User
                </SelectItem>
                <SelectItem value="2" className="text-xs">
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Select All Checkbox */}
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none px-2.5 h-9 border rounded-md hover:bg-muted/50 bg-background transition-colors shrink-0 whitespace-nowrap">
              <Checkbox
                checked={
                  allChapters.length > 0 &&
                  allChapters.every((c) =>
                    selectedChapterCodes.includes(String(c.chapter_code))
                  )
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    const newSel = { ...rowSelection };
                    allChapters.forEach((c) => {
                      newSel[String(c.chapter_code)] = true;
                    });
                    setRowSelection(newSel);
                  } else {
                    const newSel = { ...rowSelection };
                    allChapters.forEach((c) => {
                      delete newSel[String(c.chapter_code)];
                    });
                    setRowSelection(newSel);
                  }
                }}
                className="translate-y-[1px]"
              />
              <span>Select All ({allChapters.length})</span>
            </label>

            {/* Selection controls right next to Select All in one line */}
            {selectedChapterCodes.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-md px-2.5 h-9 text-xs shrink-0 whitespace-nowrap">
                {/* Bulk Status Update */}
                <div className="flex items-center gap-1 border-r border-primary/20 pr-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkUpdateStatus("Yes")}
                    disabled={updateReminderMutation.isPending}
                    className="h-7 px-2 text-xs font-medium gap-1 text-emerald-600 hover:text-emerald-700 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                  >
                    {updateReminderMutation.isPending &&
                    updatingChapterCode === "bulk" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    )}
                    <span>Yes</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkUpdateStatus("No")}
                    disabled={updateReminderMutation.isPending}
                    className="h-7 px-2 text-xs font-medium gap-1 text-rose-600 hover:text-rose-700 bg-background hover:bg-rose-50 dark:hover:bg-rose-950/60"
                  >
                    {updateReminderMutation.isPending &&
                    updatingChapterCode === "bulk" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5 stroke-[2.5]" />
                    )}
                    <span>No</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRowSelection({})}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Selection
                </Button>

                <Button
                  size="sm"
                  onClick={handleSendReminder}
                  disabled={sendReminderMutation.isPending}
                  className="h-7 px-3 text-xs gap-1.5"
                >
                  {sendReminderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      <span>Send Reminder</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div>
            {isLoading ? (
              <GridShimmer />
            ) : isError ? (
              <div className="h-44 flex flex-col items-center justify-center gap-2 p-6">
                <p className="text-sm font-medium text-destructive">
                  Failed to load chapters:{" "}
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Unknown error"}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : allChapters.length ? (
              <>
                {/* 3 Columns Layout: ALL, Pending (No), Received (Yes) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
                  {/* Column 1: ALL */}
                  <div className="flex flex-col bg-muted/20 border rounded-xl p-3 sm:p-4 min-w-0">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">All</span>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {allChapters.length}
                        </Badge>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                        <Checkbox
                          checked={
                            allChapters.length > 0 &&
                            allChapters.every(
                              (c) => !!rowSelection[String(c.chapter_code)]
                            )
                          }
                          onCheckedChange={() => handleSelectColumn(allChapters)}
                          className="translate-y-[1px]"
                        />
                        <span>Select All</span>
                      </label>
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-[620px] pr-1">
                      {allChapters.length ? (
                        allChapters.map((c) => renderChapterCard(c, "all"))
                      ) : (
                        <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                          No chapters found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Pending (No) */}
                  <div className="flex flex-col bg-rose-50/30 dark:bg-rose-950/10 border border-rose-200/60 dark:border-rose-900/40 rounded-xl p-3 sm:p-4 min-w-0">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-200/60 dark:border-rose-900/40">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                        <X className="h-4 w-4" />
                        <span className="font-semibold text-sm">Pending (No)</span>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/40"
                        >
                          {pendingChapters.length}
                        </Badge>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                        <Checkbox
                          checked={
                            pendingChapters.length > 0 &&
                            pendingChapters.every(
                              (c) => !!rowSelection[String(c.chapter_code)]
                            )
                          }
                          onCheckedChange={() => handleSelectColumn(pendingChapters)}
                          className="translate-y-[1px]"
                        />
                        <span>Select All</span>
                      </label>
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-[620px] pr-1">
                      {pendingChapters.length ? (
                        pendingChapters.map((c) =>
                          renderChapterCard(c, "pending")
                        )
                      ) : (
                        <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                          No pending chapters
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Received (Yes) */}
                  <div className="flex flex-col bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl p-3 sm:p-4 min-w-0">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Check className="h-4 w-4 stroke-[2.5]" />
                        <span className="font-semibold text-sm">Received (Yes)</span>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40"
                        >
                          {receivedChapters.length}
                        </Badge>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                        <Checkbox
                          checked={
                            receivedChapters.length > 0 &&
                            receivedChapters.every(
                              (c) => !!rowSelection[String(c.chapter_code)]
                            )
                          }
                          onCheckedChange={() => handleSelectColumn(receivedChapters)}
                          className="translate-y-[1px]"
                        />
                        <span>Select All</span>
                      </label>
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-[620px] pr-1">
                      {receivedChapters.length ? (
                        receivedChapters.map((c) =>
                          renderChapterCard(c, "received")
                        )
                      ) : (
                        <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                          No received chapters
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t text-xs text-muted-foreground">
                  <div>
                    Total {allChapters.length} chapter
                    {allChapters.length === 1 ? "" : "s"}
                    {selectedChapterCodes.length > 0 && (
                      <span className="font-semibold text-primary ml-2">
                        • {selectedChapterCodes.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      All: <strong className="text-foreground">{allChapters.length}</strong>
                    </span>
                    <span className="text-rose-600 font-medium">
                      Pending (No): <strong>{pendingChapters.length}</strong>
                    </span>
                    <span className="text-emerald-600 font-medium">
                      Received (Yes): <strong>{receivedChapters.length}</strong>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
                <Building2 className="w-8 h-8 text-muted-foreground/60 mb-1" />
                <span>No chapters found</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clear Reminder Sent Alert Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Clear Reminder Sent?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the reminder sent status for chapters. Are you sure
              you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearReminderMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                clearReminderMutation.mutate();
              }}
              disabled={clearReminderMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5"
            >
              {clearReminderMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>Yes, Clear</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestMasterAdmin;
