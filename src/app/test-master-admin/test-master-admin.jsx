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
  Trash2,
} from "lucide-react";
import {
  REMAINDER_GET_CHAPTERS,
  REMAINDER_SEND_REMINDER,
  REMAINDER_CLEAR_REMINDER_SENT,
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

  // Send Reminder State
  const [recipientType, setRecipientType] = useState("1,2");

  // Clear Reminder Dialog State
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

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
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const chapters = useMemo(() => {
    return Array.isArray(rawData) ? rawData : [];
  }, [rawData]);

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

  const selectedChapterCodes = useMemo(() => {
    return Object.keys(rowSelection).filter((key) => rowSelection[key]);
  }, [rowSelection]);

  const filteredChapters = useMemo(() => {
    if (!globalFilter) return chapters;
    const lower = globalFilter.toLowerCase();
    return chapters.filter(
      (c) =>
        String(c.chapter_code).toLowerCase().includes(lower) ||
        String(c.chapter_name || "").toLowerCase().includes(lower)
    );
  }, [chapters, globalFilter]);

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

  const GridShimmer = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse h-12 bg-muted/40 rounded-lg border p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 w-3/4">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-5 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
      ))}
    </div>
  );

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
            Manage chapter reminders and view data received status
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

      {/* Main card with 3-columns layout */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
            {/* Search */}
            <div className="relative w-48 sm:w-56 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chapters..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Select All Checkbox */}
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none px-2.5 h-9 border rounded-md hover:bg-muted/50 bg-background transition-colors shrink-0 whitespace-nowrap">
              <Checkbox
                checked={
                  filteredChapters.length > 0 &&
                  filteredChapters.every((c) =>
                    selectedChapterCodes.includes(String(c.chapter_code))
                  )
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    const newSel = { ...rowSelection };
                    filteredChapters.forEach((c) => {
                      newSel[String(c.chapter_code)] = true;
                    });
                    setRowSelection(newSel);
                  } else {
                    const newSel = { ...rowSelection };
                    filteredChapters.forEach((c) => {
                      delete newSel[String(c.chapter_code)];
                    });
                    setRowSelection(newSel);
                  }
                }}
                className="translate-y-[1px]"
              />
              <span>Select All ({filteredChapters.length})</span>
            </label>

            {/* Selection controls right next to Select All in one line */}
            {selectedChapterCodes.length > 0 && (
              <div className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 rounded-md px-3 h-9 text-xs shrink-0 whitespace-nowrap">
                <span className="font-semibold text-primary">
                  {selectedChapterCodes.length} chapter
                  {selectedChapterCodes.length === 1 ? "" : "s"} selected
                </span>

                {/* User Type Selection Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                    Send to:
                  </span>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger className="h-7 w-36 text-xs bg-background dark:bg-background/80 px-2.5">
                      <SelectValue placeholder="Select recipient" />
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
            ) : filteredChapters.length ? (
              <>
                {/* 3 Columns Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-6">
                  {filteredChapters.map((chapter) => {
                    const code = String(chapter.chapter_code);
                    const isSelected = !!rowSelection[code];
                    const isYes =
                      String(chapter.chapter_received_data).toLowerCase() ===
                      "yes";

                    return (
                      <div
                        key={code}
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
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/40"
                            : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
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
                            aria-label={`Select chapter ${chapter.chapter_code}`}
                            className="translate-y-[1px]"
                          />
                          <Badge
                            variant="outline"
                            className="text-xs font-mono font-medium shrink-0"
                          >
                            {chapter.chapter_code}
                          </Badge>
                          <span
                            className="font-medium text-xs text-foreground truncate"
                            title={chapter.chapter_name}
                          >
                            {chapter.chapter_name || "-"}
                          </span>
                        </div>
                        {isYes && (
                          <span
                            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2"
                            title="Received Data: Yes"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t text-xs text-muted-foreground">
                  <div>
                    Total {filteredChapters.length} chapters
                    {selectedChapterCodes.length > 0 && (
                      <span className="font-semibold text-primary ml-2">
                        • {selectedChapterCodes.length} selected
                      </span>
                    )}
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
