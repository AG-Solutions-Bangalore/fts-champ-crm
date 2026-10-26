import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "@/config/base-url";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Plus,
  Download,
  Upload,
  ArrowDown,
  CheckCircle2,
  ChevronDown,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CPRPrintReport from "./cpr-print-report";

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

// Helper to get current financial year
const getCurrentFinancialYear = () => {
  const cookieYear = Cookies.get("currentYear");
  if (cookieYear) return cookieYear;
  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth();
  const startYr = calMonth < 3 ? calYear - 1 : calYear;
  return `${startYr}-${String(startYr + 1).slice(-2)}`;
};

// Helper to get current month name (e.g. "October")
const getCurrentMonthName = () => {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long" });
};

// Helper to get available months up to current month (strictly hiding future months)
const getAvailableMonths = (selectedYear, currFY) => {
  const currentFY = currFY || getCurrentFinancialYear();
  if (!selectedYear || selectedYear === currentFY) {
    const currMonth = getCurrentMonthName();
    const currMonthIdx = FINANCIAL_MONTHS.indexOf(currMonth);
    if (currMonthIdx !== -1) {
      return FINANCIAL_MONTHS.slice(0, currMonthIdx + 1);
    }
  }
  // If selected financial year is strictly in the future, allow no months
  if (selectedYear > currentFY) {
    return [];
  }
  // For past financial years, all 12 months are in the past
  return FINANCIAL_MONTHS;
};

// Generate list of financial years up to current year
const getAvailableFinancialYears = (currYear) => {
  const match = currYear?.match(/^(\d{4})-(\d{2})$/);
  if (!match) return [currYear || "2026-27"];
  const startYearNum = parseInt(match[1], 10);
  const years = [];
  for (let i = 4; i >= 0; i--) {
    const y = startYearNum - i;
    const nextYShort = String(y + 1).slice(-2);
    years.push(`${y}-${nextYShort}`);
  }
  return years;
};

// Helper for Indian Currency Formatting
const formatINR = (val) => {
  if (val === undefined || val === null || val === "" || isNaN(val)) return "";
  const num = Number(val);
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

// Helper to get today's date formatted as YYYY-MM-DD
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to safely clean string/number values from API or state, ensuring null/undefined/"null" are converted to ""
const cleanVal = (val) => {
  if (val === null || val === undefined) return "";
  const s = String(val).trim();
  if (s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return "";
  return s;
};

const CPRForm = ({
  initialMonth = "",
  initialYear = "",
  reportId = null,
  isView = false,
  isEdit = false,
  onBack = null,
}) => {
  const [currentReportId, setCurrentReportId] = useState(reportId);

  useEffect(() => {
    if (reportId) {
      setCurrentReportId(reportId);
    }
  }, [reportId]);

  // Top Header State - all cleared
  const todayDate = useMemo(() => getTodayDateString(), []);
  const [chapterName, setChapterName] = useState("");
  const [monthIndex, setMonthIndex] = useState("");
  const [monthName, setMonthName] = useState(initialMonth || "");
  const [cppName, setCppName] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [subChapters, setSubChapters] = useState([]);
  const [newSubChapter, setNewSubChapter] = useState("");
  const [showSubChapterInput, setShowSubChapterInput] = useState(false);
  const [financialYear, setFinancialYear] = useState(
    initialYear || Cookies.get("currentYear") || "2026-27"
  );
  const currentFY = useMemo(() => getCurrentFinancialYear(), []);
  const availableMonths = useMemo(
    () => getAvailableMonths(financialYear, currentFY),
    [financialYear, currentFY]
  );

  const [csrStatus, setCsrStatus] = useState("Draft");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    if (initialMonth && availableMonths.includes(initialMonth)) {
      setMonthName(initialMonth);
      const idx = FINANCIAL_MONTHS.indexOf(initialMonth);
      if (idx !== -1) {
        setMonthIndex(String(idx + 1));
      }
    }
  }, [initialMonth, availableMonths]);

  // If currently selected month is not in availableMonths (e.g. future month), clear it
  useEffect(() => {
    if (monthName && !availableMonths.includes(monthName)) {
      setMonthName("");
      setMonthIndex("");
    }
  }, [availableMonths, monthName]);

  // Section A: Membership Data - cleared
  const [memberships, setMemberships] = useState({
    chapter: { asOnMarch: "", added: "" },
    yuva: { asOnMarch: "", added: "" },
    mahila: { asOnMarch: "", added: "" },
  });

  const sectionATotals = useMemo(() => {
    const marchSum =
      (Number(memberships.chapter.asOnMarch) || 0) +
      (Number(memberships.yuva.asOnMarch) || 0) +
      (Number(memberships.mahila.asOnMarch) || 0);

    const addedSum =
      (Number(memberships.chapter.added) || 0) +
      (Number(memberships.yuva.added) || 0) +
      (Number(memberships.mahila.added) || 0);

    const cumulativeSum = addedSum;
    const amountSum = cumulativeSum * 1000;

    return {
      asOnMarch: marchSum || "",
      added: addedSum || "",
      cumulative: cumulativeSum || "",
      amount: amountSum ? formatINR(amountSum) : "",
    };
  }, [memberships]);

  // Section B: Executive Committee Meetings - cleared
  const [noMeetingHeld, setNoMeetingHeld] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState({
    date: "",
    type: "Executive Committee Meeting",
    membersCount: "",
    invited: "",
    attended: "",
    agenda: "",
  });

  // Section C: OTS Details & Collection - cleared
  const [otsPRP, setOtsPRP] = useState("");
  const [otsCountDuringMonth, setOtsCountDuringMonth] = useState("");
  const [otsAmountOverride, setOtsAmountOverride] = useState(null);
  const otsCountTillDate = otsCountDuringMonth;
  const otsAmountDuringMonth =
    otsAmountOverride !== null
      ? otsAmountOverride
      : otsCountDuringMonth
      ? (Number(otsCountDuringMonth) || 0) * 30000
      : 0;
  const otsAmountTillDate = otsAmountDuringMonth;

  // Section D: Donation & CSR Details - cleared
  const [donations, setDonations] = useState({
    general: { during: "", till: "" },
    csr: { during: "", till: "" },
    other: { during: "", till: "" },
  });

  const donationTotals = useMemo(() => {
    const during =
      (Number(donations.general.during) || 0) +
      (Number(donations.csr.during) || 0) +
      (Number(donations.other.during) || 0);
    const till =
      (Number(donations.general.till) || 0) +
      (Number(donations.csr.till) || 0) +
      (Number(donations.other.till) || 0);
    return {
      during: during ? formatINR(during) : "",
      till: till ? formatINR(till) : "",
    };
  }, [donations]);

  // Section E: Collection Boxes - cleared
  const [collectionBoxes, setCollectionBoxes] = useState({
    boxesThisMonth: "",
    boxesTillDate: "",
    amountThisMonth: "",
    amountTillDate: "",
  });

  // Section F: Investment (As on Date) - cleared
  const [investments, setInvestments] = useState({
    fd: "",
    mutualFund: "",
    others: "",
    othersSpecify: "",
  });

  const totalInvestment = useMemo(() => {
    const sum =
      (Number(investments.fd) || 0) +
      (Number(investments.mutualFund) || 0) +
      (Number(investments.others) || 0);
    return sum ? formatINR(sum) : "";
  }, [investments]);

  // Section G: Cash & Bank Balance - cleared
  const [cashInHand, setCashInHand] = useState("");
  const [bankBalances, setBankBalances] = useState([]);

  const totalBankBalance = useMemo(() => {
    const sum = bankBalances.reduce((acc, b) => acc + (Number(b.balance) || 0), 0);
    return sum ? formatINR(sum) : "";
  }, [bankBalances]);

  const totalCashAndBank = useMemo(() => {
    const bankSum = bankBalances.reduce((acc, b) => acc + (Number(b.balance) || 0), 0);
    const total = (Number(cashInHand) || 0) + bankSum;
    return total ? formatINR(total) : "";
  }, [cashInHand, bankBalances]);

  // Section H: Vanyatra - cleared
  const [vanyatras, setVanyatras] = useState([]);
  const [showVanyatraModal, setShowVanyatraModal] = useState(false);
  const [newVanyatra, setNewVanyatra] = useState({
    date: "",
    yatrisCount: "",
    vidyalayasVisited: "",
    pravasDone: "No",
    remarks: "",
  });

  // Section I: Events During the Month - cleared
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    date: "",
    type: "",
    committee: "Yuva Samiti",
    photos: 0,
  });

  // Section J: Annexure 1 - Disbursement to Anchal - cleared
  const [anchals, setAnchals] = useState([]);
  const [showAnchalModal, setShowAnchalModal] = useState(false);
  const [newAnchal, setNewAnchal] = useState({
    name: "",
    acharyasCount: "",
    annualTarget: "",
    remittanceLastMonth: "",
    remittanceThisMonth: "",
  });

  // Section K: Annexure 2 - Monthly Summary / Check Points - cleared
  const [samagriReached, setSamagriReached] = useState("No");
  const [samagriRemarks, setSamagriRemarks] = useState("");

  const [donorBoard, setDonorBoard] = useState({
    nonCsr: { total: "", sent: "", remarks: "" },
    csr: { total: "", sent: "", remarks: "" },
  });

  const [schoolProgressSent, setSchoolProgressSent] = useState("No");
  const [progressRemarks, setProgressRemarks] = useState("");

  const [selectedMonitoringAnchal, setSelectedMonitoringAnchal] = useState("Choose");
  const [monitoringAnchalsList, setMonitoringAnchalsList] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  // Sign & Submit & PDF refs
  const [signedFile, setSignedFile] = useState(null);
  const [existingSignedCprUrl, setExistingSignedCprUrl] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);
  const fileInputRef = useRef(null);
  const printableRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Active section tracking for left sticky sidebar
  const [activeNav, setActiveNav] = useState("section-report-details");

  const scrollToSection = (id) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const [loadingDetails, setLoadingDetails] = useState(false);

  // Auto-fill fields returned by POST /api/getCPRReportDetails
  const applyReportDetails = useCallback((data) => {
    if (!data || typeof data !== "object") return;
    console.log("Applying auto-fill details from getCPRReportDetails:", data);

    // Chapter Name & CPP Info
    if (data.chapter_name || data.chapter?.chapter_name || data.name_of_chapter) {
      setChapterName(data.chapter_name || data.chapter?.chapter_name || data.name_of_chapter);
    }
    if (data.name_of_cpp || data.cpp_name || data.chairman) {
      setCppName(data.name_of_cpp || data.cpp_name || data.chairman);
    }
    if (data.submission_date) {
      setSubmissionDate(data.submission_date);
    }
    if (Array.isArray(data.sub_chapters)) {
      setSubChapters(data.sub_chapters);
    }

    // Section A: Membership Details (supports membership_DataBeforeMonth & membership_DataCurrentMonth)
    if (Array.isArray(data.membership_DataBeforeMonth) || Array.isArray(data.membership_DataCurrentMonth)) {
      setMemberships((prev) => {
        const next = {
          chapter: { ...prev.chapter },
          yuva: { ...prev.yuva },
          mahila: { ...prev.mahila },
        };
        if (Array.isArray(data.membership_DataBeforeMonth)) {
          data.membership_DataBeforeMonth.forEach((item) => {
            const belong = (item.indicomp_belongs_to || "").toLowerCase();
            if (belong.includes("mahila")) next.mahila.asOnMarch = String(item.total_count ?? "");
            else if (belong.includes("yuva")) next.yuva.asOnMarch = String(item.total_count ?? "");
            else next.chapter.asOnMarch = String(item.total_count ?? "");
          });
        }
        if (Array.isArray(data.membership_DataCurrentMonth)) {
          data.membership_DataCurrentMonth.forEach((item) => {
            const belong = (item.indicomp_belongs_to || "").toLowerCase();
            if (belong.includes("mahila")) next.mahila.added = String(item.total_count ?? "");
            else if (belong.includes("yuva")) next.yuva.added = String(item.total_count ?? "");
            else next.chapter.added = String(item.total_count ?? "");
          });
        }
        return next;
      });
    } else {
      const memberData = data.membership || data.memberships;
      if (memberData && typeof memberData === "object" && !Array.isArray(memberData)) {
        setMemberships((prev) => ({
          chapter: {
            asOnMarch: cleanVal(memberData.chapter?.asOnMarch) || prev.chapter.asOnMarch,
            added: cleanVal(memberData.chapter?.added) || prev.chapter.added,
          },
          yuva: {
            asOnMarch: cleanVal(memberData.yuva?.asOnMarch) || prev.yuva.asOnMarch,
            added: cleanVal(memberData.yuva?.added) || prev.yuva.added,
          },
          mahila: {
            asOnMarch: cleanVal(memberData.mahila?.asOnMarch) || prev.mahila.asOnMarch,
            added: cleanVal(memberData.mahila?.added) || prev.mahila.added,
          },
        }));
      } else if (data.chapter_members_as_on_march !== undefined || data.as_on_march_chapter !== undefined) {
        setMemberships((prev) => ({
          chapter: {
            asOnMarch: cleanVal(data.chapter_members_as_on_march ?? data.as_on_march_chapter) || prev.chapter.asOnMarch,
            added: cleanVal(data.chapter_members_added ?? data.added_chapter) || prev.chapter.added,
          },
          yuva: {
            asOnMarch: cleanVal(data.yuva_members_as_on_march ?? data.as_on_march_yuva) || prev.yuva.asOnMarch,
            added: cleanVal(data.yuva_members_added ?? data.added_yuva) || prev.yuva.added,
          },
          mahila: {
            asOnMarch: cleanVal(data.mahila_members_as_on_march ?? data.as_on_march_mahila) || prev.mahila.asOnMarch,
            added: cleanVal(data.mahila_members_added ?? data.added_mahila) || prev.mahila.added,
          },
        }));
      }
    }

    // Section B: Meetings (supports executive_committee_meeting, meetings)
    const meetList = Array.isArray(data.executive_committee_meeting)
      ? data.executive_committee_meeting
      : Array.isArray(data.executive_committee_meetings)
      ? data.executive_committee_meetings
      : Array.isArray(data.meeting)
      ? data.meeting
      : Array.isArray(data.meetings)
      ? data.meetings
      : null;
    if (meetList) {
      setMeetings(
        meetList.map((m, i) => ({
          id: m.id || i + 1,
          date: m.meeting_date || m.date || "",
          type: m.meeting_type || m.type || "Executive Committee Meeting",
          membersCount: m.total_members || m.membersCount || "",
          invited: m.members_invited || m.invited || "",
          attended: m.members_attended || m.attended || "",
          agenda: m.agenda || "",
        }))
      );
      if (meetList.length === 0 && data.no_meeting_held) {
        setNoMeetingHeld(true);
      }
    }

    // Section C: OTS (supports ots_details: { receipt_no_of_ots, receipt_total_amount })
    if (data.ots_details && typeof data.ots_details === "object") {
      if (data.ots_details.receipt_no_of_ots !== undefined) {
        setOtsCountDuringMonth(cleanVal(data.ots_details.receipt_no_of_ots));
      }
      if (data.ots_details.receipt_total_amount !== undefined) {
        setOtsAmountOverride(Number(data.ots_details.receipt_total_amount));
      }
      if (data.ots_details.prp !== undefined || data.ots_details.ots_prp !== undefined) {
        setOtsPRP(cleanVal(data.ots_details.prp ?? data.ots_details.ots_prp));
      }
    } else {
      if (data.ots_prp !== undefined || data.otsPRP !== undefined) {
        setOtsPRP(cleanVal(data.ots_prp ?? data.otsPRP));
      }
      if (data.ots_count_during_month !== undefined || data.ots_during_month !== undefined || data.ots_count !== undefined) {
        setOtsCountDuringMonth(cleanVal(data.ots_count_during_month ?? data.ots_during_month ?? data.ots_count));
      }
    }

    // Section D: Donations (supports csr_donation_details, non_csr_donation_details, general_donation)
    if (
      data.csr_donation_details ||
      data.general_donation ||
      data.non_csr_donation_details
    ) {
      setDonations((prev) => ({
        general: {
          during:
            data.general_donation?.receipt_total_amount !== undefined
              ? String(data.general_donation.receipt_total_amount)
              : prev.general.during,
          till:
            data.general_donation?.receipt_total_amount_till !== undefined
              ? String(data.general_donation.receipt_total_amount_till)
              : data.general_donation?.receipt_total_amount !== undefined
              ? String(data.general_donation.receipt_total_amount)
              : prev.general.till,
        },
        csr: {
          during:
            data.csr_donation_details?.receipt_total_amount !== undefined
              ? String(data.csr_donation_details.receipt_total_amount)
              : prev.csr.during,
          till:
            data.csr_donation_details?.receipt_total_amount_till !== undefined
              ? String(data.csr_donation_details.receipt_total_amount_till)
              : data.csr_donation_details?.receipt_total_amount !== undefined
              ? String(data.csr_donation_details.receipt_total_amount)
              : prev.csr.till,
        },
        other: {
          during:
            data.non_csr_donation_details?.receipt_total_amount !== undefined
              ? String(data.non_csr_donation_details.receipt_total_amount)
              : prev.other.during,
          till:
            data.non_csr_donation_details?.receipt_total_amount_till !== undefined
              ? String(data.non_csr_donation_details.receipt_total_amount_till)
              : data.non_csr_donation_details?.receipt_total_amount !== undefined
              ? String(data.non_csr_donation_details.receipt_total_amount)
              : prev.other.till,
        },
      }));
    } else {
      const donData = data.donation || data.donations;
      if (donData && typeof donData === "object" && !Array.isArray(donData) && donData.general) {
        setDonations((prev) => ({
          general: {
            during: cleanVal(donData.general?.during) || prev.general.during,
            till: cleanVal(donData.general?.till) || prev.general.till,
          },
          csr: {
            during: cleanVal(donData.csr?.during) || prev.csr.during,
            till: cleanVal(donData.csr?.till) || prev.csr.till,
          },
          other: {
            during: cleanVal(donData.other?.during) || prev.other.during,
            till: cleanVal(donData.other?.till) || prev.other.till,
          },
        }));
      } else if (data.general_donation_during !== undefined || data.csr_donation_during !== undefined) {
        setDonations({
          general: {
            during: cleanVal(data.general_donation_during),
            till: cleanVal(data.general_donation_till),
          },
          csr: {
            during: cleanVal(data.csr_donation_during),
            till: cleanVal(data.csr_donation_till),
          },
          other: {
            during: cleanVal(data.other_donation_during),
            till: cleanVal(data.other_donation_till),
          },
        });
      }
    }

    // Section G: Bank Balances (supports cash_bank_balance, bank, banks, cpr_bank)
    const bankList = Array.isArray(data.cash_bank_balance)
      ? data.cash_bank_balance
      : Array.isArray(data.bank)
      ? data.bank
      : Array.isArray(data.banks)
      ? data.banks
      : Array.isArray(data.bank_balances)
      ? data.bank_balances
      : Array.isArray(data.cpr_bank)
      ? data.cpr_bank
      : null;
    if (bankList) {
      setBankBalances(
        bankList.map((b, i) => ({
          id: b.id || i + 1,
          bankName: b.bank_name || b.bankName || "",
          balance: b.bank_balance ?? b.balance ?? "",
        }))
      );
    }

    // Section H: Van Yatra (supports vanyatra, vanyatras, cpr_vanyatra)
    const yatraList = Array.isArray(data.vanyatra)
      ? data.vanyatra
      : Array.isArray(data.vanyatras)
      ? data.vanyatras
      : Array.isArray(data.cpr_vanyatra)
      ? data.cpr_vanyatra
      : null;
    if (yatraList) {
      setVanyatras(
        yatraList.map((y, i) => ({
          id: y.id || i + 1,
          date: y.vanyatra_date || y.date || "",
          yatrisCount: y.no_of_days || y.yatrisCount || "",
          vidyalayasVisited: y.vanyatra_visited || y.vidyalayasVisited || "",
          conductedBy: y.conducted_by || "",
          pravasDone: y.pravas_done || y.pravasDone || "No",
          remarks: y.remarks || "",
          image1: y.vanyatra_image1 || "",
          image2: y.vanyatra_image2 || "",
        }))
      );
    }

    // Section I: Events (supports event, events, cpr_events)
    const evList = Array.isArray(data.event)
      ? data.event
      : Array.isArray(data.events)
      ? data.events
      : Array.isArray(data.cpr_events)
      ? data.cpr_events
      : null;
    if (evList) {
      setEvents(
        evList.map((ev, i) => ({
          id: ev.id || i + 1,
          date: ev.event_date || ev.date || "",
          type: ev.event_type || ev.type || "",
          committee: ev.committee || "Yuva Samiti",
          photos: ev.photos || ev.photos_count || 0,
        }))
      );
    }

    // Section J: Disbursements (Annexure 1 - supports disbursement, disbursements, anchals)
    const disbList = Array.isArray(data.disbursement)
      ? data.disbursement
      : Array.isArray(data.disbursements)
      ? data.disbursements
      : Array.isArray(data.cpr_disbursement)
      ? data.cpr_disbursement
      : Array.isArray(data.anchals)
      ? data.anchals
      : null;
    if (disbList) {
      setAnchals(
        disbList.map((d, i) => ({
          id: d.id || i + 1,
          name: d.anchal_name || d.name || "",
          fundingAnchal: d.funding_anchal || "",
          acharyasCount: d.no_of_acharyas || d.acharyasCount || "",
          acharyasPaid: d.no_of_acharyas_paid || "",
          annualTarget: d.amount || d.annualTarget || "",
          remittanceLastMonth: d.total_remittance_last_month || d.remittanceLastMonth || "",
          remittanceThisMonth: d.total_remittance_this_month || d.remittanceThisMonth || "",
          remittanceDate: d.remittance_date || "",
          upToMonthPaid: d.up_to_month_paid || "",
          reportWhenReceived: d.report_when_received || "",
        }))
      );
    }

    // Image URLs base map
    if (Array.isArray(data.image_url)) {
      setImageUrls(data.image_url);
    }

    // Auto-fill previous CPR Details if returned (e.g. from data.cpr_details or data)
    const cpr = data.cpr_details && typeof data.cpr_details === "object" ? data.cpr_details : data;

    if (cpr.boxes_placed !== undefined && cpr.boxes_placed !== null) {
      setCollectionBoxes((prev) => ({
        ...prev,
        boxesThisMonth: cleanVal(cpr.boxes_placed) || prev.boxesThisMonth,
        boxesTillDate: cleanVal(cpr.boxes_placed) || prev.boxesTillDate,
      }));
    }
    if (cpr.boxes_amount !== undefined && cpr.boxes_amount !== null) {
      setCollectionBoxes((prev) => ({
        ...prev,
        amountThisMonth: cleanVal(cpr.boxes_amount) || prev.amountThisMonth,
        amountTillDate: cleanVal(cpr.boxes_amount) || prev.amountTillDate,
      }));
    }
    if (
      cpr.fixed_deposit !== undefined ||
      cpr.mutual_fund !== undefined ||
      cpr.others !== undefined ||
      cpr.other_specify !== undefined
    ) {
      setInvestments((prev) => ({
        fd: cpr.fixed_deposit !== undefined && cpr.fixed_deposit !== null ? cleanVal(cpr.fixed_deposit) : prev.fd,
        mutualFund: cpr.mutual_fund !== undefined && cpr.mutual_fund !== null ? cleanVal(cpr.mutual_fund) : prev.mutualFund,
        others: cpr.others !== undefined && cpr.others !== null ? cleanVal(cpr.others) : prev.others,
        othersSpecify: cpr.other_specify !== undefined && cpr.other_specify !== null ? cleanVal(cpr.other_specify) : prev.othersSpecify,
      }));
    }
    if (cpr.cash_in_hand !== undefined && cpr.cash_in_hand !== null) {
      setCashInHand(cleanVal(cpr.cash_in_hand));
    }
    if (cpr.csr_status && cleanVal(cpr.csr_status)) {
      setCsrStatus(cleanVal(cpr.csr_status));
    }
    if (cpr.samagri_reached && cleanVal(cpr.samagri_reached)) {
      setSamagriReached(cleanVal(cpr.samagri_reached));
    }
    if (cpr.samagri_reached_note !== undefined && cpr.samagri_reached_note !== null) {
      setSamagriRemarks(cleanVal(cpr.samagri_reached_note));
    }
    if (
      cpr.nonCsr_donor_boards !== undefined ||
      cpr.nonCsr_already_sent !== undefined ||
      cpr.nonCsr_reason !== undefined
    ) {
      setDonorBoard((prev) => ({
        ...prev,
        nonCsr: {
          total: cpr.nonCsr_donor_boards !== undefined && cpr.nonCsr_donor_boards !== null ? cleanVal(cpr.nonCsr_donor_boards) : prev.nonCsr.total,
          sent: cpr.nonCsr_already_sent !== undefined && cpr.nonCsr_already_sent !== null ? cleanVal(cpr.nonCsr_already_sent) : prev.nonCsr.sent,
          remarks: cpr.nonCsr_reason !== undefined && cpr.nonCsr_reason !== null ? cleanVal(cpr.nonCsr_reason) : prev.nonCsr.remarks,
        },
      }));
    }
    if (
      cpr.csr_donor_boards !== undefined ||
      cpr.csr_already_sent !== undefined ||
      cpr.csr_reason !== undefined
    ) {
      setDonorBoard((prev) => ({
        ...prev,
        csr: {
          total: cpr.csr_donor_boards !== undefined && cpr.csr_donor_boards !== null ? cleanVal(cpr.csr_donor_boards) : prev.csr.total,
          sent: cpr.csr_already_sent !== undefined && cpr.csr_already_sent !== null ? cleanVal(cpr.csr_already_sent) : prev.csr.sent,
          remarks: cpr.csr_reason !== undefined && cpr.csr_reason !== null ? cleanVal(cpr.csr_reason) : prev.csr.remarks,
        },
      }));
    }
    if (cpr.school_progress_report_sent && cleanVal(cpr.school_progress_report_sent)) {
      setSchoolProgressSent(cleanVal(cpr.school_progress_report_sent));
    }
    if (
      cpr.school_progress_report_sent_reason !== undefined &&
      cpr.school_progress_report_sent_reason !== null
    ) {
      setProgressRemarks(cleanVal(cpr.school_progress_report_sent_reason));
    }
    if (cpr.monitoring_anchal_name && cleanVal(cpr.monitoring_anchal_name)) {
      setSelectedMonitoringAnchal(cleanVal(cpr.monitoring_anchal_name));
    }
    if (Array.isArray(data.monitoring_anchals) || Array.isArray(data.anchals_list)) {
      setMonitoringAnchalsList(data.monitoring_anchals || data.anchals_list);
    }
  }, []);

  // Fetch Auto-Fill Details: POST /api/getCPRReportDetails
  const fetchCPRReportDetails = useCallback(
    async (fYear, fMonth) => {
      if (!fYear || !fMonth) return;
      try {
        setLoadingDetails(true);
        const token = Cookies.get("token");
        console.log(`Triggering POST /api/getCPRReportDetails:`, {
          financial_year: fYear,
          financial_month: fMonth,
        });

        const res = await axios.post(
          `${BASE_URL}/api/getCPRReportDetails`,
          {
            financial_year: fYear,
            financial_month: fMonth,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("POST /api/getCPRReportDetails response:", res.data);
        const detailData =
          res.data?.data ||
          res.data?.cpr_report_details ||
          res.data?.cpr_details ||
          res.data?.details ||
          res.data;

        if (detailData && typeof detailData === "object") {
          applyReportDetails(detailData);
          toast.success(`CPR report details auto-filled for ${fMonth} ${fYear}`);
        }
      } catch (err) {
        console.error("Error fetching getCPRReportDetails:", err);
        const msg = err?.response?.data?.message || err?.message;
        if (msg) {
          toast(`Info: ${msg}`, { icon: "ℹ️" });
        }
      } finally {
        setLoadingDetails(false);
      }
    },
    [applyReportDetails]
  );

  // Fetch Single CPR Report by ID: GET /api/cpr-report/{id}
  const fetchReportById = useCallback(
    async (id) => {
      if (!id) return;
      try {
        setLoadingReport(true);
        const token = Cookies.get("token");
        console.log(`Triggering GET /api/cpr-report/${id}...`);
        const res = await axios.get(`${BASE_URL}/api/cpr-report/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`GET /api/cpr-report/${id} response:`, res.data);
        const report =
          res.data?.data ||
          res.data?.cpr_report ||
          res.data?.report ||
          res.data;

        if (report && typeof report === "object") {
          if (report.financial_year) setFinancialYear(report.financial_year);
          if (report.financial_month) {
            setMonthName(report.financial_month);
            const idx = FINANCIAL_MONTHS.indexOf(report.financial_month);
            if (idx !== -1) setMonthIndex(String(idx + 1));
          }
          if (report.name_of_cpp) setCppName(report.name_of_cpp);
          if (report.submission_date) setSubmissionDate(report.submission_date);

          // Pre-fill manual fields
          if (report.boxes_placed !== undefined && report.boxes_placed !== null) {
            setCollectionBoxes((prev) => ({
              ...prev,
              boxesThisMonth: cleanVal(report.boxes_placed),
              boxesTillDate: cleanVal(report.boxes_placed),
            }));
          }
          if (report.boxes_amount !== undefined && report.boxes_amount !== null) {
            setCollectionBoxes((prev) => ({
              ...prev,
              amountThisMonth: cleanVal(report.boxes_amount),
              amountTillDate: cleanVal(report.boxes_amount),
            }));
          }

          setInvestments({
            fd: cleanVal(report.fixed_deposit),
            mutualFund: cleanVal(report.mutual_fund),
            others: cleanVal(report.others),
            othersSpecify: cleanVal(report.other_specify),
          });

          if (report.cash_in_hand !== undefined && report.cash_in_hand !== null) {
            setCashInHand(cleanVal(report.cash_in_hand));
          }
          if (report.csr_status && cleanVal(report.csr_status)) {
            setCsrStatus(cleanVal(report.csr_status));
          }
          if (report.samagri_reached && cleanVal(report.samagri_reached)) {
            setSamagriReached(cleanVal(report.samagri_reached));
          }
          if (report.samagri_reached_note !== undefined && report.samagri_reached_note !== null) {
            setSamagriRemarks(cleanVal(report.samagri_reached_note));
          }

          setDonorBoard({
            nonCsr: {
              total: cleanVal(report.nonCsr_donor_boards),
              sent: cleanVal(report.nonCsr_already_sent),
              remarks: cleanVal(report.nonCsr_reason),
            },
            csr: {
              total: cleanVal(report.csr_donor_boards),
              sent: cleanVal(report.csr_already_sent),
              remarks: cleanVal(report.csr_reason),
            },
          });

          if (report.school_progress_report_sent && cleanVal(report.school_progress_report_sent)) {
            setSchoolProgressSent(cleanVal(report.school_progress_report_sent));
          }
          if (
            report.school_progress_report_sent_reason !== undefined &&
            report.school_progress_report_sent_reason !== null
          ) {
            setProgressRemarks(cleanVal(report.school_progress_report_sent_reason));
          }
          if (report.monitoring_anchal_name && cleanVal(report.monitoring_anchal_name)) {
            setSelectedMonitoringAnchal(cleanVal(report.monitoring_anchal_name));
          }
          if (report.signed_cpr && cleanVal(report.signed_cpr)) {
            setExistingSignedCprUrl(cleanVal(report.signed_cpr));
          }

          // Trigger getCPRReportDetails if financial_year & month are present
          const fy = report.financial_year || financialYear;
          const fm = report.financial_month || monthName;
          if (fy && fm) {
            fetchCPRReportDetails(fy, fm);
          }
        }
      } catch (err) {
        console.error(`Error loading GET /api/cpr-report/${id}:`, err);
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to load CPR report"
        );
      } finally {
        setLoadingReport(false);
      }
    },
    [fetchCPRReportDetails, financialYear, monthName]
  );

  useEffect(() => {
    if (reportId) {
      fetchReportById(reportId);
    }
  }, [reportId, fetchReportById]);

  useEffect(() => {
    if (!reportId && financialYear && monthName) {
      fetchCPRReportDetails(financialYear, monthName);
    }
  }, [fetchCPRReportDetails, financialYear, monthName, reportId]);

  // Build Payload FormData for post cpr-report
  const buildPayloadFormData = (status) => {
    const fd = new FormData();
    const appendStr = (key, val) => {
      const str = cleanVal(val);
      if (str === "" || str === "Choose") {
        fd.append(key, "");
        return;
      }
      fd.append(key, str);
    };

    appendStr("financial_year", financialYear || "2026-27");
    appendStr("financial_month", monthName || "April");
    appendStr("name_of_cpp", cppName);
    appendStr(
      "submission_date",
      submissionDate || new Date().toISOString().split("T")[0]
    );
    appendStr("boxes_placed", collectionBoxes.boxesThisMonth);
    appendStr("boxes_amount", collectionBoxes.amountThisMonth);
    appendStr("fixed_deposit", investments.fd);
    appendStr("mutual_fund", investments.mutualFund);
    appendStr("others", investments.others);
    appendStr("other_specify", investments.othersSpecify);
    appendStr("cash_in_hand", cashInHand);
    appendStr("csr_status", status || "Draft");
    appendStr("samagri_reached", samagriReached);
    appendStr("samagri_reached_note", samagriRemarks);
    appendStr("nonCsr_donor_boards", donorBoard.nonCsr.total);
    appendStr("nonCsr_already_sent", donorBoard.nonCsr.sent);
    appendStr("nonCsr_reason", donorBoard.nonCsr.remarks);
    appendStr("csr_donor_boards", donorBoard.csr.total);
    appendStr("csr_already_sent", donorBoard.csr.sent);
    appendStr("csr_reason", donorBoard.csr.remarks);
    appendStr("school_progress_report_sent", schoolProgressSent);
    appendStr("school_progress_report_sent_reason", progressRemarks);
    appendStr("monitoring_anchal_name", selectedMonitoringAnchal);

    if (signedFile instanceof File) {
      fd.append("signed_cpr", signedFile);
    } else if (existingSignedCprUrl) {
      fd.append("signed_cpr", existingSignedCprUrl);
    } else {
      fd.append("signed_cpr", "");
    }

    return fd;
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const token = Cookies.get("token");

      console.log("Saving CPR Draft (csr_status: Draft)...");

      let response;
      const targetId = currentReportId || reportId;

      const formData = buildPayloadFormData("Draft");
      if (targetId) {
        formData.append("_method", "PUT");
        response = await axios.post(
          `${BASE_URL}/api/cpr-report/${targetId}?_method=PUT`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(`${BASE_URL}/api/cpr-report`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      console.log("POST /api/cpr-report (draft) response:", response.data);
      const createdId =
        response.data?.id ||
        response.data?.data?.id ||
        response.data?.cpr_report?.id ||
        response.data?.cpr_report_id;
      if (createdId) {
        setCurrentReportId(createdId);
      }

      setCsrStatus("Draft");
      toast.success(response.data?.message || "Draft saved successfully!");
      const now = new Date();
      const formatted =
        now.toLocaleDateString("en-GB") +
        ", " +
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setSavedAt(formatted);

      // Return to list view so the newly saved draft is immediately visible
      if (onBack) {
        setTimeout(() => {
          onBack();
        }, 1200);
      }
    } catch (err) {
      console.error("Draft save error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save draft"
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current) {
      toast.error("Printable report reference not ready. Please try again.");
      return false;
    }
    setIsGeneratingPdf(true);
    const toastId = toast.loading("Generating CPR PDF...");

    try {
      const container = printableRef.current;
      const pages = container.querySelectorAll(".pdf-page");
      const pdf = new jsPDF("p", "mm", "a4");

      if (pages.length > 0) {
        for (let i = 0; i < pages.length; i++) {
          if (i > 0) pdf.addPage();
          const canvas = await html2canvas(pages[i], {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
          });
          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
        }
      } else {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const pdfWidth = 210;
        const pdfHeight = 297;
        const pageHeightInCanvas = (pdfHeight / pdfWidth) * canvas.width;
        let currentY = 0;
        let pageIdx = 0;

        while (currentY < canvas.height) {
          if (pageIdx > 0) pdf.addPage();
          const sliceHeight = Math.min(pageHeightInCanvas, canvas.height - currentY);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, sliceHeight);
          ctx.drawImage(
            canvas,
            0, currentY, canvas.width, sliceHeight,
            0, 0, canvas.width, sliceHeight
          );
          const pageImgData = pageCanvas.toDataURL("image/png");
          const slicePdfHeight = (sliceHeight * pdfWidth) / canvas.width;
          pdf.addImage(pageImgData, "PNG", 0, 0, pdfWidth, slicePdfHeight, undefined, "FAST");
          currentY += pageHeightInCanvas;
          pageIdx++;
        }
      }

      const chapterStr = (chapterName || "Chapter").replace(/\s+/g, "_");
      const monthStr = (monthName || "Month").replace(/\s+/g, "_");
      pdf.save(`CPR_Report_${chapterStr}_${monthStr}.pdf`);

      toast.dismiss(toastId);
      toast.success("CPR Report PDF downloaded successfully!");
      return true;
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.dismiss(toastId);
      toast.error("Failed to generate PDF. Please try again.");
      return false;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleResetForm = () => {
    // Header
    setChapterName("");
    setMonthIndex("");
    setMonthName("");
    setCppName("");
    setSubmissionDate("");
    setSubChapters([]);
    setNewSubChapter("");
    setShowSubChapterInput(false);
    setSavedAt("");

    // Section A
    setMemberships({
      chapter: { asOnMarch: "", added: "" },
      yuva: { asOnMarch: "", added: "" },
      mahila: { asOnMarch: "", added: "" },
    });

    // Section B
    setNoMeetingHeld(false);
    setMeetings([]);
    setCurrentMeeting({
      date: "",
      type: "Executive Committee Meeting",
      membersCount: "",
      invited: "",
      attended: "",
      agenda: "",
    });

    // Section C
    setOtsPRP("");
    setOtsCountDuringMonth("");

    // Section D
    setDonations({
      general: { during: "", till: "" },
      csr: { during: "", till: "" },
      other: { during: "", till: "" },
    });

    // Section E
    setCollectionBoxes({
      boxesThisMonth: "",
      boxesTillDate: "",
      amountThisMonth: "",
      amountTillDate: "",
    });

    // Section F
    setInvestments({
      fd: "",
      mutualFund: "",
      others: "",
      othersSpecify: "",
    });

    // Section G
    setCashInHand("");
    setBankBalances([]);

    // Section H
    setVanyatras([]);
    setNewVanyatra({
      date: "",
      yatrisCount: "",
      vidyalayasVisited: "",
      pravasDone: "No",
      remarks: "",
    });

    // Section I
    setEvents([]);
    setCurrentEvent({
      date: "",
      type: "",
      committee: "Yuva Samiti",
      photos: 0,
    });

    // Section J
    setAnchals([]);
    setNewAnchal({
      name: "",
      acharyasCount: "",
      annualTarget: "",
      remittanceLastMonth: "",
      remittanceThisMonth: "",
    });

    // Section K
    setSamagriReached("No");
    setSamagriRemarks("");
    setDonorBoard({
      nonCsr: { total: "", sent: "", remarks: "" },
      csr: { total: "", sent: "", remarks: "" },
    });
    setSchoolProgressSent("No");
    setProgressRemarks("");
    setSelectedMonitoringAnchal("Choose");
    setMonitoringAnchalsList([]);

    // Uploaded file
    setSignedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    scrollToSection("section-report-details");
  };

  const handleSubmit = async () => {
    if (!financialYear) {
      toast.error("Please select Financial Year");
      scrollToSection("section-report-details");
      return;
    }
    if (!monthName) {
      toast.error("Please select a Financial Month");
      scrollToSection("section-report-details");
      return;
    }
    if (!cppName?.trim()) {
      toast.error("Name of CPP is required");
      scrollToSection("section-report-details");
      return;
    }
    if (!submissionDate) {
      toast.error("Submission Date is required");
      scrollToSection("section-report-details");
      return;
    }
    if (cashInHand === "") {
      toast.error("Cash in Hand is required in Section G");
      scrollToSection("section-g");
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const token = Cookies.get("token");
      console.log("Submitting CPR Report (csr_status: Submitted)...");

      let response;
      const targetId = currentReportId || reportId;

      const formData = buildPayloadFormData("Submitted");
      if (targetId) {
        formData.append("_method", "PUT");
        response = await axios.post(
          `${BASE_URL}/api/cpr-report/${targetId}?_method=PUT`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(`${BASE_URL}/api/cpr-report`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      console.log("POST /api/cpr-report (submitted) response:", response.data);
      setCsrStatus("Submitted");
      toast.success(
        response.data?.message ||
          "Chapter Performance Report submitted successfully!"
      );

      // Download PDF
      await handleDownloadPDF();

      if (onBack) {
        setTimeout(() => {
          onBack();
        }, 1200);
      }
    } catch (err) {
      console.error("Submit CPR error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit CPR report"
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignedFile(file);
      toast.success(`Uploaded: ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-24 font-sans">
      <Toaster position="top-right" />

      {/* Main Container with Sticky Left Quick Nav */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-6">
        {/* Left Sticky Sidebar Nav */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-6 bg-white rounded-lg shadow-sm border border-slate-200 p-3 text-xs space-y-1">
            {[
              { id: "section-report-details", label: "Report Details", code: "" },
              { id: "section-a", label: "Membership Details", code: "A" },
              { id: "section-b", label: "Executive Committee Meeting Details", code: "B" },
              { id: "section-c", label: "OTS Details & Collection", code: "C" },
              { id: "section-d", label: "Donation & CSR Details", code: "D" },
              { id: "section-e", label: "Collection Boxes", code: "E" },
              { id: "section-f", label: "Investment (As on Date)", code: "F" },
              { id: "section-g", label: "Cash & Bank Balance", code: "G" },
              { id: "section-h", label: "Van Yatra", code: "H" },
              { id: "section-i", label: "Events During the Month", code: "I" },
              { id: "section-j", label: "Annex 1 – Disbursement to Anchal", code: "J" },
              { id: "section-k", label: "Annex 2 – Monthly Summary / Check Points", code: "K" },
              { id: "section-submit", label: "Sign & Submit", code: "✓" },
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  type="button"
                  className={`w-full text-left px-2.5 py-2 rounded flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.code && (
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.code}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Form Content */}
        <main className="flex-1 space-y-8 min-w-0">
          {/* Header Title & Legend */}
          <div
            id="section-report-details"
            className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6"
          >
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Chapter Performance Report
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>
                    Financial Year: <strong className="text-slate-800">{financialYear}</strong> | Month: <strong className="text-slate-800">{monthName || "Not Selected"}</strong>
                  </span>
                  {loadingReport && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading Report #{reportId}...
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchCPRReportDetails(financialYear, monthName)}
                  disabled={loadingDetails || !monthName}
                  className="text-xs px-3 py-1.5 border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Re-fetch and auto-fill report details from getCPRReportDetails API"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      loadingDetails ? "animate-spin" : ""
                    }`}
                  />
                  <span>{loadingDetails ? "Fetching..." : "Refresh Auto-Fill"}</span>
                </button>
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="self-start sm:self-auto text-xs px-3.5 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shadow-sm transition"
                  >
                    ← Back to Month List
                  </button>
                )}
              </div>
            </div>

            {/* Auto-Fill Loading Notification */}
            {loadingDetails && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>
                  Fetching and auto-filling details from <strong>getCPRReportDetails</strong> for {monthName} ({financialYear})...
                </span>
              </div>
            )}

            {/* Header Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Financial Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financial Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {getAvailableFinancialYears(
                    Cookies.get("currentYear") || "2026-27"
                  ).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Active Financial Year</span>
              </div>

              {/* Chapter Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chapter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  placeholder="e.g. Kolkata"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Chapter Name</span>
              </div>

              {/* For the Month Of */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financial Month <span className="text-red-500">*</span>
                </label>
                <select
                  value={monthName}
                  onChange={(e) => {
                    const m = e.target.value;
                    setMonthName(m);
                    const idx = FINANCIAL_MONTHS.indexOf(m);
                    if (idx !== -1) setMonthIndex(String(idx + 1));
                  }}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="">Select Month</option>
                  {availableMonths.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Report Month</span>
              </div>

              {/* Name of CPP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name of CPP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cppName}
                  onChange={(e) => setCppName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  placeholder="Enter CPP name"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Chairman / President</span>
              </div>

              {/* Submission Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={submissionDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {submissionDate || "No future dates allowed"}
                </span>
              </div>
            </div>

            {/* Sub Chapters of this Chapter */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 mb-1">
                Sub Chapters of this Chapter
              </h3>
              {subChapters.length === 0 ? (
                <p className="text-xs text-slate-500 mb-2">No sub chapters entered.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-2">
                  {subChapters.map((sc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700"
                    >
                      {sc}
                      <button
                        type="button"
                        onClick={() =>
                          setSubChapters(subChapters.filter((_, idx) => idx !== i))
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {showSubChapterInput ? (
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newSubChapter}
                    onChange={(e) => setNewSubChapter(e.target.value)}
                    placeholder="Sub chapter name"
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubChapter.trim()) {
                        setSubChapters([...subChapters, newSubChapter.trim()]);
                        setNewSubChapter("");
                        setShowSubChapterInput(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubChapterInput(false)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubChapterInput(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sub Chapter
                </button>
              )}
            </div>
          </div>

          {/* ================= SECTION A: MEMBERSHIP DATA ================= */}
          <section
            id="section-a"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#1e40af] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#1e40af] font-bold text-xs flex items-center justify-center">
                A
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">Membership Data</h2>
            </div>

            <div className="p-5 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                  <thead>
                    <tr className="bg-blue-50 text-slate-800 font-semibold border-b border-slate-200">
                      <th className="p-3 border-r border-slate-200 w-1/4">Particulars</th>
                      <th className="p-3 border-r border-slate-200 text-center w-1/5">
                        Members as on 31 March 2026
                      </th>
                      <th className="p-3 border-r border-slate-200 text-center w-1/5">
                        Membership Added During the Month <span className="text-red-500">*</span>
                      </th>
                      <th className="p-3 border-r border-slate-200 text-center w-1/5">
                        Cumulative Membership Till Date (up to April 2026)
                      </th>
                      <th className="p-3 text-right w-1/5">
                        Membership Amount Received (₹) @ ₹1,000 per member
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Chapter */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                        Chapter
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={memberships?.chapter?.asOnMarch ?? ""}
                          onChange={(e) =>
                            setMemberships({
                              ...memberships,
                              chapter: {
                                ...memberships.chapter,
                                asOnMarch: e.target.value,
                              },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={memberships?.chapter?.added ?? ""}
                          onChange={(e) =>
                            setMemberships({
                              ...memberships,
                              chapter: {
                                ...memberships.chapter,
                                added: e.target.value,
                              },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships?.chapter?.added !== "" ? memberships?.chapter?.added : ""}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships?.chapter?.added !== ""
                            ? formatINR(Number(memberships?.chapter?.added) * 1000)
                            : ""}
                        </div>
                      </td>
                    </tr>

                    {/* FTS Yuva */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                        FTS Yuva
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={memberships?.yuva?.asOnMarch ?? ""}
                          onChange={(e) =>
                            setMemberships({
                              ...memberships,
                              yuva: { ...memberships.yuva, asOnMarch: e.target.value },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={memberships?.yuva?.added ?? ""}
                          onChange={(e) =>
                            setMemberships({
                              ...memberships,
                              yuva: { ...memberships.yuva, added: e.target.value },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships?.yuva?.added !== "" ? memberships?.yuva?.added : ""}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships?.yuva?.added !== ""
                            ? formatINR(Number(memberships?.yuva?.added) * 1000)
                            : ""}
                        </div>
                      </td>
                    </tr>

                    {/* Mahila Samiti */}
                    <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                        Mahila Samiti
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={memberships?.mahila?.asOnMarch ?? ""}
                          onChange={(e) =>
                            setMemberships({
                              ...memberships,
                              mahila: {
                                ...memberships.mahila,
                                asOnMarch: e.target.value,
                              },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={memberships?.mahila?.added ?? ""}
                          onChange={(e) =>
                            setMemberships({
                              ...memberships,
                              mahila: {
                                ...memberships.mahila,
                                added: e.target.value,
                              },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships.mahila.added !== "" ? memberships.mahila.added : ""}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships.mahila.added !== ""
                            ? formatINR(Number(memberships.mahila.added) * 1000)
                            : ""}
                        </div>
                      </td>
                    </tr>

                    {/* TOTAL */}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td className="p-3 border-r border-slate-200 text-slate-900">TOTAL</td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/60 text-blue-950 font-bold text-xs">
                          {sectionATotals.asOnMarch || ""}
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/60 text-blue-950 font-bold text-xs">
                          {sectionATotals.added || ""}
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/60 text-blue-950 font-bold text-xs">
                          {sectionATotals.cumulative || ""}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/60 text-blue-950 font-bold text-xs">
                          {sectionATotals.amount || ""}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Members as on 31 March 2026 is entered once and then stays fixed (only the National
                Office can change it). Enter 0 where no members were added. Cumulative Membership Till
                Date and Membership Amount (members added × ₹1,000) fill themselves.
              </p>
            </div>
          </section>

          {/* ================= SECTION B: EXECUTIVE COMMITTEE MEETINGS ================= */}
          <section
            id="section-b"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#15803d] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#15803d] font-bold text-xs flex items-center justify-center">
                B
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                Executive Committee Meeting Details
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noMeetingHeld}
                  onChange={(e) => setNoMeetingHeld(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span>No Executive Committee Meeting was held this month</span>
              </label>

              {!noMeetingHeld && (
                <div className="space-y-3 pt-2">
                  {meetings.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No meeting added yet. Click "Add Meeting".
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {meetings.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded border border-slate-200 bg-slate-50 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">
                              Meeting {idx + 1}: {m.date || "Date not set"}
                            </span>
                            <span className="text-slate-500 ml-2">({m.type})</span>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              Attendees: {m.attended || 0} / {m.membersCount || 0}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentMeeting(m);
                                setMeetings(meetings.filter((_, i) => i !== idx));
                                setShowMeetingModal(true);
                              }}
                              className="px-2 py-1 text-xs border rounded bg-white hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setMeetings(meetings.filter((_, i) => i !== idx))}
                              className="px-2 py-1 text-xs border rounded bg-white text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMeeting({
                        date: "",
                        type: "Executive Committee Meeting",
                        membersCount: "",
                        invited: "",
                        attended: "",
                        agenda: "",
                      });
                      setShowMeetingModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Meeting
                  </button>

                  <p className="text-[11px] text-slate-400">
                    Held more than one meeting this month? Click "Add Meeting" again. Each meeting
                    has its own details.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ================= SECTION C: OTS DETAILS & COLLECTION ================= */}
          <section
            id="section-c"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#c2410c] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#c2410c] font-bold text-xs flex items-center justify-center">
                C
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                OTS Details & Collection
              </h2>
            </div>

            <div className="p-5 space-y-6">
              {/* OTS Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#c2410c] border-l-2 border-[#c2410c] pl-2">
                  OTS Details
                </h3>
                <label className="block text-xs font-semibold text-slate-700">OTS PRP</label>
                <input
                  type="text"
                  value={otsPRP ?? ""}
                  onChange={(e) => setOtsPRP(e.target.value)}
                  placeholder="Enter OTS PRP"
                  className="max-w-md w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  OTS PRP is filled only once. After you save it, it is locked in every later month's
                  CPR. If it needs correcting, please ask the National Office.
                </p>
              </div>

              {/* OTS Collection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#c2410c] border-l-2 border-[#c2410c] pl-2">
                  OTS Collection
                </h3>
                <span className="text-[11px] text-slate-400 block">
                  Till Date means up to April 2026.
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-orange-50/50 text-slate-800 font-semibold border-b border-slate-200">
                        <th className="p-3 border-r border-slate-200 w-1/2">Particulars</th>
                        <th className="p-3 border-r border-slate-200 text-center w-1/4">
                          During the Month <span className="text-red-500">*</span>
                        </th>
                        <th className="p-3 text-right w-1/4">Till Date (up to April 2026)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                          Total Number of OTS
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="number"
                            value={otsCountDuringMonth ?? ""}
                            onChange={(e) => {
                              setOtsCountDuringMonth(e.target.value);
                              setOtsAmountOverride(null);
                            }}
                            className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-orange-300 bg-orange-50/40 text-orange-950 font-semibold text-xs">
                            {otsCountTillDate || ""}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                          OTS Amount (₹) @ ₹30,000 per OTS
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-orange-300 bg-orange-50/50 text-orange-950 font-bold text-xs">
                            {otsCountDuringMonth !== "" ? formatINR(otsAmountDuringMonth) : ""}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-orange-300 bg-orange-50/50 text-orange-950 font-bold text-xs">
                            {otsCountTillDate !== "" ? formatINR(otsAmountTillDate) : ""}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-slate-500">
                  OTS Amount fills itself: Number of OTS × ₹30,000 (cost of one OTS for a year). It
                  cannot be typed.
                </p>
              </div>
            </div>
          </section>

          {/* ================= SECTION D: DONATION & CSR DETAILS ================= */}
          <section
            id="section-d"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#9f1239] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#9f1239] font-bold text-xs flex items-center justify-center">
                D
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                Donation & CSR Details
              </h2>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9f1239] border-l-2 border-[#9f1239] pl-2">
                Donation & CSR Collection
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                  <thead>
                    <tr className="bg-rose-50/50 text-slate-800 font-semibold border-b border-slate-200">
                      <th className="p-3 border-r border-slate-200 w-1/2">Particulars</th>
                      <th className="p-3 border-r border-slate-200 text-center w-1/4">
                        During the Month <span className="text-red-500">*</span>
                      </th>
                      <th className="p-3 text-right w-1/4">Till Date (up to April 2026)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                        General Donation (₹)
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={donations?.general?.during ?? ""}
                          onChange={(e) =>
                            setDonations({
                              ...donations,
                              general: { ...donations.general, during: e.target.value },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={donations?.general?.till ?? ""}
                          onChange={(e) =>
                            setDonations({
                              ...donations,
                              general: { ...donations.general, till: e.target.value },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                        CSR Donation (₹)
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={donations?.csr?.during ?? ""}
                          onChange={(e) =>
                            setDonations({
                              ...donations,
                              csr: { ...donations.csr, during: e.target.value },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={donations?.csr?.till ?? ""}
                          onChange={(e) =>
                            setDonations({
                              ...donations,
                              csr: { ...donations.csr, till: e.target.value },
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td className="p-3 border-r border-slate-200 text-slate-900">
                        TOTAL Donation (₹)
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-rose-300 bg-rose-50/60 text-rose-950 font-bold text-xs">
                          {donationTotals.during || ""}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-rose-300 bg-rose-50/60 text-rose-950 font-bold text-xs">
                          {donationTotals.till || ""}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ================= SECTION E: COLLECTION BOXES ================= */}
          <section
            id="section-e"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#7e22ce] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#7e22ce] font-bold text-xs flex items-center justify-center">
                E
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">Collection Boxes</h2>
            </div>

            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                  <thead>
                    <tr className="bg-purple-50/50 text-slate-800 font-semibold border-b border-slate-200">
                      <th className="p-3 border-r border-slate-200 w-1/2">Particulars</th>
                      <th className="p-3 border-r border-slate-200 text-center w-1/4">
                        This Month
                      </th>
                      <th className="p-3 text-right w-1/4">Till Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                        Boxes Placed
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={collectionBoxes?.boxesThisMonth ?? ""}
                          onChange={(e) =>
                            setCollectionBoxes({
                              ...collectionBoxes,
                              boxesThisMonth: e.target.value,
                              boxesTillDate: e.target.value,
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-purple-300 bg-purple-50/40 text-purple-950 font-semibold text-xs">
                          {collectionBoxes.boxesTillDate || ""}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                        Amount Collected (₹)
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="number"
                          value={collectionBoxes?.amountThisMonth ?? ""}
                          onChange={(e) =>
                            setCollectionBoxes({
                              ...collectionBoxes,
                              amountThisMonth: e.target.value,
                              amountTillDate: e.target.value,
                            })
                          }
                          className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-purple-300 bg-purple-50/40 text-purple-950 font-semibold text-xs">
                          {collectionBoxes.amountTillDate
                            ? Number(collectionBoxes.amountTillDate).toLocaleString("en-IN")
                            : ""}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ================= SECTION F: INVESTMENT ================= */}
          <section
            id="section-f"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#0f766e] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#0f766e] font-bold text-xs flex items-center justify-center">
                F
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                Investment (As on Date)
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fixed Deposit (FD) ₹
                  </label>
                  <input
                    type="number"
                    value={investments?.fd ?? ""}
                    onChange={(e) =>
                      setInvestments({ ...investments, fd: e.target.value })
                    }
                    className="w-full text-right px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mutual Fund ₹
                  </label>
                  <input
                    type="number"
                    value={investments?.mutualFund ?? ""}
                    onChange={(e) =>
                      setInvestments({ ...investments, mutualFund: e.target.value })
                    }
                    className="w-full text-right px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Others ₹
                  </label>
                  <input
                    type="number"
                    value={investments?.others ?? ""}
                    onChange={(e) =>
                      setInvestments({ ...investments, others: e.target.value })
                    }
                    className="w-full text-right px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Others (Please Specify)
                  </label>
                  <input
                    type="text"
                    value={investments?.othersSpecify ?? ""}
                    onChange={(e) =>
                      setInvestments({ ...investments, othersSpecify: e.target.value })
                    }
                    placeholder="Details"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TOTAL Investment
                </label>
                <div className="max-w-xs text-right px-3 py-2 rounded border border-dashed border-teal-300 bg-teal-50/50 text-teal-950 font-bold text-sm">
                  {totalInvestment || ""}
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION G: CASH & BANK BALANCE ================= */}
          <section
            id="section-g"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#0284c7] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#0284c7] font-bold text-xs flex items-center justify-center">
                G
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                Cash & Bank Balance as on April 2026
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cash in Hand ₹ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashInHand ?? ""}
                  onChange={(e) => setCashInHand(e.target.value)}
                  className="max-w-xs w-full text-right px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Bank Balance <span className="text-red-500">*</span>
                </label>

                {bankBalances.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No bank balance added yet. Click "+ Add Bank" to add accounts.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-sky-50/50 text-slate-800 font-semibold border-b border-slate-200">
                          <th className="p-3 border-r border-slate-200 w-1/2">
                            Bank Name <span className="text-red-500">*</span>
                          </th>
                          <th className="p-3 border-r border-slate-200 text-right w-1/3">
                            Balance ₹ <span className="text-red-500">*</span>
                          </th>
                          <th className="p-3 text-center w-24">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankBalances.map((b) => (
                          <tr key={b.id} className="border-b border-slate-100">
                            <td className="p-2 border-r border-slate-200">
                              <select
                                value={b.bankName}
                                onChange={(e) => {
                                  const isOther = e.target.value === "Other";
                                  setBankBalances(
                                    bankBalances.map((item) =>
                                      item.id === b.id
                                        ? { ...item, bankName: e.target.value, isOther }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none font-medium"
                              >
                                <option value="Bandhan Bank">Bandhan Bank</option>
                                <option value="ICICI Bank">ICICI Bank</option>
                                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                <option value="Standard Chartered Bank">
                                  Standard Chartered Bank
                                </option>
                                <option value="State Bank of India">State Bank of India</option>
                                <option value="HDFC Bank">HDFC Bank</option>
                                <option value="Punjab National Bank">
                                  Punjab National Bank
                                </option>
                                <option value="Axis Bank">Axis Bank</option>
                                <option value="Other">Other</option>
                              </select>
                              {b.isOther && (
                                <input
                                  type="text"
                                  placeholder="Specify Bank Name"
                                  value={b.customName || ""}
                                  onChange={(e) =>
                                    setBankBalances(
                                      bankBalances.map((item) =>
                                        item.id === b.id
                                          ? { ...item, customName: e.target.value }
                                          : item
                                       )
                                    )
                                  }
                                  className="w-full mt-1.5 px-2 py-1 border border-slate-300 rounded text-xs bg-slate-50 focus:outline-none"
                                />
                              )}
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                step="0.01"
                                value={b.balance ?? ""}
                                onChange={(e) =>
                                  setBankBalances(
                                    bankBalances.map((item) =>
                                      item.id === b.id
                                        ? { ...item, balance: e.target.value }
                                        : item
                                    )
                                  )
                                }
                                className="w-full text-right px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setBankBalances(
                                    bankBalances.filter((item) => item.id !== b.id)
                                  )
                                }
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setBankBalances([
                      ...bankBalances,
                      {
                        id: Date.now(),
                        bankName: "HDFC Bank",
                        balance: "",
                        isOther: false,
                        customName: "",
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Bank
                </button>
              </div>

              {/* Total Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Bank Balance
                  </label>
                  <div className="text-right px-3 py-2 rounded border border-dashed border-sky-300 bg-sky-50/50 text-sky-950 font-bold text-sm">
                    {totalBankBalance || ""}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    TOTAL Cash & Bank Balance
                  </label>
                  <div className="text-right px-3 py-2 rounded border border-dashed border-sky-300 bg-sky-50/50 text-sky-950 font-bold text-sm">
                    {totalCashAndBank || ""}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION H: VANYATRA ================= */}
          <section
            id="section-h"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#9a3412] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#9a3412] font-bold text-xs flex items-center justify-center">
                H
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">Vanyatra</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Vanyatra – This Month
                  </label>
                  <div className="px-3 py-2 rounded border border-dashed border-orange-300 bg-orange-50/40 text-orange-950 font-bold text-sm text-center">
                    {vanyatras.length || ""}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Counted from the entries below
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Vanyatra – Till Date (up to April 2026)
                  </label>
                  <div className="px-3 py-2 rounded border border-dashed border-orange-300 bg-orange-50/40 text-orange-950 font-bold text-sm text-center">
                    {vanyatras.length || ""}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9a3412] border-l-2 border-[#9a3412] pl-2">
                  Vanyatra Details
                </h3>

                {vanyatras.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No Vanyatra added. Click "+ Add Vanyatra".
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vanyatras.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded border border-slate-200 bg-slate-50 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            Vanyatra {i + 1}: {v.date || "Date not set"}
                          </span>
                          <span className="text-slate-500 ml-2">
                            ({v.yatrisCount || 0} Yatris)
                          </span>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Visited: {v.vidyalayasVisited || "None"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setVanyatras(vanyatras.filter((_, idx) => idx !== i))
                          }
                          className="px-2 py-1 text-xs border rounded bg-white text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowVanyatraModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Vanyatra
                </button>
              </div>
            </div>
          </section>

          {/* ================= SECTION I: EVENTS DURING THE MONTH ================= */}
          <section
            id="section-i"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#4f46e5] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#4f46e5] font-bold text-xs flex items-center justify-center">
                I
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                Events During the Month
              </h2>
            </div>

            <div className="p-5 space-y-3">
              {events.length === 0 ? (
                <p className="text-xs text-slate-500 mb-2">
                  No events added yet. Click "+ Add Event".
                </p>
              ) : (
                <div className="space-y-2">
                  {events.map((ev, index) => (
                    <div
                      key={ev.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition shadow-xs text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800">Event {index + 1}</span>
                        <span className="text-slate-600">
                          {ev.date} · {ev.type} · {ev.committee} · {ev.photos} photos
                        </span>
                        {ev.detailsMissing && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Details missing
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentEvent(ev);
                            setEvents(events.filter((item) => item.id !== ev.id));
                            setShowEventModal(true);
                          }}
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-100 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEvents(events.filter((item) => item.id !== ev.id))
                          }
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-red-50 text-slate-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentEvent({
                      id: Date.now(),
                      date: "",
                      type: "",
                      committee: "Yuva Samiti",
                      photos: 0,
                    });
                    setShowEventModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Event
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  Upload 2–4 photographs for each event (JPG, PNG or WEBP). Save the draft once,
                  then add photographs.
                </p>
              </div>
            </div>
          </section>

          {/* ================= SECTION J: ANNEXURE 1 ================= */}
          <section
            id="section-j"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#0e7490] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#0e7490] font-bold text-xs flex items-center justify-center">
                J
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                Annexure 1 – Disbursement to Anchal
              </h2>
            </div>

            <div className="p-5 space-y-3">
              {anchals.length === 0 ? (
                <p className="text-xs text-slate-500">No Anchal added yet. Click "Add Anchal".</p>
              ) : (
                <div className="space-y-2">
                  {anchals.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded border border-slate-200 bg-slate-50 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {a.name || `Anchal ${i + 1}`}
                        </span>
                        <span className="text-slate-500 ml-2">
                          (Acharyas: {a.acharyasCount || 0}, Remittance:{" "}
                          {formatINR(a.remittanceThisMonth)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnchals(anchals.filter((_, idx) => idx !== i))}
                        className="px-2 py-1 text-xs border rounded bg-white text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAnchalModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Anchal
              </button>
              <p className="text-[11px] text-slate-400">
                Choose Anchal names from the list. "Total Remittance till Last Date" is filled
                from last month's CPR.
              </p>
            </div>
          </section>

          {/* ================= SECTION K: ANNEXURE 2 ================= */}
          <section
            id="section-k"
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[#334155] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-[#334155] font-bold text-xs flex items-center justify-center">
                K
              </span>
              <h2 className="text-sm font-bold tracking-wide uppercase">
                Annexure 2 – Monthly Summary / Check Points
              </h2>
            </div>

            <div className="p-5 space-y-5">
              {/* Samagri reached */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs font-semibold text-slate-700 w-60">
                  Samagri reached to all schools <span className="text-red-500">*</span>
                </span>
                <div className="inline-flex rounded-md shadow-xs" role="group">
                  <button
                    type="button"
                    onClick={() => setSamagriReached("Yes")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-l-md border ${
                      samagriReached === "Yes"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSamagriReached("No")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-r-md border-t border-b border-r ${
                      samagriReached === "No"
                        ? "bg-[#b91c1c] text-white border-[#b91c1c]"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    No
                  </button>
                </div>
                <input
                  type="text"
                  value={samagriRemarks ?? ""}
                  onChange={(e) => setSamagriRemarks(e.target.value)}
                  placeholder="Reason / Remarks"
                  className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none"
                />
              </div>

              {/* Donor Board Details */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-l-2 border-slate-700 pl-2">
                  Donor Board Details
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                        <th className="p-2.5 border-r border-slate-200 w-1/4">Particulars</th>
                        <th className="p-2.5 border-r border-slate-200 text-center w-1/6">
                          Total Donor Boards
                        </th>
                        <th className="p-2.5 border-r border-slate-200 text-center w-1/6">
                          Already Sent
                        </th>
                        <th className="p-2.5 border-r border-slate-200 text-center w-1/6">
                          Pending
                        </th>
                        <th className="p-2.5 w-1/4">Reason / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-2.5 font-medium text-slate-800 border-r border-slate-200">
                          Non-CSR Donor Board reached to all schools
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="number"
                            value={donorBoard?.nonCsr?.total ?? ""}
                            onChange={(e) =>
                              setDonorBoard({
                                ...donorBoard,
                                nonCsr: { ...donorBoard.nonCsr, total: e.target.value },
                              })
                            }
                            className="w-full text-right px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="number"
                            value={donorBoard?.nonCsr?.sent ?? ""}
                            onChange={(e) =>
                              setDonorBoard({
                                ...donorBoard,
                                nonCsr: { ...donorBoard.nonCsr, sent: e.target.value },
                              })
                            }
                            className="w-full text-right px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="w-full text-right px-2 py-1 rounded border border-dashed border-slate-300 bg-slate-50 text-slate-700 font-medium text-xs">
                            {donorBoard.nonCsr.total !== "" && donorBoard.nonCsr.sent !== ""
                              ? Math.max(
                                  0,
                                  (Number(donorBoard.nonCsr.total) || 0) -
                                    (Number(donorBoard.nonCsr.sent) || 0)
                                )
                              : ""}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={donorBoard?.nonCsr?.remarks ?? ""}
                            onChange={(e) =>
                              setDonorBoard({
                                ...donorBoard,
                                nonCsr: { ...donorBoard.nonCsr, remarks: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2.5 font-medium text-slate-800 border-r border-slate-200">
                          CSR Donor Board reached to all schools
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="number"
                            value={donorBoard?.csr?.total ?? ""}
                            onChange={(e) =>
                              setDonorBoard({
                                ...donorBoard,
                                csr: { ...donorBoard.csr, total: e.target.value },
                              })
                            }
                            className="w-full text-right px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="number"
                            value={donorBoard?.csr?.sent ?? ""}
                            onChange={(e) =>
                              setDonorBoard({
                                ...donorBoard,
                                csr: { ...donorBoard.csr, sent: e.target.value },
                              })
                            }
                            className="w-full text-right px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="w-full text-right px-2 py-1 rounded border border-dashed border-slate-300 bg-slate-50 text-slate-700 font-medium text-xs">
                            {donorBoard.csr.total !== "" && donorBoard.csr.sent !== ""
                              ? Math.max(
                                  0,
                                  (Number(donorBoard.csr.total) || 0) -
                                    (Number(donorBoard.csr.sent) || 0)
                                )
                              : ""}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={donorBoard?.csr?.remarks ?? ""}
                            onChange={(e) =>
                              setDonorBoard({
                                ...donorBoard,
                                csr: { ...donorBoard.csr, remarks: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* School Progress Report */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 w-60">
                  School Progress Report sent to CSR Donors
                </span>
                <div className="inline-flex rounded-md shadow-xs" role="group">
                  <button
                    type="button"
                    onClick={() => setSchoolProgressSent("Yes")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-l-md border ${
                      schoolProgressSent === "Yes"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchoolProgressSent("No")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-r-md border-t border-b border-r ${
                      schoolProgressSent === "No"
                        ? "bg-[#b91c1c] text-white border-[#b91c1c]"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    No
                  </button>
                </div>
                <input
                  type="text"
                  value={progressRemarks ?? ""}
                  onChange={(e) => setProgressRemarks(e.target.value)}
                  placeholder="Reason / Remarks"
                  className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none"
                />
              </div>

              {/* Monitoring Anchal Name */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Monitoring Anchal Name
                </label>
                <div className="relative max-w-sm">
                  <select
                    value={selectedMonitoringAnchal}
                    onChange={(e) => setSelectedMonitoringAnchal(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-slate-500 appearance-none font-medium"
                  >
                    <option value="Choose">Choose</option>
                    <option value="Anchal Purulia">Anchal Purulia</option>
                    <option value="Anchal Bankura">Anchal Bankura</option>
                    <option value="Anchal Ranchi">Anchal Ranchi</option>
                    <option value="Anchal Dhanbad">Anchal Dhanbad</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      selectedMonitoringAnchal !== "Choose" &&
                      !monitoringAnchalsList.includes(selectedMonitoringAnchal)
                    ) {
                      setMonitoringAnchalsList([
                        ...monitoringAnchalsList,
                        selectedMonitoringAnchal,
                      ]);
                      setSelectedMonitoringAnchal("Choose");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Monitoring Anchal
                </button>

                {monitoringAnchalsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {monitoringAnchalsList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200 text-xs font-medium text-slate-800"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() =>
                            setMonitoringAnchalsList(
                              monitoringAnchalsList.filter((_, i) => i !== idx)
                            )
                          }
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ================= SIGN & SUBMIT CONTAINER ================= */}
          <section
            id="section-submit"
            className="border-2 border-teal-600 rounded-lg p-6 bg-white shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-teal-800">Sign & Submit</h2>
              <p className="text-xs text-slate-600 mt-1">
                The CPR is submitted together with a copy signed by the Chapter President and
                Secretary.
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 rounded-lg border-2 border-teal-600/30 bg-teal-50/20 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Download the filled CPR
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      It is checked and saved first, then downloaded as a PDF with spaces for the
                      signatures.
                    </p>
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={handleDownloadPDF}
                      className="mt-3 px-4 py-2 rounded bg-[#0f3d4c] hover:bg-[#092934] text-white text-xs font-semibold shadow-xs inline-flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Download CPR for signature</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Get it signed</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Print it and get it signed by the President and the Secretary. Then scan it, or
                    take a clear photo of each page.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-wrap items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-900">Upload the signed CPR</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-2 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload signed CPR
                    </button>
                    <span className="text-[11px] text-slate-400">
                      PDF, JPG, JPEG, PNG, up to 10 MB
                    </span>
                  </div>
                  {existingSignedCprUrl && !signedFile && (
                    <div className="mt-2.5 p-2 rounded border border-teal-200 bg-teal-50/70 flex items-center justify-between text-xs max-w-md">
                      <span className="text-teal-900 font-medium">
                        Current Signed CPR Document on record
                      </span>
                      <a
                        href={existingSignedCprUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 underline font-semibold hover:text-teal-900 ml-2"
                      >
                        View File
                      </a>
                    </div>
                  )}
                  {signedFile && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {signedFile.name} ({(signedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Submit the CPR</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Opens after the signed copy is uploaded.
                  </p>
                  <button
                    type="button"
                    disabled={isGeneratingPdf}
                    onClick={handleSubmit}
                    className="mt-3 px-5 py-2.5 rounded bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating CPR PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Submit CPR & Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      {/* Hidden print container for high-fidelity PDF capture */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -50,
          pointerEvents: "none",
          opacity: isGeneratingPdf ? 1 : 0,
        }}
      >
        <CPRPrintReport
          ref={printableRef}
          chapterName={chapterName}
          monthIndex={monthIndex}
          monthName={monthName}
          cppName={cppName}
          submissionDate={submissionDate}
          subChapters={subChapters}
          memberships={memberships}
          sectionATotals={sectionATotals}
          noMeetingHeld={noMeetingHeld}
          meetings={meetings}
          otsPRP={otsPRP}
          otsCountDuringMonth={otsCountDuringMonth}
          otsCountTillDate={otsCountTillDate}
          otsAmountDuringMonth={otsAmountDuringMonth}
          otsAmountTillDate={otsAmountTillDate}
          donations={donations}
          donationTotals={donationTotals}
          collectionBoxes={collectionBoxes}
          investments={investments}
          totalInvestment={totalInvestment}
          cashInHand={cashInHand}
          bankBalances={bankBalances}
          totalBankBalance={totalBankBalance}
          totalCashAndBank={totalCashAndBank}
          vanyatras={vanyatras}
          events={events}
          anchals={anchals}
          samagriReached={samagriReached}
          samagriRemarks={samagriRemarks}
          donorBoard={donorBoard}
          schoolProgressSent={schoolProgressSent}
          progressRemarks={progressRemarks}
          selectedMonitoringAnchal={selectedMonitoringAnchal}
          monitoringAnchalsList={monitoringAnchalsList}
          signedFile={signedFile}
          formatINR={formatINR}
        />
      </div>
    </div>

      {/* ================= FIXED BOTTOM ACTION BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 z-40 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All changes saved.</span>
          </div>

          <div className="flex items-center gap-3">
            {isView ? (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                >
                  Back to List
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="px-4 py-2 rounded-md border border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </>
            ) : (
              <>
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                  >
                    Back to List
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="px-4 py-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSavingDraft ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="px-4 py-2 rounded-md border border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isGeneratingPdf}
                  className="px-4 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Submit CPR</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD MEETING ================= */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Add Executive Committee Meeting
              </h3>
              <button
                type="button"
                onClick={() => setShowMeetingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Date</label>
                <input
                  type="date"
                  value={currentMeeting.date}
                  max={todayDate}
                  onChange={(e) =>
                    setCurrentMeeting({ ...currentMeeting, date: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Type</label>
                <input
                  type="text"
                  value={currentMeeting.type}
                  onChange={(e) =>
                    setCurrentMeeting({ ...currentMeeting, type: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total EC</label>
                  <input
                    type="number"
                    value={currentMeeting.membersCount}
                    onChange={(e) =>
                      setCurrentMeeting({
                        ...currentMeeting,
                        membersCount: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-right"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invited</label>
                  <input
                    type="number"
                    value={currentMeeting.invited}
                    onChange={(e) =>
                      setCurrentMeeting({ ...currentMeeting, invited: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-right"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attended</label>
                  <input
                    type="number"
                    value={currentMeeting.attended}
                    onChange={(e) =>
                      setCurrentMeeting({ ...currentMeeting, attended: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-right"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Agenda / Points
                </label>
                <textarea
                  value={currentMeeting.agenda}
                  onChange={(e) =>
                    setCurrentMeeting({ ...currentMeeting, agenda: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  placeholder="Key discussion points..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowMeetingModal(false)}
                className="px-3 py-1.5 border rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setMeetings([...meetings, currentMeeting]);
                  setShowMeetingModal(false);
                }}
                className="px-3 py-1.5 bg-green-700 text-white rounded text-xs font-semibold hover:bg-green-800"
              >
                Save Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD VANYATRA ================= */}
      {showVanyatraModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Vanyatra</h3>
              <button
                type="button"
                onClick={() => setShowVanyatraModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vanyatra Date</label>
                <input
                  type="date"
                  value={newVanyatra.date}
                  max={todayDate}
                  onChange={(e) =>
                    setNewVanyatra({ ...newVanyatra, date: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Number of Yatris
                </label>
                <input
                  type="number"
                  value={newVanyatra.yatrisCount}
                  onChange={(e) =>
                    setNewVanyatra({ ...newVanyatra, yatrisCount: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-right"
                  placeholder="Count"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vidyalayas Visited
                </label>
                <input
                  type="text"
                  value={newVanyatra.vidyalayasVisited}
                  onChange={(e) =>
                    setNewVanyatra({
                      ...newVanyatra,
                      vidyalayasVisited: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  placeholder="Names of Vidyalayas"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Remarks / Pravas
                </label>
                <textarea
                  value={newVanyatra.remarks}
                  onChange={(e) =>
                    setNewVanyatra({ ...newVanyatra, remarks: e.target.value })
                  }
                  rows={2}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  placeholder="Observations during Vanyatra"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowVanyatraModal(false)}
                className="px-3 py-1.5 border rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setVanyatras([...vanyatras, newVanyatra]);
                  setNewVanyatra({
                    date: "",
                    yatrisCount: "",
                    vidyalayasVisited: "",
                    pravasDone: "No",
                    remarks: "",
                  });
                  setShowVanyatraModal(false);
                }}
                className="px-3 py-1.5 bg-[#9a3412] text-white rounded text-xs font-semibold hover:bg-[#7c2d12]"
              >
                Save Vanyatra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD EVENT ================= */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Event Details</h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Date</label>
                <input
                  type="date"
                  value={currentEvent.date}
                  max={todayDate}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, date: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Type / Name
                </label>
                <input
                  type="text"
                  value={currentEvent.type}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, type: e.target.value })
                  }
                  placeholder="e.g. ANNUAL MEET"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Committee</label>
                <select
                  value={currentEvent.committee}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, committee: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                >
                  <option value="Yuva Samiti">Yuva Samiti</option>
                  <option value="Mahila Samiti">Mahila Samiti</option>
                  <option value="Executive Committee">Executive Committee</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-3 py-1.5 border rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvents([
                    ...events,
                    {
                      ...currentEvent,
                      id: currentEvent.id || Date.now(),
                      detailsMissing: false,
                    },
                  ]);
                  setShowEventModal(false);
                }}
                className="px-3 py-1.5 bg-[#4f46e5] text-white rounded text-xs font-semibold hover:bg-[#4338ca]"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ANCHAL ================= */}
      {showAnchalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Anchal Disbursement</h3>
              <button
                type="button"
                onClick={() => setShowAnchalModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anchal Name</label>
                <input
                  type="text"
                  value={newAnchal.name}
                  onChange={(e) =>
                    setNewAnchal({ ...newAnchal, name: e.target.value })
                  }
                  placeholder="e.g. Anchal Purulia"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Acharyas Paid
                  </label>
                  <input
                    type="number"
                    value={newAnchal.acharyasCount}
                    onChange={(e) =>
                      setNewAnchal({ ...newAnchal, acharyasCount: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-right"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Annual Target ₹
                  </label>
                  <input
                    type="number"
                    value={newAnchal.annualTarget}
                    onChange={(e) =>
                      setNewAnchal({ ...newAnchal, annualTarget: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-right"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Remittance Last Month ₹
                  </label>
                  <input
                    type="number"
                    value={newAnchal.remittanceLastMonth}
                    onChange={(e) =>
                      setNewAnchal({
                        ...newAnchal,
                        remittanceLastMonth: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-right"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Remittance This Month ₹
                  </label>
                  <input
                    type="number"
                    value={newAnchal.remittanceThisMonth}
                    onChange={(e) =>
                      setNewAnchal({
                        ...newAnchal,
                        remittanceThisMonth: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-right"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAnchalModal(false)}
                className="px-3 py-1.5 border rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnchals([...anchals, newAnchal]);
                  setNewAnchal({
                    name: "",
                    acharyasCount: "",
                    annualTarget: "",
                    remittanceLastMonth: "",
                    remittanceThisMonth: "",
                  });
                  setShowAnchalModal(false);
                }}
                className="px-3 py-1.5 bg-[#0e7490] text-white rounded text-xs font-semibold hover:bg-[#155e75]"
              >
                Save Anchal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CPRForm;
