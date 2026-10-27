import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "@/config/base-url";
import { toast } from "sonner";
import {
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
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
  DialogFooter,
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

import {
  getCurrentFinancialYear,
  fetchFinancialYearsFromApi,
} from "@/utils/financial-year";

const FINANCIAL_MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

// Helper to get current month name (e.g. "October")
const getCurrentMonthName = () => {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long" });
};

// Helper to get available months (hiding future months for current year)
const getAvailableMonths = (selectedYear, currYear) => {
  if (!selectedYear || selectedYear === currYear) {
    const currMonth = getCurrentMonthName();
    const currMonthIdx = FINANCIAL_MONTHS.indexOf(currMonth);
    if (currMonthIdx !== -1) {
      return FINANCIAL_MONTHS.slice(0, currMonthIdx + 1);
    }
  }
  return FINANCIAL_MONTHS;
};

const CPRBank = () => {
  const currentYear = useMemo(() => getCurrentFinancialYear(), []);
  const currentMonth = useMemo(() => getCurrentMonthName(), []);

  const [data, setData] = useState(null);
  const [bankList, setBankList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Financial Year list strictly from API
  const [financialYearList, setFinancialYearList] = useState(() => {
    const c = Cookies.get("currentYear") || currentYear;
    return c ? [c] : ["2026-27"];
  });

  useEffect(() => {
    if (Cookies.get("currentYear")) return;
    fetchFinancialYearsFromApi().then((list) => {
      if (list && list.length > 0) {
        setFinancialYearList(list);
        setFormData((prev) => ({
          ...prev,
          financial_year: list.includes(prev.financial_year) ? prev.financial_year : list[0],
        }));
      }
    });
  }, [currentYear]);

  // Post CPR Bank Form & Modal State
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    financial_year: currentYear,
    financial_month: currentMonth,
    subs: [{ bank_name: "", bank_balance: "" }],
  });

  // Edit CPR Bank State (3. GET by id & 5. PUT by id)
  const [openEditModal, setOpenEditModal] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    financial_year: "",
    financial_month: "",
    bank_name: "",
    bank_balance: "",
  });

  // Delete CPR Bank State (4. DELETE by id)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Automatically triggers GET /api/cpr-bank on page load
  const fetchBankData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const token = Cookies.get("token");

      const response = await axios.get(`${BASE_URL}/api/cpr-bank`, {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("cpr-bank response:", response.data);
      setData(response.data);

      const raw = response.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.cpr_bank)
        ? raw.cpr_bank
        : Array.isArray(raw?.banks)
        ? raw.banks
        : Array.isArray(raw?.bank)
        ? raw.bank
        : raw?.data && typeof raw.data === "object"
        ? [raw.data]
        : [];

      setBankList(list);
    } catch (error) {
      console.error("Error fetching cpr-bank:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch cpr-bank data";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankData();
  }, [fetchBankData]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenModal();
    }
  }, [location.state]);

  // Open modal with current financial year and current month as default
  const handleOpenModal = () => {
    setFormData({
      financial_year: currentYear,
      financial_month: currentMonth,
      subs: [{ bank_name: "", bank_balance: "" }],
    });
    setOpenModal(true);
  };

  const handleAddSubRow = () => {
    setFormData((prev) => ({
      ...prev,
      subs: [...prev.subs, { bank_name: "", bank_balance: "" }],
    }));
  };

  const handleRemoveSubRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      subs: prev.subs.filter((_, i) => i !== index),
    }));
  };

  const handleSubChange = (index, field, value) => {
    setFormData((prev) => {
      const newSubs = [...prev.subs];
      newSubs[index] = { ...newSubs[index], [field]: value };
      return { ...prev, subs: newSubs };
    });
  };

  // Submit POST /api/cpr-bank
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.financial_year.trim()) {
      toast.error("Please enter a financial year");
      return;
    }
    if (!formData.financial_month.trim()) {
      toast.error("Please select a financial month");
      return;
    }
    if (formData.subs.length === 0) {
      toast.error("Please add at least one bank row");
      return;
    }

    const hasAtLeastOneBank = formData.subs.some(
      (s) => s.bank_name && s.bank_name.trim() !== ""
    );
    if (!hasAtLeastOneBank) {
      toast.error("Please provide a bank name for at least one entry");
      return;
    }

    try {
      setSubmitting(true);
      const token = Cookies.get("token");

      const payload = {
        financial_year: formData.financial_year.trim(),
        financial_month: formData.financial_month.trim(),
        subs: formData.subs.map((item) => ({
          bank_name: item.bank_name.trim(),
          bank_balance: item.bank_balance,
        })),
      };

      console.log("Submitting POST cpr-bank payload:", payload);

      const response = await axios.post(`${BASE_URL}/api/cpr-bank`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("POST cpr-bank response:", response.data);

      toast.success(
        response.data?.message || "CPR Bank details saved successfully!"
      );
      setOpenModal(false);
      // Refresh the list after posting
      fetchBankData();
    } catch (error) {
      console.error("Error submitting cpr-bank:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save CPR Bank data"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 3. API GET by id: cpr-bank/{id}
  const handleOpenEdit = async (item) => {
    if (!item?.id) {
      toast.error("Record ID is missing");
      return;
    }
    setSelectedItem(item);
    // Pre-fill immediate values from the clicked row
    setEditFormData({
      financial_year: item.financial_year || currentYear,
      financial_month: item.financial_month || currentMonth,
      bank_name: item.bank_name || "",
      bank_balance: item.bank_balance ?? "",
    });
    setOpenEditModal(true);
    setFetchingEdit(true);

    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${BASE_URL}/api/cpr-bank/${item.id}`, {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log(`GET /api/cpr-bank/${item.id} response:`, res.data);
      const detail = res.data?.data || res.data?.cpr_bank || res.data;
      if (detail && typeof detail === "object") {
        setEditFormData({
          financial_year: detail.financial_year || item.financial_year || currentYear,
          financial_month: detail.financial_month || item.financial_month || currentMonth,
          bank_name: detail.bank_name ?? item.bank_name ?? "",
          bank_balance: detail.bank_balance ?? item.bank_balance ?? "",
        });
      }
    } catch (err) {
      console.error("Error fetching cpr-bank by ID:", err);
      // Keep row data in form if fetch by id errors
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load bank details"
      );
    } finally {
      setFetchingEdit(false);
    }
  };

  // 5. API PUT: cpr-bank/{id}
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem?.id) return;

    if (!editFormData.financial_year?.trim()) {
      toast.error("Please enter a financial year");
      return;
    }
    if (!editFormData.financial_month?.trim()) {
      toast.error("Please select a financial month");
      return;
    }
    if (!editFormData.bank_name?.trim()) {
      toast.error("Please enter a bank name");
      return;
    }

    try {
      setEditSubmitting(true);
      const token = Cookies.get("token");

      const bankName = editFormData.bank_name.trim();
      const bankBalance = editFormData.bank_balance ?? "";
      const finYear = editFormData.financial_year || currentYear;
      const finMonth = editFormData.financial_month || currentMonth;

      // Send as application/x-www-form-urlencoded (standard for PHP PUT parsers)
      const params = new URLSearchParams();
      params.append("financial_year", finYear);
      params.append("financial_month", finMonth);
      params.append("bank_name", bankName);
      params.append("bank_balance", bankBalance);

      console.log(`Submitting PUT /api/cpr-bank/${selectedItem.id}:`, params.toString());

      const res = await axios.put(
        `${BASE_URL}/api/cpr-bank/${selectedItem.id}`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("PUT cpr-bank response:", res.data);
      toast.success(res.data?.message || "CPR Bank record updated successfully!");
      setOpenEditModal(false);
      setSelectedItem(null);
      fetchBankData();
    } catch (err) {
      console.error("Error updating cpr-bank:", err);
      console.log("Backend error response:", err?.response?.data);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update CPR Bank record"
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  // 4. API DELETE: cpr-bank/{id}
  const handleOpenDelete = (item) => {
    if (!item?.id) {
      toast.error("Record ID is missing");
      return;
    }
    setItemToDelete(item);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;

    try {
      setDeleting(true);
      const token = Cookies.get("token");

      const res = await axios.delete(`${BASE_URL}/api/cpr-bank/${itemToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`DELETE /api/cpr-bank/${itemToDelete.id} response:`, res.data);
      toast.success(res.data?.message || "CPR Bank record deleted successfully!");
      setOpenDeleteDialog(false);
      setItemToDelete(null);
      fetchBankData();
    } catch (err) {
      console.error("Error deleting cpr-bank:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete CPR Bank record"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Extract columns dynamically from the backend response excluding id & chapter_id
  const columns = useMemo(() => {
    if (!bankList || bankList.length === 0) return [];

    const excludedKeys = new Set([
      "id",
      "chapter_id",
      "created_at",
      "updated_at",
      "deleted_at",
    ]);

    const keySet = new Set();
    bankList.forEach((item) => {
      if (item && typeof item === "object") {
        Object.keys(item).forEach((k) => {
          if (!excludedKeys.has(k.toLowerCase()) && typeof item[k] !== "object") {
            keySet.add(k);
          }
        });
      }
    });

    const priorityOrder = [
      "chapter_name",
      "financial_year",
      "financial_month",
      "bank_name",
      "bank_balance",
    ];

    return Array.from(keySet).sort((a, b) => {
      const idxA = priorityOrder.indexOf(a);
      const idxB = priorityOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [bankList]);

  // Filter based on search query
  const filteredList = useMemo(() => {
    if (!search.trim()) return bankList;
    const term = search.toLowerCase();
    return bankList.filter((item) => {
      if (!item || typeof item !== "object") return false;
      return Object.values(item).some((val) =>
        String(val ?? "").toLowerCase().includes(term)
      );
    });
  }, [bankList, search]);

  const formatHeader = (key) => {
    if (key === "chapter_name") return "Chapter Name";
    if (key === "financial_year") return "Financial Year";
    if (key === "financial_month") return "Financial Month";
    if (key === "bank_name") return "Bank Name";
    if (key === "bank_balance") return "Bank Balance";
    return key
      .replace(/^chapter_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center font-bold">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              CPR Bank
            </h1>
            <p className="text-xs text-slate-500">Bank details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchBankData}
            disabled={loading}
            className="text-xs gap-1.5 cursor-pointer border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenModal}
            className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add CPR Bank
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Subheader / Filter toolbar when data exists */}
        {!loading && bankList.length > 0 && (
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search bank records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-8 bg-white border-slate-300"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium self-end sm:self-auto">
              Total Records:{" "}
              <Badge variant="secondary" className="font-semibold text-xs ml-1">
                {filteredList.length}
              </Badge>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0284c7]" />
            <p className="text-xs font-medium text-slate-600">
              Loading CPR Bank data...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && bankList.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-red-600">{errorMsg}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchBankData}
              className="text-xs gap-1.5 cursor-pointer mt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Fetched and has data */}
        {!loading && bankList.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/60 hover:bg-sky-50/60 border-b border-slate-200">
                  <TableHead className="w-12 text-center font-bold text-xs text-slate-700">
                    Sl.no
                  </TableHead>
                  {columns.map((col) => (
                    <TableHead
                      key={col}
                      className="font-bold text-xs text-slate-700 uppercase tracking-wider min-w-[130px]"
                    >
                      {formatHeader(col)}
                    </TableHead>
                  ))}
                  <TableHead className="w-20 text-center font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((row, idx) => (
                  <TableRow
                    key={row.id || idx}
                    className="hover:bg-slate-50 transition border-b border-slate-100"
                  >
                    <TableCell className="text-center font-medium text-xs text-slate-500">
                      {idx + 1}
                    </TableCell>
                    {columns.map((col) => {
                      const val = row[col];
                      return (
                        <TableCell
                          key={col}
                          className="text-xs text-slate-800 font-medium py-3"
                        >
                          {val !== null && val !== undefined && String(val).trim() !== "" ? (
                            String(val)
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(row)}
                          title="Edit CPR Bank"
                          className="h-7 w-7 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(row)}
                          title="Delete CPR Bank"
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Fetched but empty */}
        {!loading && !errorMsg && bankList.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-xs font-medium text-slate-600">
              No bank records returned from backend.
            </p>
            {data?.message && (
              <p className="text-xs text-slate-500 italic">
                Backend message: "{data.message}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dialog for 2.post cpr-bank */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Landmark className="w-5 h-5 text-[#0284c7]" />
              Add CPR Bank Balance
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Save CPR bank details for the specified financial year and month.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Financial Year & Financial Month */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financial Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.financial_year}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    const availMonths = getAvailableMonths(newYear, currentYear);
                    const newMonth = availMonths.includes(formData.financial_month)
                      ? formData.financial_month
                      : availMonths[availMonths.length - 1];
                    setFormData({
                      ...formData,
                      financial_year: newYear,
                      financial_month: newMonth,
                    });
                  }}
                  className="w-full h-9 border border-slate-300 rounded-md px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                  required
                >
                  {financialYearList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financial Month <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.financial_month}
                  onChange={(e) =>
                    setFormData({ ...formData, financial_month: e.target.value })
                  }
                  className="w-full h-9 border border-slate-300 rounded-md px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                  required
                >
                  {getAvailableMonths(formData.financial_year, currentYear).map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Sub Bank List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubRow}
                  className="text-xs h-7 gap-1 text-[#0284c7] border-sky-200 hover:bg-sky-50"
                >
                  <Plus className="w-3 h-3" />
                  Add Row
                </Button>
              </div>

              <div className="space-y-2">
                {formData.subs.map((sub, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200"
                  >
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Bank Name"
                        value={sub.bank_name}
                        onChange={(e) =>
                          handleSubChange(index, "bank_name", e.target.value)
                        }
                        className="text-xs h-8 bg-white"
                        required
                      />
                    </div>
                    <div className="w-40">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Balance ₹"
                        value={sub.bank_balance}
                        onChange={(e) =>
                          handleSubChange(index, "bank_balance", e.target.value)
                        }
                        className="text-xs h-8 bg-white text-right"
                      />
                    </div>
                    {formData.subs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubRow(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenModal(false)}
                disabled={submitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold gap-1.5 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save CPR Bank"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog for 3.get by id & 5.put cpr-bank/{id} */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Landmark className="w-5 h-5 text-[#0284c7]" />
              Edit CPR Bank
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update CPR bank record details.
            </DialogDescription>
          </DialogHeader>

          {fetchingEdit ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#0284c7]" />
              <p className="text-xs text-slate-500 font-medium">
                Loading bank details...
              </p>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Financial Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.financial_year}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      const availMonths = getAvailableMonths(newYear, currentYear);
                      const newMonth = availMonths.includes(editFormData.financial_month)
                        ? editFormData.financial_month
                        : availMonths[availMonths.length - 1];
                      setEditFormData({
                        ...editFormData,
                        financial_year: newYear,
                        financial_month: newMonth,
                      });
                    }}
                    className="w-full h-9 border border-slate-300 rounded-md px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                    required
                  >
                    {financialYearList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                    {editFormData.financial_year &&
                      !financialYearList.includes(editFormData.financial_year) && (
                        <option value={editFormData.financial_year}>
                          {editFormData.financial_year}
                        </option>
                      )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Financial Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.financial_month}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        financial_month: e.target.value,
                      })
                    }
                    className="w-full h-9 border border-slate-300 rounded-md px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                    required
                  >
                    {getAvailableMonths(editFormData.financial_year, currentYear).map(
                      (m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Bank Name"
                    value={editFormData.bank_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        bank_name: e.target.value,
                      })
                    }
                    className="text-xs h-9 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Balance
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Bank Balance ₹"
                    value={editFormData.bank_balance}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        bank_balance: e.target.value,
                      })
                    }
                    className="text-xs h-9 bg-white"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenEditModal(false)}
                  disabled={editSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={editSubmitting}
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold gap-1.5 shadow-sm"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update CPR Bank"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog for 4.delete cpr-bank/{id} */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-800">
              Delete CPR Bank Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete the record for{" "}
              <strong className="text-slate-800 font-semibold">
                {itemToDelete?.bank_name || "this bank"}
              </strong>
              {itemToDelete?.financial_year && (
                <>
                  {" "}
                  ({itemToDelete.financial_year} - {itemToDelete.financial_month})
                </>
              )}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-end">
            <AlertDialogCancel
              disabled={deleting}
              onClick={() => {
                setOpenDeleteDialog(false);
                setItemToDelete(null);
              }}
              className="text-xs h-8"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 font-semibold gap-1.5"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CPRBank;
