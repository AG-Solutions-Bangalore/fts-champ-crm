import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment";
import BASE_URL from "@/config/base-url";
import { toast } from "sonner";
import {
  Compass,
  Loader2,
  RefreshCw,
  Search,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Calendar,
  Eye,
  X,
  Upload,
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

// Helper to get current month name
const getCurrentMonthName = () => {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long" });
};

// Helper to get available months (allowing previous months up to current month for current year, or all for past years)
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

// Helper to get today's date formatted as YYYY-MM-DD
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Convert File to base64 Data URL
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const CPRVanyatra = () => {
  const currentYear = useMemo(() => getCurrentFinancialYear(), []);
  const currentMonth = useMemo(() => getCurrentMonthName(), []);
  const todayDate = useMemo(() => getTodayDateString(), []);

  const [vanyatraList, setVanyatraList] = useState([]);
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

  // Create Modal State (POST /api/cpr-vanyatra)
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [formData, setFormData] = useState({
    financial_year: currentYear,
    financial_month: currentMonth,
    subs: [
      {
        conducted_by: "",
        vanyatra_date: "",
        vanyatra_visited: "",
        no_of_days: "",
        vanyatra_image1: "",
        vanyatra_image2: "",
        image1_preview: "",
        image2_preview: "",
      },
    ],
  });

  // Edit Modal State (3. GET by ID, 4. PUT by ID)
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editFormData, setEditFormData] = useState({
    financial_year: "",
    financial_month: "",
    conducted_by: "",
    vanyatra_date: "",
    vanyatra_visited: "",
    no_of_days: "",
    vanyatra_image1: "",
    vanyatra_image2: "",
    image1_preview: "",
    image2_preview: "",
  });

  // Delete State (5. DELETE by ID)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Full Image Preview Modal
  const [previewImage, setPreviewImage] = useState(null);
  const [imageUrlData, setImageUrlData] = useState([]);

  // Helper to construct full image URL
  const getFullImageUrl = useCallback(
    (imageName) => {
      if (!imageName) return "";
      if (
        imageName.startsWith("http://") ||
        imageName.startsWith("https://") ||
        imageName.startsWith("data:") ||
        imageName.startsWith("blob:")
      ) {
        return imageName;
      }

      let base = "";
      if (Array.isArray(imageUrlData) && imageUrlData.length > 0) {
        // Look for Vanyatra or CPR image base
        const match = imageUrlData.find(
          (img) =>
            img.image_for &&
            (img.image_for.toLowerCase().includes("vanyatra") ||
              img.image_for.toLowerCase().includes("cpr"))
        );
        if (match?.image_url) {
          base = match.image_url;
        } else {
          // Look for any valid base that is not "No Image"
          const anyOther = imageUrlData.find(
            (img) =>
              img.image_for &&
              !img.image_for.toLowerCase().includes("no image")
          );
          base = anyOther?.image_url || imageUrlData[0]?.image_url || "";
        }
      } else if (typeof imageUrlData === "string" && imageUrlData) {
        base = imageUrlData;
      }

      if (base) {
        return base.endsWith("/")
          ? `${base}${imageName}`
          : `${base}/${imageName}`;
      }

      // Default fallback using BASE_URL
      return `${BASE_URL}/uploads/vanyatra/${imageName}`;
    },
    [imageUrlData]
  );

  // 1. Fetch List: GET /api/cpr-vanyatra
  const fetchVanyatraData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const token = Cookies.get("token");

      const response = await axios.get(`${BASE_URL}/api/cpr-vanyatra`, {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("GET /api/cpr-vanyatra response:", response.data);
      if (response.data?.image_url) {
        setImageUrlData(response.data.image_url);
      }
      const raw = response.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.cpr_vanyatra)
        ? raw.cpr_vanyatra
        : Array.isArray(raw?.vanyatra)
        ? raw.vanyatra
        : raw?.data && typeof raw.data === "object"
        ? [raw.data]
        : [];

      setVanyatraList(list);
    } catch (error) {
      console.error("Error fetching cpr-vanyatra:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch CPR Vanyatra data";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVanyatraData();
  }, [fetchVanyatraData]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
    }
  }, [location.state]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateError(null);
    setFormData({
      financial_year: currentYear,
      financial_month: currentMonth,
      subs: [
        {
          conducted_by: "",
          vanyatra_date: "",
          vanyatra_visited: "",
          no_of_days: "",
          vanyatra_image1: "",
          vanyatra_image2: "",
          image1_preview: "",
          image2_preview: "",
        },
      ],
    });
    setOpenCreateModal(true);
  };

  // Add sub-row in Create modal
  const handleAddSubRow = () => {
    setFormData((prev) => ({
      ...prev,
      subs: [
        ...prev.subs,
        {
          conducted_by: "",
          vanyatra_date: "",
          vanyatra_visited: "",
          no_of_days: "",
          vanyatra_image1: "",
          vanyatra_image2: "",
          image1_preview: "",
          image2_preview: "",
        },
      ],
    }));
  };

  // Remove sub-row in Create modal
  const handleRemoveSubRow = (index) => {
    if (formData.subs.length <= 1) {
      toast.error("At least one entry is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      subs: prev.subs.filter((_, idx) => idx !== index),
    }));
  };

  // Update field in sub-row
  const handleSubChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.subs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, subs: updated };
    });
  };

  // Handle image upload for sub-row in Create modal
  const handleSubImageUpload = (index, imageKey, file) => {
    if (!file) return;
    try {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => {
        const updated = [...prev.subs];
        updated[index] = {
          ...updated[index],
          [imageKey]: file,
          [`${imageKey === "vanyatra_image1" ? "image1" : "image2"}_preview`]:
            previewUrl,
        };
        return { ...prev, subs: updated };
      });
      toast.success(`${file.name} selected`);
    } catch (err) {
      console.error("Image read error:", err);
      toast.error("Failed to select image file");
    }
  };

  // 2. POST /api/cpr-vanyatra (Create)
  const handleSubmitCreate = async (e) => {
    e.preventDefault();

    if (!formData.financial_year.trim()) {
      toast.error("Please select a financial year");
      return;
    }
    if (!formData.financial_month.trim()) {
      toast.error("Please select a financial month");
      return;
    }
    if (formData.subs.length === 0) {
      toast.error("Please add at least one Vanyatra row");
      return;
    }

    // Validate all fields for each sub entry
    for (let i = 0; i < formData.subs.length; i++) {
      const s = formData.subs[i];
      const entryNum = i + 1;
      if (!s.conducted_by?.trim()) {
        toast.error(`Entry #${entryNum}: Conducted By is required`);
        return;
      }
      if (!s.vanyatra_date) {
        toast.error(`Entry #${entryNum}: Vanyatra Date is required`);
        return;
      }
      if (s.vanyatra_date > todayDate) {
        toast.error(`Entry #${entryNum}: Future date is not allowed for Vanyatra Date`);
        return;
      }
      if (!s.vanyatra_visited?.trim()) {
        toast.error(`Entry #${entryNum}: Vanyatra Visited is required`);
        return;
      }
      if (!s.no_of_days || Number(s.no_of_days) < 1) {
        toast.error(`Entry #${entryNum}: No. of Days is required (must be at least 1)`);
        return;
      }
      if (!s.vanyatra_image1) {
        toast.error(`Entry #${entryNum}: Vanyatra Image 1 is required`);
        return;
      }
      if (!s.vanyatra_image2) {
        toast.error(`Entry #${entryNum}: Vanyatra Image 2 is required`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setCreateError(null);
      const token = Cookies.get("token");

      // Send multipart/form-data with actual File objects to satisfy Laravel 'image' validation rule
      const formDataToSend = new FormData();
      formDataToSend.append("financial_year", formData.financial_year.trim());
      formDataToSend.append("financial_month", formData.financial_month.trim());

      formData.subs.forEach((item, index) => {
        formDataToSend.append(`subs[${index}][conducted_by]`, item.conducted_by.trim());
        formDataToSend.append(`subs[${index}][vanyatra_date]`, item.vanyatra_date);
        formDataToSend.append(`subs[${index}][vanyatra_visited]`, item.vanyatra_visited || "");
        formDataToSend.append(`subs[${index}][no_of_days]`, item.no_of_days ? String(item.no_of_days) : "");
        if (item.vanyatra_image1 instanceof File) {
          formDataToSend.append(`subs[${index}][vanyatra_image1]`, item.vanyatra_image1);
        } else if (typeof item.vanyatra_image1 === "string" && item.vanyatra_image1) {
          formDataToSend.append(`subs[${index}][vanyatra_image1]`, item.vanyatra_image1);
        }
        if (item.vanyatra_image2 instanceof File) {
          formDataToSend.append(`subs[${index}][vanyatra_image2]`, item.vanyatra_image2);
        } else if (typeof item.vanyatra_image2 === "string" && item.vanyatra_image2) {
          formDataToSend.append(`subs[${index}][vanyatra_image2]`, item.vanyatra_image2);
        }
      });

      console.log("Submitting POST /api/cpr-vanyatra multipart/form-data");

      const response = await axios.post(`${BASE_URL}/api/cpr-vanyatra`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("POST /api/cpr-vanyatra response:", response.data);
      toast.success(
        response.data?.message || "CPR Vanyatra created successfully!"
      );
      setOpenCreateModal(false);
      fetchVanyatraData();
    } catch (error) {
      console.error("Error creating CPR Vanyatra:", error);
      console.error("Server 422 Response Data:", error?.response?.data);

      let detailedMsg = "Failed to save CPR Vanyatra data";
      if (error?.response?.data?.errors && typeof error.response.data.errors === "object") {
        const errorList = Object.entries(error.response.data.errors).map(
          ([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`
        );
        detailedMsg = `${error.response.data.message || "Validation Error"}:\n` + errorList.join("\n");
        setCreateError(errorList);
      } else if (error?.response?.data?.message) {
        detailedMsg = error.response.data.message;
        setCreateError([detailedMsg]);
      } else if (error?.message) {
        detailedMsg = error.message;
        setCreateError([detailedMsg]);
      }

      toast.error(detailedMsg, { duration: 10000 });
    } finally {
      setSubmitting(false);
    }
  };

  // 3. API GET by id: cpr-vanyatra/{id} (Open Edit Modal)
  const handleOpenEdit = async (item) => {
    if (!item?.id) {
      toast.error("Record ID is missing");
      return;
    }
    setEditError(null);
    setSelectedItem(item);

    const rawImg1 = item.vanyatra_image1 || "";
    const rawImg2 = item.vanyatra_image2 || "";

    // Pre-fill immediate values from clicked row
    setEditFormData({
      financial_year: item.financial_year || currentYear,
      financial_month: item.financial_month || currentMonth,
      conducted_by: item.conducted_by || "",
      vanyatra_date: item.vanyatra_date || "",
      vanyatra_visited: item.vanyatra_visited || "",
      no_of_days: item.no_of_days ?? "",
      vanyatra_image1: rawImg1,
      vanyatra_image2: rawImg2,
      image1_preview: getFullImageUrl(rawImg1),
      image2_preview: getFullImageUrl(rawImg2),
    });
    setOpenEditModal(true);
    setFetchingEdit(true);

    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${BASE_URL}/api/cpr-vanyatra/${item.id}`, {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log(`GET /api/cpr-vanyatra/${item.id} response:`, res.data);
      if (res.data?.image_url) {
        setImageUrlData(res.data.image_url);
      }
      const detail = res.data?.data || res.data?.cpr_vanyatra || res.data;
      if (detail && typeof detail === "object") {
        const dImg1 = detail.vanyatra_image1 ?? item.vanyatra_image1 ?? "";
        const dImg2 = detail.vanyatra_image2 ?? item.vanyatra_image2 ?? "";
        setEditFormData({
          financial_year: detail.financial_year || item.financial_year || currentYear,
          financial_month: detail.financial_month || item.financial_month || currentMonth,
          conducted_by: detail.conducted_by ?? item.conducted_by ?? "",
          vanyatra_date: detail.vanyatra_date ?? item.vanyatra_date ?? "",
          vanyatra_visited: detail.vanyatra_visited ?? item.vanyatra_visited ?? "",
          no_of_days: detail.no_of_days ?? item.no_of_days ?? "",
          vanyatra_image1: dImg1,
          vanyatra_image2: dImg2,
          image1_preview: getFullImageUrl(dImg1),
          image2_preview: getFullImageUrl(dImg2),
        });
      }
    } catch (err) {
      console.error("Error fetching CPR Vanyatra by ID:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load Vanyatra details"
      );
    } finally {
      setFetchingEdit(false);
    }
  };

  // Handle image upload in Edit modal
  const handleEditImageUpload = (imageKey, file) => {
    if (!file) return;
    try {
      const previewUrl = URL.createObjectURL(file);
      setEditFormData((prev) => ({
        ...prev,
        [imageKey]: file,
        [`${imageKey === "vanyatra_image1" ? "image1" : "image2"}_preview`]:
          previewUrl,
      }));
      toast.success(`${file.name} selected`);
    } catch (err) {
      console.error("Edit image read error:", err);
      toast.error("Failed to select image file");
    }
  };

  // 4. API PUT: cpr-vanyatra/{id} (Update)
  const handleConfirmEdit = async (e) => {
    e.preventDefault();
    if (!selectedItem?.id) return;

    if (!editFormData.conducted_by?.trim()) {
      toast.error("Conducted By is required");
      return;
    }
    if (!editFormData.vanyatra_date) {
      toast.error("Vanyatra Date is required");
      return;
    }
    if (editFormData.vanyatra_date > todayDate) {
      toast.error("Future date is not allowed for Vanyatra Date");
      return;
    }
    if (!editFormData.vanyatra_visited?.trim()) {
      toast.error("Vanyatra Visited is required");
      return;
    }
    if (!editFormData.no_of_days || Number(editFormData.no_of_days) < 1) {
      toast.error("No. of Days is required (must be at least 1)");
      return;
    }
    if (!editFormData.vanyatra_image1) {
      toast.error("Vanyatra Image 1 is required");
      return;
    }
    if (!editFormData.vanyatra_image2) {
      toast.error("Vanyatra Image 2 is required");
      return;
    }

    try {
      setUpdating(true);
      setEditError(null);
      const token = Cookies.get("token");

      const formDataToSend = new FormData();
      formDataToSend.append("_method", "PUT");
      formDataToSend.append("financial_year", editFormData.financial_year || currentYear);
      formDataToSend.append("financial_month", editFormData.financial_month || currentMonth);
      formDataToSend.append("conducted_by", editFormData.conducted_by.trim());
      formDataToSend.append("vanyatra_date", editFormData.vanyatra_date);
      formDataToSend.append("vanyatra_visited", editFormData.vanyatra_visited || "");
      formDataToSend.append("no_of_days", editFormData.no_of_days ? String(editFormData.no_of_days) : "");

      // Only append if it's a newly selected File! Do not append existing string filename
      if (editFormData.vanyatra_image1 instanceof File) {
        formDataToSend.append("vanyatra_image1", editFormData.vanyatra_image1);
      }
      if (editFormData.vanyatra_image2 instanceof File) {
        formDataToSend.append("vanyatra_image2", editFormData.vanyatra_image2);
      }

      console.log(`Submitting POST /api/cpr-vanyatra/${selectedItem.id}?_method=PUT multipart formData`);

      const response = await axios.post(
        `${BASE_URL}/api/cpr-vanyatra/${selectedItem.id}?_method=PUT`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("PUT cpr-vanyatra response:", response.data);
      toast.success(
        response.data?.message || "CPR Vanyatra updated successfully!"
      );
      setOpenEditModal(false);
      fetchVanyatraData();
    } catch (error) {
      console.error("Error updating CPR Vanyatra:", error);
      console.error("Server 422 Response Data:", error?.response?.data);

      let detailedMsg = "Failed to update CPR Vanyatra";
      if (error?.response?.data?.errors && typeof error.response.data.errors === "object") {
        const errorList = Object.entries(error.response.data.errors).map(
          ([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`
        );
        detailedMsg = `${error.response.data.message || "Validation Error"}:\n` + errorList.join("\n");
        setEditError(errorList);
      } else if (error?.response?.data?.message) {
        detailedMsg = error.response.data.message;
        setEditError([detailedMsg]);
      } else if (error?.message) {
        detailedMsg = error.message;
        setEditError([detailedMsg]);
      }

      toast.error(detailedMsg, { duration: 10000 });
    } finally {
      setUpdating(false);
    }
  };

  // 5. API DELETE: cpr-vanyatra/{id} (Delete)
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;

    try {
      setDeleting(true);
      const token = Cookies.get("token");

      const response = await axios.delete(
        `${BASE_URL}/api/cpr-vanyatra/${itemToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`DELETE /api/cpr-vanyatra/${itemToDelete.id} response:`, response.data);
      toast.success(
        response.data?.message || "CPR Vanyatra deleted successfully!"
      );
      setOpenDeleteDialog(false);
      setItemToDelete(null);
      fetchVanyatraData();
    } catch (error) {
      console.error("Error deleting cpr-vanyatra:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete CPR Vanyatra"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Filtered List - only show records returned by API
  const filteredList = useMemo(() => {
    if (!search.trim()) return vanyatraList;
    const term = search.toLowerCase();
    return vanyatraList.filter((item) => {
      const conductedBy = String(item.conducted_by || "").toLowerCase();
      const visited = String(item.vanyatra_visited || "").toLowerCase();
      const fMonth = String(item.financial_month || "").toLowerCase();
      const fYear = String(item.financial_year || "").toLowerCase();
      return (
        conductedBy.includes(term) ||
        visited.includes(term) ||
        fMonth.includes(term) ||
        fYear.includes(term)
      );
    });
  }, [vanyatraList, search]);

  const availableYears = financialYearList;

  return (
    <div className="w-full min-h-screen bg-white p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                CPR Vanyatra
              </h1>
              <p className="text-xs text-slate-500">
                Manage and track chapter Vanyatra reports and records
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchVanyatraData}
            disabled={loading}
            className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenCreate}
            className="bg-[#193b59] hover:bg-[#122c44] text-white text-xs font-semibold h-9 px-4 rounded-[4px] gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Vanyatra
          </Button>
        </div>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by conducted by, visited..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Records:{" "}
          <span className="font-bold text-slate-900">{filteredList.length}</span>
        </div>
      </div>

      {/* Main Table: Only what comes in API */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-none">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#193b59]" />
            <p className="text-xs text-slate-500 font-medium">
              Loading CPR Vanyatra records...
            </p>
          </div>
        ) : errorMsg && vanyatraList.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchVanyatraData}
              className="text-xs h-8"
            >
              Try Again
            </Button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                No Vanyatra records found
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {search ? "No matches found for your search" : "Click 'Add Vanyatra' to create your first record"}
              </p>
            </div>
            {!search && (
              <Button
                type="button"
                size="sm"
                onClick={handleOpenCreate}
                className="bg-[#193b59] hover:bg-[#122c44] text-white text-xs px-4 h-8 rounded-[4px] mt-1"
              >
                + Add First Vanyatra
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#edf3f9] text-slate-800 font-semibold border-b border-slate-200">
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800">
                    Financial Year
                  </TableHead>
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800">
                    Month
                  </TableHead>
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800">
                    Conducted By
                  </TableHead>
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800">
                    Vanyatra Date
                  </TableHead>
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800">
                    Visited
                  </TableHead>
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800 text-center">
                    Days
                  </TableHead>
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800 text-center">
                    Images
                  </TableHead>
                  <TableHead className="py-3 px-5 text-xs font-semibold text-slate-800 text-right w-24">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredList.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Financial Year */}
                    <TableCell className="py-3 px-5 font-semibold text-slate-900 text-xs">
                      {item.financial_year || currentYear}
                    </TableCell>

                    {/* Month */}
                    <TableCell className="py-3 px-5 text-xs font-medium text-slate-700">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                        {item.financial_month || "—"}
                      </span>
                    </TableCell>

                    {/* Conducted By */}
                    <TableCell className="py-3 px-5 text-xs font-semibold text-slate-900">
                      {item.conducted_by || "—"}
                    </TableCell>

                    {/* Vanyatra Date */}
                    <TableCell className="py-3 px-5 text-xs text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.vanyatra_date
                          ? moment(item.vanyatra_date).isValid()
                            ? moment(item.vanyatra_date).format("DD-MM-YYYY")
                            : item.vanyatra_date
                          : "—"}
                      </span>
                    </TableCell>

                    {/* Visited */}
                    <TableCell className="py-3 px-5 text-xs text-slate-700">
                      {item.vanyatra_visited || "—"}
                    </TableCell>

                    {/* No of Days */}
                    <TableCell className="py-3 px-5 text-xs text-center font-semibold text-slate-800">
                      {item.no_of_days ?? "—"}
                    </TableCell>

                    {/* Images */}
                    <TableCell className="py-3 px-5 text-xs text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.vanyatra_image1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage(getFullImageUrl(item.vanyatra_image1))
                            }
                            className="w-8 h-8 rounded border border-slate-200 overflow-hidden hover:opacity-80 transition cursor-pointer"
                            title="View Image 1"
                          >
                            <img
                              src={getFullImageUrl(item.vanyatra_image1)}
                              alt="Vanyatra 1"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                if (!e.target.src.includes(BASE_URL)) {
                                  e.target.src = `${BASE_URL}/${item.vanyatra_image1}`;
                                }
                              }}
                            />
                          </button>
                        ) : null}
                        {item.vanyatra_image2 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage(getFullImageUrl(item.vanyatra_image2))
                            }
                            className="w-8 h-8 rounded border border-slate-200 overflow-hidden hover:opacity-80 transition cursor-pointer"
                            title="View Image 2"
                          >
                            <img
                              src={getFullImageUrl(item.vanyatra_image2)}
                              alt="Vanyatra 2"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                if (!e.target.src.includes(BASE_URL)) {
                                  e.target.src = `${BASE_URL}/${item.vanyatra_image2}`;
                                }
                              }}
                            />
                          </button>
                        ) : null}
                        {!item.vanyatra_image1 && !item.vanyatra_image2 && (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions: Edit & Delete */}
                    <TableCell className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="h-8 w-8 text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                          title="Edit Vanyatra"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(item)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete Vanyatra"
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
      </div>

      {/* ================= MODAL: CREATE VANYATRA (POST /api/cpr-vanyatra) ================= */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add CPR Vanyatra
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record Vanyatras conducted with visited details and images.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate} className="space-y-4 pt-2">
            {/* Server Error Alert Banner */}
            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  Validation Error from Server:
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {createError.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Header: Financial Year and Financial Month */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
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
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
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

            {/* Subs: Dynamic list of Vanyatra rows */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Vanyatra Entries ({formData.subs.length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubRow}
                  className="text-xs h-7 gap-1 border-dashed text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Entry
                </Button>
              </div>

              {formData.subs.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Entry #{idx + 1}
                    </span>
                    {formData.subs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubRow(idx)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Conducted By <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={sub.conducted_by}
                        onChange={(e) =>
                          handleSubChange(idx, "conducted_by", e.target.value)
                        }
                        placeholder="e.g. Youth Committee"
                        className="text-xs h-9 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Vanyatra Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={sub.vanyatra_date}
                        max={todayDate}
                        onChange={(e) =>
                          handleSubChange(idx, "vanyatra_date", e.target.value)
                        }
                        className="text-xs h-9 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Vanyatra Visited <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={sub.vanyatra_visited}
                        onChange={(e) =>
                          handleSubChange(idx, "vanyatra_visited", e.target.value)
                        }
                        placeholder="e.g. Village schools in Anchal Purulia"
                        className="text-xs h-9 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        No. of Days <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={sub.no_of_days}
                        onChange={(e) =>
                          handleSubChange(idx, "no_of_days", e.target.value)
                        }
                        placeholder="e.g. 2"
                        className="text-xs h-9 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Images Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Vanyatra Image 1 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          required={!sub.vanyatra_image1}
                          onChange={(e) =>
                            handleSubImageUpload(
                              idx,
                              "vanyatra_image1",
                              e.target.files?.[0]
                            )
                          }
                          className="text-xs h-9 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-100"
                        />
                        {sub.image1_preview && (
                          <div className="w-9 h-9 rounded border border-slate-200 overflow-hidden shrink-0">
                            <img
                              src={sub.image1_preview}
                              alt="Preview 1"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Vanyatra Image 2 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          required={!sub.vanyatra_image2}
                          onChange={(e) =>
                            handleSubImageUpload(
                              idx,
                              "vanyatra_image2",
                              e.target.files?.[0]
                            )
                          }
                          className="text-xs h-9 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-100"
                        />
                        {sub.image2_preview && (
                          <div className="w-9 h-9 rounded border border-slate-200 overflow-hidden shrink-0">
                            <img
                              src={sub.image2_preview}
                              alt="Preview 2"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenCreateModal(false)}
                disabled={submitting}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-[#193b59] hover:bg-[#122c44] text-white text-xs h-8 px-4 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Submitting...
                  </>
                ) : (
                  "Create Vanyatra"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT VANYATRA (PUT /api/cpr-vanyatra/{id}) ================= */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Edit CPR Vanyatra
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update details for this Vanyatra record.
            </DialogDescription>
          </DialogHeader>

          {fetchingEdit ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#193b59]" />
              <p className="text-xs text-slate-500 font-medium">
                Loading Vanyatra details...
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmEdit} className="space-y-4 pt-1 text-xs">
              {/* Server Error Alert Banner */}
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    Validation Error from Server:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {editError.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Financial Year & Financial Month (Editable Dropdowns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
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
                    className="w-full h-8 border border-slate-300 rounded px-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                    required
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                    {editFormData.financial_year &&
                      !availableYears.includes(editFormData.financial_year) && (
                        <option value={editFormData.financial_year}>
                          {editFormData.financial_year}
                        </option>
                      )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
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
                    className="w-full h-8 border border-slate-300 rounded px-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
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
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Conducted By <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.conducted_by}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        conducted_by: e.target.value,
                      })
                    }
                    className="text-xs h-9 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vanyatra Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={editFormData.vanyatra_date}
                    max={todayDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        vanyatra_date: e.target.value,
                      })
                    }
                    className="text-xs h-9 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vanyatra Visited <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.vanyatra_visited}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        vanyatra_visited: e.target.value,
                      })
                    }
                    className="text-xs h-9 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. of Days <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editFormData.no_of_days}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        no_of_days: e.target.value,
                      })
                    }
                    className="text-xs h-9 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Image 1 & Image 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vanyatra Image 1 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      required={!editFormData.vanyatra_image1}
                      onChange={(e) =>
                        handleEditImageUpload(
                          "vanyatra_image1",
                          e.target.files?.[0]
                        )
                      }
                      className="text-xs h-9 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-100"
                    />
                    {editFormData.image1_preview && (
                      <div className="w-9 h-9 rounded border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={getFullImageUrl(editFormData.image1_preview)}
                          alt="Preview 1"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            if (
                              editFormData.vanyatra_image1 &&
                              typeof editFormData.vanyatra_image1 === "string" &&
                              !e.target.src.includes(BASE_URL)
                            ) {
                              e.target.src = `${BASE_URL}/${editFormData.vanyatra_image1}`;
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vanyatra Image 2 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      required={!editFormData.vanyatra_image2}
                      onChange={(e) =>
                        handleEditImageUpload(
                          "vanyatra_image2",
                          e.target.files?.[0]
                        )
                      }
                      className="text-xs h-9 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-100"
                    />
                    {editFormData.image2_preview && (
                      <div className="w-9 h-9 rounded border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={getFullImageUrl(editFormData.image2_preview)}
                          alt="Preview 2"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            if (
                              editFormData.vanyatra_image2 &&
                              typeof editFormData.vanyatra_image2 === "string" &&
                              !e.target.src.includes(BASE_URL)
                            ) {
                              e.target.src = `${BASE_URL}/${editFormData.vanyatra_image2}`;
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenEditModal(false)}
                  disabled={updating}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updating}
                  className="bg-[#193b59] hover:bg-[#122c44] text-white text-xs h-8 px-4 font-semibold"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= ALERT DIALOG: DELETE CONFIRMATION (DELETE /api/cpr-vanyatra/{id}) ================= */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-slate-900">
              Delete CPR Vanyatra
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete this Vanyatra record conducted by{" "}
              <span className="font-semibold text-slate-800">
                "{itemToDelete?.conducted_by || "this entry"}"
              </span>{" "}
              on{" "}
              <span className="font-semibold text-slate-800">
                {itemToDelete?.vanyatra_date || "—"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================= FULL IMAGE PREVIEW MODAL ================= */}
      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-2xl p-2 bg-black/95 border-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {previewImage && (
              <img
                src={previewImage}
                alt="Full Preview"
                className="w-full max-h-[80vh] object-contain rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CPRVanyatra;
