import React, { forwardRef } from "react";

// Helper for Indian Currency Formatting with "Rs." prefix matching the required CPR format
const formatRs = (val, defaultValue = "") => {
  if (val === undefined || val === null || val === "" || isNaN(val)) {
    return defaultValue;
  }
  const num = Number(val);
  return "Rs. " + num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

// Helper for Indian Date formatting DD-MM-YYYY
const formatDateDDMMYYYY = (dateVal) => {
  if (!dateVal) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    return `${d}-${m}-${y}`;
  }
  try {
    const dObj = new Date(dateVal);
    if (isNaN(dObj.getTime())) return String(dateVal);
    const d = String(dObj.getDate()).padStart(2, "0");
    const m = String(dObj.getMonth() + 1).padStart(2, "0");
    const y = dObj.getFullYear();
    return `${d}-${m}-${y}`;
  } catch {
    return String(dateVal);
  }
};

// Helper for Generated timestamp YYYY-MM-DD HH:mm:ss
const getGeneratedTimestamp = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

const CPRPrintReport = forwardRef(
  (
    {
      chapterName = "Kolkata (CH29)",
      monthIndex = "08",
      monthName = "August",
      financialYear = "2026-27",
      cppName = "Suresh Kumar Dhanuka",
      submissionDate = "",
      subChapters = [],
      memberships = { chapter: {}, yuva: {}, mahila: {} },
      sectionATotals = {},
      noMeetingHeld = false,
      meetings = [],
      otsPRP = "0",
      otsCountDuringMonth = "0",
      otsCountTillDate = "0",
      otsAmountDuringMonth = 0,
      otsAmountTillDate = 0,
      donations = { general: {}, csr: {}, other: {} },
      donationTotals = {},
      csrSchoolsCount = "0",
      collectionBoxes = {},
      investments = {},
      totalInvestment = "",
      cashInHand = "",
      bankBalances = [],
      totalBankBalance = "",
      totalCashAndBank = "",
      vanyatras = [],
      vanyatrasCountThisMonth = 0,
      vanyatrasCountTillDate = 0,
      events = [],
      anchals = [],
      samagriReached = "Yes",
      samagriRemarks = "",
      donorBoard = { nonCsr: {}, csr: {} },
      schoolProgressSent = "No",
      progressRemarks = "",
      selectedMonitoringAnchal = "",
      monitoringAnchalsList = [],
      reportId = "",
      csrStatus = "For signature by the President and Secretary",
    },
    ref
  ) => {
    // Current year calculation
    const matchFY = (financialYear || "2026-27").match(/^(\d{4})/);
    const startYear = matchFY ? matchFY[1] : "2026";
    const reportMonthYear = `${monthName || "August"} ${startYear}`;
    const displaySubDate = formatDateDDMMYYYY(submissionDate);
    const generatedTimestamp = getGeneratedTimestamp();

    // Cumulative membership calculation (As on March + Added)
    const cumulativeChapter =
      (Number(memberships.chapter?.asOnMarch) || 0) +
      (Number(memberships.chapter?.added) || 0);
    const cumulativeYuva =
      (Number(memberships.yuva?.asOnMarch) || 0) +
      (Number(memberships.yuva?.added) || 0);
    const cumulativeMahila =
      (Number(memberships.mahila?.asOnMarch) || 0) +
      (Number(memberships.mahila?.added) || 0);

    // Section A Membership Received Amount
    const amountChapter = (Number(memberships.chapter?.added) || 0) * 1000;
    const amountYuva = (Number(memberships.yuva?.added) || 0) * 1000;
    const amountMahila = (Number(memberships.mahila?.added) || 0) * 1000;
    const amountTotal = amountChapter + amountYuva + amountMahila;

    // OTS calculations
    const otsDuringCountNum = Number(otsCountDuringMonth) || 0;
    const otsTillCountNum = Number(otsCountTillDate || otsCountDuringMonth) || 0;
    const otsDuringAmt = otsAmountDuringMonth || otsDuringCountNum * 30000;
    const otsTillAmt = otsAmountTillDate || otsTillCountNum * 30000;

    // Section D Donation Totals
    const nonCsrTill = donations.other?.till ?? "";
    const csrTill = donations.csr?.till ?? "";
    const totalDonationTill =
      (Number(nonCsrTill) || 0) + (Number(csrTill) || 0) || "";

    // Section J Totals
    const totalAcharyasPaid = anchals.reduce(
      (acc, a) => acc + (Number(a.acharyasPaid) || 0),
      0
    );
    const totalRemittanceTillLast = anchals.reduce(
      (acc, a) => acc + (Number(a.remittanceLastMonth) || 0),
      0
    );
    const totalRemittanceThisMonth = anchals.reduce(
      (acc, a) => acc + (Number(a.remittanceThisMonth) || 0),
      0
    );
    const totalPrpAcharyas = anchals.reduce(
      (acc, a) => acc + (Number(a.acharyasCount) || 0),
      0
    );
    const totalPrpAmount = anchals.reduce(
      (acc, a) => acc + (Number(a.annualTarget) || 0),
      0
    );

    // Monitoring Anchal text
    const monitoringAnchalDisplay =
      selectedMonitoringAnchal && selectedMonitoringAnchal !== "Choose"
        ? selectedMonitoringAnchal
        : monitoringAnchalsList.length > 0
        ? monitoringAnchalsList.join(", ")
        : "Ambasha";

    // Auto-formatted Report ID
    const formattedReportId =
      reportId ||
      `CH29_${financialYear || "2026-27"}_${String(monthIndex || "08").padStart(
        2,
        "0"
      )}_CHAPTER`;

    return (
      <div ref={ref} className="cpr-printable-root bg-white text-slate-900">
        <style>{`
          .pdf-page {
            width: 794px;
            min-height: 1123px;
            max-height: 1123px;
            padding: 30px 40px 32px 40px;
            box-sizing: border-box;
            background-color: #ffffff;
            color: #0f172a;
            font-family: Arial, Helvetica, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
          }
          .cpr-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-family: Arial, Helvetica, sans-serif;
            margin-bottom: 3px;
          }
          .cpr-table th {
            background-color: #ffffff;
            color: #0f172a;
            font-weight: 700;
            font-size: 8.5px;
            line-height: 1.35;
            border: 1px solid #475569;
            padding: 4px 5px;
            vertical-align: middle;
            box-sizing: border-box;
          }
          .cpr-table td {
            border: 1px solid #475569;
            padding: 3.5px 5px;
            font-size: 8.5px;
            line-height: 1.35;
            color: #0f172a;
            vertical-align: middle;
            box-sizing: border-box;
          }
          .cpr-heading {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 6px;
            margin-bottom: 2px;
            line-height: 1.2;
          }
          .cpr-subheading {
            font-size: 9px;
            font-weight: 700;
            color: #c2410c;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.2;
          }
          .table-header-box {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #334155;
            font-family: Arial, Helvetica, sans-serif;
            margin-bottom: 8px;
          }
          .table-header-box td {
            border: 1px solid #334155;
            padding: 4px 8px;
            vertical-align: middle;
            box-sizing: border-box;
          }
        `}</style>

        {/* ========================================================= */}
        {/* ======================== PAGE 1 ========================= */}
        {/* ========================================================= */}
        <div className="pdf-page">
          <div className="flex-1">
            {/* Top Header Box Table */}
            <table className="table-header-box">
              <tbody>
                <tr>
                  <td style={{ width: "35%", fontSize: "11px", fontWeight: "bold", color: "#1e293b" }}>
                    Friends of Tribals Society
                  </td>
                  <td style={{ width: "65%", fontSize: "13px", fontWeight: "bold", textAlign: "center", color: "#1e3a8a", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    CHAPTER PERFORMANCE REPORT (CPR)
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: "9.5px", color: "#0f172a" }}>
                    <span style={{ fontWeight: "bold" }}>Chapter Name</span>
                    <span style={{ marginLeft: "18px", fontWeight: "600" }}>
                      {chapterName || "Kolkata (CH29)"}
                    </span>
                  </td>
                  <td style={{ fontSize: "9.5px", color: "#0f172a" }}>
                    <span style={{ fontWeight: "bold" }}>For the Month of</span>
                    <span style={{ marginLeft: "18px", fontWeight: "600" }}>
                      {reportMonthYear} (FY {financialYear || "2026-27"})
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: "9.5px", color: "#0f172a" }}>
                    <span style={{ fontWeight: "bold" }}>Name of CPP</span>
                    <span style={{ marginLeft: "25px", fontWeight: "600" }}>
                      {cppName || "Suresh Kumar Dhanuka"}
                    </span>
                  </td>
                  <td style={{ fontSize: "9.5px", color: "#0f172a" }}>
                    <span style={{ fontWeight: "bold" }}>Submission Date</span>
                    <span style={{ marginLeft: "22px", fontWeight: "600" }}>
                      {displaySubDate}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* A | MEMBERSHIP DETAILS */}
            <div style={{ marginBottom: "6px" }}>
              <div className="cpr-heading">A | MEMBERSHIP DETAILS</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "24%", textAlign: "left" }}>
                      Particulars
                    </th>
                    <th style={{ width: "19%", textAlign: "right" }}>
                      Members as on 31<br />March {startYear}
                    </th>
                    <th style={{ width: "19%", textAlign: "right" }}>
                      Membership Added<br />During the Month
                    </th>
                    <th style={{ width: "19%", textAlign: "right" }}>
                      Cumulative Membership Till<br />Date (up to {monthName || "August"} {startYear})
                    </th>
                    <th style={{ width: "19%", textAlign: "right" }}>
                      Membership Amount Received<br />(Rs.) @ Rs. 1,000 per member
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Chapter</td>
                    <td style={{ textAlign: "right" }}>{memberships.chapter?.asOnMarch || "0"}</td>
                    <td style={{ textAlign: "right" }}>{memberships.chapter?.added || "0"}</td>
                    <td style={{ textAlign: "right" }}>{cumulativeChapter}</td>
                    <td style={{ textAlign: "right" }}>{formatRs(amountChapter, "Rs. 0")}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>FTS Yuva</td>
                    <td style={{ textAlign: "right" }}>{memberships.yuva?.asOnMarch || "0"}</td>
                    <td style={{ textAlign: "right" }}>{memberships.yuva?.added || "0"}</td>
                    <td style={{ textAlign: "right" }}>{cumulativeYuva}</td>
                    <td style={{ textAlign: "right" }}>{formatRs(amountYuva, "Rs. 0")}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>Mahila Samiti</td>
                    <td style={{ textAlign: "right" }}>{memberships.mahila?.asOnMarch || "0"}</td>
                    <td style={{ textAlign: "right" }}>{memberships.mahila?.added || "0"}</td>
                    <td style={{ textAlign: "right" }}>{cumulativeMahila}</td>
                    <td style={{ textAlign: "right" }}>{formatRs(amountMahila, "Rs. 0")}</td>
                  </tr>
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ textAlign: "left" }}>TOTAL</td>
                    <td style={{ textAlign: "right" }}>{sectionATotals.asOnMarch || "0"}</td>
                    <td style={{ textAlign: "right" }}>{sectionATotals.added || "0"}</td>
                    <td style={{ textAlign: "right" }}>{sectionATotals.cumulative || "0"}</td>
                    <td style={{ textAlign: "right" }}>{formatRs(amountTotal, "Rs. 0")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* B | EXECUTIVE COMMITTEE MEETING DETAILS */}
            <div style={{ marginBottom: "6px" }}>
              <div className="cpr-heading">B | EXECUTIVE COMMITTEE MEETING DETAILS</div>
              {noMeetingHeld || meetings.length === 0 ? (
                <div style={{ fontSize: "9.5px", color: "#0f172a", fontWeight: "500", padding: "2px 0" }}>
                  No Executive Committee meeting was held this month. Reason: none
                </div>
              ) : (
                <table className="cpr-table">
                  <thead>
                    <tr>
                      <th style={{ width: "15%", textAlign: "left" }}>Date</th>
                      <th style={{ width: "25%", textAlign: "left" }}>Meeting Type</th>
                      <th style={{ width: "10%", textAlign: "center" }}>Members</th>
                      <th style={{ width: "10%", textAlign: "center" }}>Invited</th>
                      <th style={{ width: "10%", textAlign: "center" }}>Attended</th>
                      <th style={{ textAlign: "left" }}>Agenda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "left" }}>{m.date || "—"}</td>
                        <td style={{ textAlign: "left" }}>{m.type || "Executive Committee Meeting"}</td>
                        <td style={{ textAlign: "center" }}>{m.membersCount || "—"}</td>
                        <td style={{ textAlign: "center" }}>{m.invited || "—"}</td>
                        <td style={{ textAlign: "center" }}>{m.attended || "—"}</td>
                        <td style={{ textAlign: "left" }}>{m.agenda || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* C | OTS DETAILS & COLLECTION */}
            <div style={{ marginBottom: "6px" }}>
              <div className="cpr-heading">C | OTS DETAILS & COLLECTION</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4px" }}>
                <span className="cpr-subheading">OTS DETAILS</span>
                <table style={{ borderCollapse: "collapse", border: "1px solid #475569", width: "110px", textAlign: "center", fontSize: "8.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#ffffff" }}>
                      <th style={{ border: "1px solid #475569", padding: "3px 4px", fontWeight: "bold" }}>OTS PRP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #475569", padding: "3px 4px" }}>{otsPRP || "0"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="cpr-subheading" style={{ marginBottom: "2px" }}>OTS COLLECTION</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "42%", textAlign: "left" }}>
                      Particulars
                    </th>
                    <th style={{ width: "29%", textAlign: "right" }}>
                      During the Month
                    </th>
                    <th style={{ width: "29%", textAlign: "right" }}>
                      Till Date (up to {monthName || "August"} {startYear})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Total Number of OTS</td>
                    <td style={{ textAlign: "right" }}>{otsDuringCountNum}</td>
                    <td style={{ textAlign: "right" }}>{otsTillCountNum}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>OTS Amount (Rs.) @ Rs. 30,000 per OTS</td>
                    <td style={{ textAlign: "right" }}>{formatRs(otsDuringAmt, "Rs. 0")}</td>
                    <td style={{ textAlign: "right" }}>{formatRs(otsTillAmt, "Rs. 0")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* D | DONATION & CSR DETAILS */}
            <div style={{ marginBottom: "6px" }}>
              <div className="cpr-heading">D | DONATION & CSR DETAILS</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "25%", textAlign: "left" }}>Particulars</th>
                    <th style={{ width: "20%", textAlign: "center" }}>Number of Donors</th>
                    <th style={{ width: "27.5%", textAlign: "right" }}>Fund Received – This Month (Rs.)</th>
                    <th style={{ width: "27.5%", textAlign: "right" }}>Fund Received – Till Date (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Non-CSR</td>
                    <td style={{ textAlign: "center" }}>{donations.other?.donors || ""}</td>
                    <td style={{ textAlign: "right" }}>
                      {donations.other?.during ? formatRs(donations.other.during) : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {nonCsrTill ? formatRs(nonCsrTill) : "Rs. 0"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>CSR</td>
                    <td style={{ textAlign: "center" }}>{donations.csr?.donors || ""}</td>
                    <td style={{ textAlign: "right" }}>
                      {donations.csr?.during ? formatRs(donations.csr.during) : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {csrTill ? formatRs(csrTill) : "Rs. 0"}
                    </td>
                  </tr>
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ textAlign: "left" }}>Total</td>
                    <td style={{ textAlign: "center" }}></td>
                    <td style={{ textAlign: "right" }}>
                      {donationTotals.duringRaw ? formatRs(donationTotals.duringRaw) : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {totalDonationTill ? formatRs(totalDonationTill) : "Rs. 0"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Number of CSR Schools box directly underneath */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "3px", marginBottom: "3px" }}>
                <table style={{ borderCollapse: "collapse", border: "1px solid #475569", width: "140px", textAlign: "center", fontSize: "8.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#ffffff" }}>
                      <th style={{ border: "1px solid #475569", padding: "3px 4px", fontWeight: "bold" }}>
                        Number of CSR Schools
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #475569", padding: "3px 4px", fontWeight: "600" }}>
                        {csrSchoolsCount || "0"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* OTHER DONATION DETAIL */}
              <div className="cpr-subheading" style={{ marginBottom: "2px" }}>OTHER DONATION DETAIL</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "42%", textAlign: "left" }}>Particulars</th>
                    <th style={{ width: "29%", textAlign: "right" }}>This Month (Rs.)</th>
                    <th style={{ width: "29%", textAlign: "right" }}>Till Date (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>General Donation</td>
                    <td style={{ textAlign: "right" }}>
                      {donations.general?.during ? formatRs(donations.general.during) : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {donations.general?.till ? formatRs(donations.general.till) : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>Each One Teach One (EOTO)</td>
                    <td style={{ textAlign: "right" }}>
                      {donations.eoto?.during ? formatRs(donations.eoto.during) : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {donations.eoto?.till ? formatRs(donations.eoto.till) : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* E | COLLECTION BOXES */}
            <div style={{ marginBottom: "6px" }}>
              <div className="cpr-heading">E | COLLECTION BOXES</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "42%", textAlign: "left" }}>Particulars</th>
                    <th style={{ width: "29%", textAlign: "right" }}>This Month</th>
                    <th style={{ width: "29%", textAlign: "right" }}>Till Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Boxes Placed</td>
                    <td style={{ textAlign: "right" }}>{collectionBoxes.boxesThisMonth || ""}</td>
                    <td style={{ textAlign: "right" }}>{collectionBoxes.boxesTillDate || ""}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>Amount Collected (Rs.)</td>
                    <td style={{ textAlign: "right" }}>
                      {collectionBoxes.amountThisMonth ? formatRs(collectionBoxes.amountThisMonth) : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {collectionBoxes.amountTillDate ? formatRs(collectionBoxes.amountTillDate) : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* F | INVESTMENT (AS ON DATE) */}
            <div style={{ marginBottom: "6px" }}>
              <div className="cpr-heading">F | INVESTMENT (AS ON DATE)</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "50%", textAlign: "left" }}>Particulars</th>
                    <th style={{ width: "50%", textAlign: "right" }}>Amount Invested (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Fixed Deposit (FD)</td>
                    <td style={{ textAlign: "right" }}>
                      {investments.fd ? formatRs(investments.fd) : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>Mutual Fund</td>
                    <td style={{ textAlign: "right" }}>
                      {investments.mutualFund ? formatRs(investments.mutualFund) : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>Others (Please Specify)</td>
                    <td style={{ textAlign: "right" }}>
                      {investments.others ? formatRs(investments.others) : ""}
                    </td>
                  </tr>
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ textAlign: "left" }}>TOTAL</td>
                    <td style={{ textAlign: "right" }}>
                      {totalInvestment ? formatRs(totalInvestment) : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ======================== PAGE 2 ========================= */}
        {/* ========================================================= */}
        <div className="pdf-page">
          <div className="flex-1">
            {/* G | CASH & BANK BALANCE */}
            <div style={{ marginBottom: "8px" }}>
              <div className="cpr-heading">G | CASH & BANK BALANCE</div>
              <div style={{ fontSize: "9px", color: "#475569", marginBottom: "3px" }}>
                As on {monthName || "July"} {startYear}
              </div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "65%", textAlign: "left" }}>Particulars</th>
                    <th style={{ width: "35%", textAlign: "right" }}>Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Cash in Hand</td>
                    <td style={{ textAlign: "right" }}>{formatRs(cashInHand, "Rs. 0")}</td>
                  </tr>
                  {bankBalances.length === 0 ? (
                    <>
                      <tr>
                        <td style={{ textAlign: "left" }}>Bank: Bandhan Bank</td>
                        <td style={{ textAlign: "right" }}>Rs. 0</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "left" }}>Bank: ICICI Bank</td>
                        <td style={{ textAlign: "right" }}>Rs. 0</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "left" }}>Bank: Kotak Mahindra Bank</td>
                        <td style={{ textAlign: "right" }}>Rs. 0</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "left" }}>Bank: Standard Chartered Bank</td>
                        <td style={{ textAlign: "right" }}>Rs. 0</td>
                      </tr>
                    </>
                  ) : (
                    bankBalances.map((b, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "left" }}>Bank: {b.bankName || `Account #${idx + 1}`}</td>
                        <td style={{ textAlign: "right" }}>{formatRs(b.balance, "Rs. 0")}</td>
                      </tr>
                    ))
                  )}
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ textAlign: "left" }}>Total Bank Balance</td>
                    <td style={{ textAlign: "right" }}>{formatRs(totalBankBalance, "Rs. 0")}</td>
                  </tr>
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ textAlign: "left" }}>TOTAL CASH &amp; BANK BALANCE</td>
                    <td style={{ textAlign: "right" }}>{formatRs(totalCashAndBank, "Rs. 0")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* H | VAN YATRA */}
            <div style={{ marginBottom: "8px" }}>
              <div className="cpr-heading">H | VAN YATRA</div>
              <table className="cpr-table" style={{ marginBottom: "4px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "50%", textAlign: "left" }}>
                      Number of Vanyatra – This Month
                    </th>
                    <th style={{ width: "50%", textAlign: "left" }}>
                      Number of Vanyatra – Till Date (up to {monthName || "July"} {startYear})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>{vanyatrasCountThisMonth}</td>
                    <td style={{ textAlign: "left" }}>{vanyatrasCountTillDate}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: "9px", color: "#334155", fontStyle: "italic", padding: "2px 0" }}>
                {vanyatras.length === 0
                  ? "No Vanyatra this month."
                  : `${vanyatras.length} Vanyatra recorded.`}
              </div>
            </div>

            {/* I | EVENTS DURING THE MONTH */}
            <div style={{ marginBottom: "8px" }}>
              <div className="cpr-heading">I | EVENTS DURING THE MONTH</div>
              {events.length === 0 ? (
                <div style={{ fontSize: "9px", color: "#334155", fontStyle: "italic", padding: "2px 0" }}>
                  No events reported.
                </div>
              ) : (
                <div style={{ fontSize: "8.5px", color: "#0f172a", marginTop: "3px" }}>
                  {events.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      style={{
                        padding: "2px 0",
                        borderBottom: eIdx < events.length - 1 ? "1px dashed #cbd5e1" : "none",
                      }}
                    >
                      <strong>Event {eIdx + 1}:</strong>{" "}
                      {ev.name ? `${ev.name} — ` : ""}
                      {ev.date || "Date not set"}
                      {ev.time ? ` at ${ev.time}` : ""} |{" "}
                      {ev.eventFor || ev.committee || "Youth"} |{" "}
                      {ev.type || "Public Event"}
                      {ev.description ? (
                        <div style={{ color: "#475569", fontSize: "8px", marginLeft: "8px" }}>
                          {ev.description}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* J | ANNEXURE 1 – DISBURSEMENT TO ANCHAL */}
            <div style={{ marginBottom: "8px" }}>
              <div className="cpr-heading">J | ANNEXURE 1 – DISBURSEMENT TO ANCHAL</div>
              <table className="cpr-table" style={{ fontSize: "7.8px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "14%", textAlign: "left" }}>Funding<br />Anchal<br />Name</th>
                    <th style={{ width: "8.5%", textAlign: "center" }}>No. of<br />Acharyas<br />Paid this<br />Month</th>
                    <th style={{ width: "8.5%", textAlign: "center" }}>Up to<br />Which<br />Month<br />Paid</th>
                    <th style={{ width: "9%", textAlign: "center" }}>Report<br />When<br />Received</th>
                    <th style={{ width: "9%", textAlign: "center" }}>Remittance<br />Date</th>
                    <th style={{ width: "12%", textAlign: "right" }}>Total<br />Remittance<br />till Last<br />Date</th>
                    <th style={{ width: "11%", textAlign: "right" }}>Remittance<br />This Month</th>
                    <th style={{ width: "12%", textAlign: "left" }}>PRP: Anchal<br />Name</th>
                    <th style={{ width: "6%", textAlign: "center" }}>PRP: No.<br />of<br />Acharyas</th>
                    <th style={{ width: "10%", textAlign: "right" }}>PRP:<br />Amount<br />(Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {anchals.map((a, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "left", fontWeight: "600", textTransform: "uppercase", fontSize: "7.5px" }}>
                        {a.fundingAnchal || a.name || `Anchal ${idx + 1}`}
                      </td>
                      <td style={{ textAlign: "center" }}>{a.acharyasPaid || ""}</td>
                      <td style={{ textAlign: "center" }}>{a.upToMonthPaid || ""}</td>
                      <td style={{ textAlign: "center", fontSize: "7px" }}>{a.reportWhenReceived || ""}</td>
                      <td style={{ textAlign: "center", fontSize: "7px" }}>{a.remittanceDate || ""}</td>
                      <td style={{ textAlign: "right" }}>
                        {a.remittanceLastMonth ? formatRs(a.remittanceLastMonth) : ""}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {a.remittanceThisMonth ? formatRs(a.remittanceThisMonth) : ""}
                      </td>
                      <td style={{ textAlign: "left", fontWeight: "500", textTransform: "uppercase", fontSize: "7.5px" }}>
                        {a.name || a.fundingAnchal || "—"}
                      </td>
                      <td style={{ textAlign: "center" }}>{a.acharyasCount || ""}</td>
                      <td style={{ textAlign: "right" }}>
                        {a.annualTarget ? formatRs(a.annualTarget) : ""}
                      </td>
                    </tr>
                  ))}
                  {/* TOTAL ROW */}
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ textAlign: "left" }}>TOTAL</td>
                    <td style={{ textAlign: "center" }}>{totalAcharyasPaid}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: "right" }}>
                      {formatRs(totalRemittanceTillLast, "Rs. 0")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatRs(totalRemittanceThisMonth, "Rs. 0")}
                    </td>
                    <td></td>
                    <td style={{ textAlign: "center" }}>{totalPrpAcharyas || ""}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatRs(totalPrpAmount, "Rs. 0")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ======================== PAGE 3 ========================= */}
        {/* ========================================================= */}
        <div className="pdf-page">
          <div className="flex-1">
            {/* K | ANNEXURE 2 – MONTHLY SUMMARY / CHECK POINTS */}
            <div style={{ marginBottom: "8px" }}>
              <div className="cpr-heading">K | ANNEXURE 2 – MONTHLY SUMMARY / CHECK POINTS</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "45%", textAlign: "left" }}>Particulars</th>
                    <th style={{ width: "15%", textAlign: "center" }}>Yes / No</th>
                    <th style={{ width: "40%", textAlign: "left" }}>Reason / Remarks (if No)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", fontWeight: "500" }}>
                      Samagri reached to all schools
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>
                      {samagriReached || "Yes"}
                    </td>
                    <td style={{ textAlign: "left" }}>{samagriRemarks || ""}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Donor Board Details */}
            <div style={{ marginBottom: "12px" }}>
              <div className="cpr-subheading" style={{ marginBottom: "3px" }}>Donor Board Details</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "38%", textAlign: "left" }}>Particulars</th>
                    <th style={{ width: "15%", textAlign: "center" }}>Total Donor Boards</th>
                    <th style={{ width: "15%", textAlign: "center" }}>Already Sent</th>
                    <th style={{ width: "14%", textAlign: "center" }}>Pending</th>
                    <th style={{ width: "18%", textAlign: "left" }}>Reason / Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Non-CSR Donor Board reached to all schools</td>
                    <td style={{ textAlign: "center" }}>{donorBoard.nonCsr?.total || ""}</td>
                    <td style={{ textAlign: "center" }}>{donorBoard.nonCsr?.sent || ""}</td>
                    <td style={{ textAlign: "center" }}>
                      {donorBoard.nonCsr?.total && donorBoard.nonCsr?.sent
                        ? Number(donorBoard.nonCsr.total) - Number(donorBoard.nonCsr.sent)
                        : ""}
                    </td>
                    <td style={{ textAlign: "left" }}>{donorBoard.nonCsr?.remarks || ""}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>CSR Donor Board reached to all schools</td>
                    <td style={{ textAlign: "center" }}>{donorBoard.csr?.total || ""}</td>
                    <td style={{ textAlign: "center" }}>{donorBoard.csr?.sent || ""}</td>
                    <td style={{ textAlign: "center" }}>
                      {donorBoard.csr?.total && donorBoard.csr?.sent
                        ? Number(donorBoard.csr.total) - Number(donorBoard.csr.sent)
                        : ""}
                    </td>
                    <td style={{ textAlign: "left" }}>{donorBoard.csr?.remarks || ""}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left" }}>School Progress Report sent to CSR Donors</td>
                    <td style={{ textAlign: "center" }}></td>
                    <td style={{ textAlign: "center" }}>
                      {schoolProgressSent === "Yes" ? "Yes" : schoolProgressSent || ""}
                    </td>
                    <td style={{ textAlign: "center" }}></td>
                    <td style={{ textAlign: "left" }}>{progressRemarks || ""}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sub Chapters and Monitoring Anchal text */}
            <div style={{ fontSize: "9.5px", lineHeight: "1.6", margin: "14px 0", color: "#0f172a" }}>
              <div>
                <p style={{ fontWeight: "bold", margin: "0 0 2px 0" }}>Details of Sub Chapter</p>
                <p style={{ margin: "0 0 8px 0" }}>{subChapters.length > 0 ? subChapters.join(", ") : "None."}</p>
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Monitoring Anchal Name: </span>
                <span>{monitoringAnchalDisplay}</span>
              </div>
            </div>

            {/* Certification statement */}
            <div style={{ fontSize: "9.5px", color: "#0f172a", margin: "16px 0 10px 0" }}>
              We certify that the information given in this report is correct.
            </div>

            {/* Horizontal Line and Signatures Block */}
            <div style={{ marginTop: "10px" }}>
              <div style={{ borderTop: "1.5px solid #0f172a", margin: "0 0 12px 0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", fontSize: "9.5px", color: "#0f172a" }}>
                {/* Column 1: CPP */}
                <div>
                  <p style={{ fontWeight: "bold", margin: "0 0 2px 0" }}>Name of CPP</p>
                  <p style={{ margin: "0 0 14px 0", color: "#1e293b" }}>{cppName || "Suresh Kumar Dhanuka"}</p>
                  <p style={{ margin: "0", color: "#334155" }}>Signature &amp; Date</p>
                </div>

                {/* Column 2: Secretary */}
                <div>
                  <p style={{ fontWeight: "bold", margin: "0 0 2px 0" }}>Secretary</p>
                  <p style={{ margin: "0 0 14px 0", color: "#1e293b" }}>Name:</p>
                  <p style={{ margin: "0", color: "#334155" }}>Signature &amp; Date</p>
                </div>

                {/* Column 3: President */}
                <div>
                  <p style={{ fontWeight: "bold", margin: "0 0 2px 0" }}>President</p>
                  <p style={{ margin: "0 0 14px 0", color: "#1e293b" }}>Name:</p>
                  <p style={{ margin: "0", color: "#334155" }}>Signature &amp; Date</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Line on Page 3 */}
          <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "8px", fontSize: "8.5px", color: "#64748b" }}>
            Report ID: {formattedReportId} | Status: {csrStatus || "For signature by the President and Secretary"} | Generated: {generatedTimestamp}
          </div>
        </div>
      </div>
    );
  }
);

CPRPrintReport.displayName = "CPRPrintReport";

export default CPRPrintReport;
