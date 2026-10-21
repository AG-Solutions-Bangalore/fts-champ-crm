import React, { useState, useMemo, useRef } from "react";
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
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CPRPrintReport from "./cpr-print-report";

// Helper for Indian Currency Formatting
const formatINR = (val) => {
  if (val === undefined || val === null || val === "" || isNaN(val)) return "";
  const num = Number(val);
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

const CPRForm = () => {
  // Top Header State - all cleared
  const [chapterName, setChapterName] = useState("");
  const [monthIndex, setMonthIndex] = useState("");
  const [monthName, setMonthName] = useState("");
  const [cppName, setCppName] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [subChapters, setSubChapters] = useState([]);
  const [newSubChapter, setNewSubChapter] = useState("");
  const [showSubChapterInput, setShowSubChapterInput] = useState(false);
  const [savedAt, setSavedAt] = useState("");

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
  const otsCountTillDate = otsCountDuringMonth;
  const otsAmountDuringMonth = otsCountDuringMonth
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

  // Sign & Submit & PDF refs
  const [signedFile, setSignedFile] = useState(null);
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

  const handleSaveDraft = () => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-GB") +
      ", " +
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSavedAt(formatted);
    toast.success("Draft saved successfully!");
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
    if (!chapterName) {
      toast.error("Please select a Chapter Name first.");
      scrollToSection("section-report-details");
      return;
    }
    if (!monthName) {
      toast.error("Please select a Month first.");
      scrollToSection("section-report-details");
      return;
    }
    toast.success("Chapter Performance Report submitted successfully!");
    const success = await handleDownloadPDF();
    if (success !== false) {
      handleResetForm();
      toast.success("Form data has been cleared for next entry.");
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
            <div className="border-b border-slate-100 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Chapter Performance Report
              </h1>
            </div>

            {/* Header Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Chapter Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chapter Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
                  >
                    <option value="">Select Chapter</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Set by your login</span>
              </div>

              {/* For the Month Of */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  For the Month Of
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative col-span-1">
                    <select
                      value={monthIndex}
                      onChange={(e) => setMonthIndex(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-center"
                    >
                      <option value="">No.</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-3 pointer-events-none" />
                  </div>
                  <div className="relative col-span-2">
                    <select
                      value={monthName}
                      onChange={(e) => setMonthName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
                    >
                      <option value="">Select Month</option>
                      {[
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
                      ].map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">FY 2026-27</span>
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
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="Enter name"
                />
              </div>

              {/* Submission Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {submissionDate || "DD/MM/YYYY"}
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
                          value={memberships.chapter.asOnMarch}
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
                          value={memberships.chapter.added}
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
                          {memberships.chapter.added !== "" ? memberships.chapter.added : ""}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships.chapter.added !== ""
                            ? formatINR(Number(memberships.chapter.added) * 1000)
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
                          value={memberships.yuva.asOnMarch}
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
                          value={memberships.yuva.added}
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
                          {memberships.yuva.added !== "" ? memberships.yuva.added : ""}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full text-right px-2 py-1.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-900 font-semibold text-xs">
                          {memberships.yuva.added !== ""
                            ? formatINR(Number(memberships.yuva.added) * 1000)
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
                          value={memberships.mahila.asOnMarch}
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
                          value={memberships.mahila.added}
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
                  value={otsPRP}
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
                            value={otsCountDuringMonth}
                            onChange={(e) => setOtsCountDuringMonth(e.target.value)}
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
                          value={donations.general.during}
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
                          value={donations.general.till}
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
                          value={donations.csr.during}
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
                          value={donations.csr.till}
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
                          value={collectionBoxes.boxesThisMonth}
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
                          value={collectionBoxes.amountThisMonth}
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
                    value={investments.fd}
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
                    value={investments.mutualFund}
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
                    value={investments.others}
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
                    value={investments.othersSpecify}
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
                  value={cashInHand}
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
                                value={b.balance}
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
                  value={samagriRemarks}
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
                            value={donorBoard.nonCsr.total}
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
                            value={donorBoard.nonCsr.sent}
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
                            value={donorBoard.nonCsr.remarks}
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
                            value={donorBoard.csr.total}
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
                            value={donorBoard.csr.sent}
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
                            value={donorBoard.csr.remarks}
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
                  value={progressRemarks}
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
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-md border border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Submit CPR</span>
            </button>
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
