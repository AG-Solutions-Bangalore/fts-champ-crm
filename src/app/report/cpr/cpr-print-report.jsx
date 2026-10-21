import React, { forwardRef } from "react";
import Logo1 from "../../../assets/receipt/fts.png";
import Logo3 from "../../../assets/receipt/ekal.png";

const CPRPrintReport = forwardRef(
  (
    {
      chapterName,
      monthIndex,
      monthName,
      cppName,
      submissionDate,
      subChapters = [],
      memberships = { chapter: {}, yuva: {}, mahila: {} },
      sectionATotals = {},
      noMeetingHeld = false,
      meetings = [],
      otsPRP = "",
      otsCountDuringMonth = "",
      otsCountTillDate = "",
      otsAmountDuringMonth = 0,
      otsAmountTillDate = 0,
      donations = { general: {}, csr: {}, other: {} },
      donationTotals = {},
      collectionBoxes = {},
      investments = {},
      totalInvestment = "",
      cashInHand = "",
      bankBalances = [],
      totalBankBalance = "",
      totalCashAndBank = "",
      vanyatras = [],
      events = [],
      anchals = [],
      samagriReached = "No",
      samagriRemarks = "",
      donorBoard = { nonCsr: {}, csr: {} },
      schoolProgressSent = "No",
      progressRemarks = "",
      selectedMonitoringAnchal = "Choose",
      monitoringAnchalsList = [],
      signedFile = null,
      formatINR = (v) => v,
    },
    ref
  ) => {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const displaySubDate = submissionDate
      ? new Date(submissionDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : today;

    return (
      <div ref={ref} className="cpr-printable-root text-slate-900 bg-white font-sans">
        <style>{`
          .pdf-page {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm 12mm;
            box-sizing: border-box;
            background-color: #ffffff;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
          }
          .cpr-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .cpr-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            text-align: left;
          }
          .cpr-table td {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            color: #1e293b;
          }
          .cpr-table tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          .cpr-section-header {
            font-size: 11px;
            font-weight: 700;
            color: #1e3a8a;
            background-color: #e0e7ff;
            padding: 4px 8px;
            border-left: 4px solid #1d4ed8;
            margin-top: 8px;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        `}</style>

        {/* ================= PAGE 1 ================= */}
        <div className="pdf-page">
          <div className="flex-1 space-y-3">
            {/* Header with Logos */}
            <div className="flex items-center justify-between border-b-2 border-blue-900 pb-2">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src={Logo1} alt="FTS Logo" className="max-h-16 max-w-16 object-contain" />
              </div>
              <div className="text-center flex-1 px-4">
                <h1 className="text-lg font-black tracking-wider text-blue-900 leading-tight">
                  FRIENDS OF TRIBALS SOCIETY
                </h1>
                <h2 className="text-sm font-bold tracking-wide text-slate-800">
                  CHAPTER PERFORMANCE REPORT (CPR)
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">Financial Year: 2026-27</p>
              </div>
              <div className="w-16 h-16 flex items-center justify-center">
                <img src={Logo3} alt="Ekal Logo" className="max-h-16 max-w-16 object-contain" />
              </div>
            </div>

            {/* Top Report Info Grid */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded p-2 text-[10px]">
              <div>
                <span className="text-slate-500 block font-semibold">Chapter Name:</span>
                <span className="font-bold text-blue-950 text-xs">{chapterName || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Report Month:</span>
                <span className="font-bold text-slate-900 text-xs">
                  {monthName ? `${monthName} (No. ${monthIndex || "—"})` : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">CPP Name:</span>
                <span className="font-bold text-slate-900 text-xs">{cppName || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Submission Date:</span>
                <span className="font-bold text-slate-900 text-xs">{displaySubDate}</span>
              </div>
              {subChapters.length > 0 && (
                <div className="col-span-4 border-t border-slate-200 pt-1 mt-1">
                  <span className="text-slate-500 font-semibold mr-1">Sub Chapters:</span>
                  <span className="font-medium text-slate-700">{subChapters.join(", ")}</span>
                </div>
              )}
            </div>

            {/* SECTION A: MEMBERSHIP INFORMATION */}
            <div>
              <div className="cpr-section-header">1. Membership Information (Section A)</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-center">As on 31 March 2026</th>
                    <th className="text-center">Added During Month</th>
                    <th className="text-center">Cumulative Till Date</th>
                    <th className="text-right">Amount Received (@ ₹1,000)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">Chapter</td>
                    <td className="text-center">{memberships.chapter?.asOnMarch || "0"}</td>
                    <td className="text-center">{memberships.chapter?.added || "0"}</td>
                    <td className="text-center">{memberships.chapter?.added || "0"}</td>
                    <td className="text-right">
                      {memberships.chapter?.added
                        ? formatINR(Number(memberships.chapter.added) * 1000)
                        : "₹0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">FTS Yuva</td>
                    <td className="text-center">{memberships.yuva?.asOnMarch || "0"}</td>
                    <td className="text-center">{memberships.yuva?.added || "0"}</td>
                    <td className="text-center">{memberships.yuva?.added || "0"}</td>
                    <td className="text-right">
                      {memberships.yuva?.added
                        ? formatINR(Number(memberships.yuva.added) * 1000)
                        : "₹0"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Mahila Samiti</td>
                    <td className="text-center">{memberships.mahila?.asOnMarch || "0"}</td>
                    <td className="text-center">{memberships.mahila?.added || "0"}</td>
                    <td className="text-center">{memberships.mahila?.added || "0"}</td>
                    <td className="text-right">
                      {memberships.mahila?.added
                        ? formatINR(Number(memberships.mahila.added) * 1000)
                        : "₹0"}
                    </td>
                  </tr>
                  <tr className="bg-blue-50/70 font-bold">
                    <td>Total</td>
                    <td className="text-center">{sectionATotals.asOnMarch || "0"}</td>
                    <td className="text-center">{sectionATotals.added || "0"}</td>
                    <td className="text-center">{sectionATotals.cumulative || "0"}</td>
                    <td className="text-right text-blue-900">{sectionATotals.amount || "₹0"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION B: EXECUTIVE COMMITTEE MEETINGS */}
            <div>
              <div className="cpr-section-header">2. Executive Committee Meetings (Section B)</div>
              {noMeetingHeld ? (
                <div className="p-2 border border-amber-200 bg-amber-50 text-amber-900 text-[10px] rounded italic">
                  No Executive Committee Meeting Held During the Month
                </div>
              ) : meetings.length === 0 ? (
                <div className="p-2 border border-slate-200 bg-slate-50 text-slate-500 text-[10px] rounded">
                  No meetings recorded for this month.
                </div>
              ) : (
                <table className="cpr-table">
                  <thead>
                    <tr>
                      <th style={{ width: "14%" }}>Date</th>
                      <th style={{ width: "24%" }}>Type</th>
                      <th className="text-center" style={{ width: "10%" }}>Total EC</th>
                      <th className="text-center" style={{ width: "10%" }}>Invited</th>
                      <th className="text-center" style={{ width: "10%" }}>Attended</th>
                      <th>Agenda / Points Discussed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((m, idx) => (
                      <tr key={idx}>
                        <td>{m.date || "—"}</td>
                        <td className="font-medium">{m.type || "Executive Committee Meeting"}</td>
                        <td className="text-center">{m.membersCount || "—"}</td>
                        <td className="text-center">{m.invited || "—"}</td>
                        <td className="text-center">{m.attended || "—"}</td>
                        <td className="text-[9px]">{m.agenda || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SECTION C: OTS COLLECTION */}
            <div>
              <div className="cpr-section-header">3. One Teacher School (OTS) Collection (Section C)</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th>PRP of This Year</th>
                    <th className="text-center">OTS Count (This Month)</th>
                    <th className="text-center">OTS Count (Till Date)</th>
                    <th className="text-right">Amount (This Month @ ₹30k)</th>
                    <th className="text-right">Total Amount (Till Date)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-blue-900">{otsPRP ? formatINR(otsPRP) : "₹0"}</td>
                    <td className="text-center font-bold">{otsCountDuringMonth || "0"}</td>
                    <td className="text-center font-bold">{otsCountTillDate || "0"}</td>
                    <td className="text-right font-semibold text-emerald-800">
                      {otsAmountDuringMonth ? formatINR(otsAmountDuringMonth) : "₹0"}
                    </td>
                    <td className="text-right font-bold text-emerald-900">
                      {otsAmountTillDate ? formatINR(otsAmountTillDate) : "₹0"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION D: DONATION & CSR DETAILS */}
            <div>
              <div className="cpr-section-header">4. Donation & CSR Details (Section D)</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th>Donation Category</th>
                    <th className="text-right">Collected During Month</th>
                    <th className="text-right">Total Collected Till Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>General Donation</td>
                    <td className="text-right">
                      {donations.general?.during ? formatINR(donations.general.during) : "₹0"}
                    </td>
                    <td className="text-right">
                      {donations.general?.till ? formatINR(donations.general.till) : "₹0"}
                    </td>
                  </tr>
                  <tr>
                    <td>CSR Donation</td>
                    <td className="text-right">
                      {donations.csr?.during ? formatINR(donations.csr.during) : "₹0"}
                    </td>
                    <td className="text-right">
                      {donations.csr?.till ? formatINR(donations.csr.till) : "₹0"}
                    </td>
                  </tr>
                  <tr>
                    <td>Other Collections</td>
                    <td className="text-right">
                      {donations.other?.during ? formatINR(donations.other.during) : "₹0"}
                    </td>
                    <td className="text-right">
                      {donations.other?.till ? formatINR(donations.other.till) : "₹0"}
                    </td>
                  </tr>
                  <tr className="bg-blue-50/70 font-bold">
                    <td>Total Donation & CSR</td>
                    <td className="text-right text-blue-900">{donationTotals.during || "₹0"}</td>
                    <td className="text-right text-blue-900">{donationTotals.till || "₹0"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-500 flex justify-between">
            <span>Friends of Tribals Society • Chapter Performance Report</span>
            <span>Page 1 of 3</span>
          </div>
        </div>

        {/* ================= PAGE 2 ================= */}
        <div className="pdf-page">
          <div className="flex-1 space-y-3">
            {/* Page 2 Mini Header */}
            <div className="flex justify-between items-center border-b border-blue-900 pb-1">
              <span className="font-bold text-xs text-blue-900">
                FRIENDS OF TRIBALS SOCIETY • CHAPTER PERFORMANCE REPORT
              </span>
              <span className="text-[10px] text-slate-600">
                Chapter: <strong>{chapterName || "—"}</strong> | Month: <strong>{monthName || "—"}</strong>
              </span>
            </div>

            {/* SECTION E: COLLECTION BOXES */}
            <div>
              <div className="cpr-section-header">5. Collection Boxes (Section E)</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th className="text-center">Boxes Placed (This Month)</th>
                    <th className="text-center">Boxes Placed (Till Date)</th>
                    <th className="text-right">Amount Collected (This Month)</th>
                    <th className="text-right">Amount Collected (Till Date)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center font-semibold">{collectionBoxes.boxesThisMonth || "0"}</td>
                    <td className="text-center font-semibold">{collectionBoxes.boxesTillDate || "0"}</td>
                    <td className="text-right">
                      {collectionBoxes.amountThisMonth ? formatINR(collectionBoxes.amountThisMonth) : "₹0"}
                    </td>
                    <td className="text-right font-semibold text-emerald-800">
                      {collectionBoxes.amountTillDate ? formatINR(collectionBoxes.amountTillDate) : "₹0"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION F: INVESTMENT (AS ON DATE) */}
            <div>
              <div className="cpr-section-header">6. Investment (As on Date) (Section F)</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th>Fixed Deposits (FD)</th>
                    <th>Mutual Funds</th>
                    <th>Others {investments.othersSpecify ? `(${investments.othersSpecify})` : ""}</th>
                    <th className="text-right">Total Investment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{investments.fd ? formatINR(investments.fd) : "₹0"}</td>
                    <td>{investments.mutualFund ? formatINR(investments.mutualFund) : "₹0"}</td>
                    <td>{investments.others ? formatINR(investments.others) : "₹0"}</td>
                    <td className="text-right font-bold text-blue-900">{totalInvestment || "₹0"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION G: CASH & BANK BALANCE */}
            <div>
              <div className="cpr-section-header">7. Cash & Bank Balance (Section G)</div>
              <div className="mb-1 text-[10px]">
                <span className="font-semibold text-slate-700">Cash in Hand: </span>
                <span className="font-bold text-slate-900">{cashInHand ? formatINR(cashInHand) : "₹0"}</span>
              </div>
              {bankBalances.length === 0 ? (
                <div className="p-2 border border-slate-200 bg-slate-50 text-slate-500 text-[10px] rounded">
                  No bank balance accounts listed.
                </div>
              ) : (
                <table className="cpr-table">
                  <thead>
                    <tr>
                      <th>Bank Name</th>
                      <th>Branch</th>
                      <th>Account Number</th>
                      <th className="text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankBalances.map((b, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{b.bankName || "—"}</td>
                        <td>{b.branch || "—"}</td>
                        <td>{b.accountNo || "—"}</td>
                        <td className="text-right font-semibold">{b.balance ? formatINR(b.balance) : "₹0"}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/70 font-bold">
                      <td colSpan={3}>Total Bank Balance</td>
                      <td className="text-right text-blue-900">{totalBankBalance || "₹0"}</td>
                    </tr>
                    <tr className="bg-blue-100 font-bold">
                      <td colSpan={3}>Total Cash & Bank Balance</td>
                      <td className="text-right text-blue-950">{totalCashAndBank || "₹0"}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* SECTION H: VAN YATRA */}
            <div>
              <div className="cpr-section-header">8. Van Yatra (Section H)</div>
              {vanyatras.length === 0 ? (
                <div className="p-2 border border-slate-200 bg-slate-50 text-slate-500 text-[10px] rounded">
                  No Van Yatra recorded for this month.
                </div>
              ) : (
                <table className="cpr-table">
                  <thead>
                    <tr>
                      <th style={{ width: "15%" }}>Date</th>
                      <th className="text-center" style={{ width: "12%" }}>No. of Yatris</th>
                      <th style={{ width: "28%" }}>Vidyalayas Visited</th>
                      <th className="text-center" style={{ width: "15%" }}>Pravas Done</th>
                      <th>Remarks / Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vanyatras.map((v, idx) => (
                      <tr key={idx}>
                        <td>{v.date || "—"}</td>
                        <td className="text-center font-semibold">{v.yatrisCount || "—"}</td>
                        <td>{v.vidyalayasVisited || "—"}</td>
                        <td className="text-center">{v.pravasDone || "No"}</td>
                        <td className="text-[9px]">{v.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SECTION I: EVENTS DURING THE MONTH */}
            <div>
              <div className="cpr-section-header">9. Events During the Month (Section I)</div>
              {events.length === 0 ? (
                <div className="p-2 border border-slate-200 bg-slate-50 text-slate-500 text-[10px] rounded">
                  No events recorded for this month.
                </div>
              ) : (
                <table className="cpr-table">
                  <thead>
                    <tr>
                      <th style={{ width: "18%" }}>Date</th>
                      <th style={{ width: "40%" }}>Event Name / Type</th>
                      <th style={{ width: "27%" }}>Committee</th>
                      <th className="text-center" style={{ width: "15%" }}>Photos Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.date || "—"}</td>
                        <td className="font-semibold text-slate-800">{e.type || "—"}</td>
                        <td>{e.committee || "—"}</td>
                        <td className="text-center">{e.photos || "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-500 flex justify-between">
            <span>Friends of Tribals Society • Chapter Performance Report</span>
            <span>Page 2 of 3</span>
          </div>
        </div>

        {/* ================= PAGE 3 ================= */}
        <div className="pdf-page">
          <div className="flex-1 space-y-3">
            {/* Page 3 Mini Header */}
            <div className="flex justify-between items-center border-b border-blue-900 pb-1">
              <span className="font-bold text-xs text-blue-900">
                FRIENDS OF TRIBALS SOCIETY • CPR ANNEXURES & SIGNATURES
              </span>
              <span className="text-[10px] text-slate-600">
                Chapter: <strong>{chapterName || "—"}</strong> | Month: <strong>{monthName || "—"}</strong>
              </span>
            </div>

            {/* SECTION J: ANNEXURE 1 – DISBURSEMENT TO ANCHAL */}
            <div>
              <div className="cpr-section-header">10. Annexure 1 – Disbursement to Anchal (Section J)</div>
              {anchals.length === 0 ? (
                <div className="p-2 border border-slate-200 bg-slate-50 text-slate-500 text-[10px] rounded">
                  No Anchal disbursements recorded.
                </div>
              ) : (
                <table className="cpr-table">
                  <thead>
                    <tr>
                      <th>Anchal Name</th>
                      <th className="text-center">Acharyas Paid</th>
                      <th className="text-right">Annual Target</th>
                      <th className="text-right">Remittance Last Month</th>
                      <th className="text-right">Remittance This Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anchals.map((a, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{a.name || "—"}</td>
                        <td className="text-center">{a.acharyasCount || "—"}</td>
                        <td className="text-right">{a.annualTarget ? formatINR(a.annualTarget) : "₹0"}</td>
                        <td className="text-right">{a.remittanceLastMonth ? formatINR(a.remittanceLastMonth) : "₹0"}</td>
                        <td className="text-right font-bold text-blue-900">
                          {a.remittanceThisMonth ? formatINR(a.remittanceThisMonth) : "₹0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SECTION K: ANNEXURE 2 – MONTHLY SUMMARY / CHECK POINTS */}
            <div>
              <div className="cpr-section-header">11. Annexure 2 – Monthly Summary / Check Points (Section K)</div>
              <table className="cpr-table">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Checkpoint Item</th>
                    <th style={{ width: "15%" }} className="text-center">Status</th>
                    <th>Details / Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">Monthly Samagri Reached Anchal</td>
                    <td className="text-center font-bold">
                      <span className={samagriReached === "Yes" ? "text-emerald-700" : "text-amber-700"}>
                        {samagriReached}
                      </span>
                    </td>
                    <td>{samagriRemarks || "—"}</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Donor Board Status (Non-CSR)</td>
                    <td className="text-center">
                      Sent: <strong>{donorBoard.nonCsr?.sent || "0"}</strong> / {donorBoard.nonCsr?.total || "0"}
                    </td>
                    <td>{donorBoard.nonCsr?.remarks || "—"}</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Donor Board Status (CSR)</td>
                    <td className="text-center">
                      Sent: <strong>{donorBoard.csr?.sent || "0"}</strong> / {donorBoard.csr?.total || "0"}
                    </td>
                    <td>{donorBoard.csr?.remarks || "—"}</td>
                  </tr>
                  <tr>
                    <td className="font-medium">School Progress Reports Sent</td>
                    <td className="text-center font-bold">
                      <span className={schoolProgressSent === "Yes" ? "text-emerald-700" : "text-amber-700"}>
                        {schoolProgressSent}
                      </span>
                    </td>
                    <td>{progressRemarks || "—"}</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Anchal Monitoring Status</td>
                    <td className="text-center font-semibold text-blue-900">
                      {selectedMonitoringAnchal || "—"}
                    </td>
                    <td>
                      {monitoringAnchalsList.length > 0
                        ? `Monitoring Anchals: ${monitoringAnchalsList.join(", ")}`
                        : "No specific monitoring anchals added"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* VERIFICATION & OFFICIAL SIGNATURE BLOCK */}
            <div className="mt-4 pt-3 border-t-2 border-slate-300">
              <div className="text-[11px] font-bold uppercase text-slate-800 mb-2">
                12. Chapter Verification & Signatures
              </div>
              <div className="bg-slate-50 border border-slate-300 rounded p-3 space-y-4">
                <div className="text-[10px] text-slate-600 flex justify-between items-center">
                  <span>
                    Report Submission Status: <strong className="text-emerald-700">SUBMITTED & VERIFIED</strong>
                  </span>
                  <span>
                    Date of Generation: <strong>{today}</strong>
                  </span>
                </div>

                {signedFile && (
                  <div className="p-2 border border-emerald-300 bg-emerald-50 rounded text-[10px] text-emerald-900 flex items-center justify-between">
                    <span>
                      ✓ Signed Copy Uploaded: <strong>{signedFile.name}</strong>
                    </span>
                    <span>Verified</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-6 pt-6">
                  {/* President */}
                  <div className="text-center border-t border-slate-400 pt-1">
                    <p className="font-bold text-xs text-slate-900">Chapter President</p>
                    <p className="text-[9px] text-slate-500">Signature & Date</p>
                  </div>

                  {/* Secretary */}
                  <div className="text-center border-t border-slate-400 pt-1">
                    <p className="font-bold text-xs text-slate-900">Chapter Secretary</p>
                    <p className="text-[9px] text-slate-500">Signature & Date</p>
                  </div>

                  {/* CPP / Treasurer */}
                  <div className="text-center border-t border-slate-400 pt-1">
                    <p className="font-bold text-xs text-slate-900">CPP / Treasurer</p>
                    <p className="text-[9px] text-slate-700 font-semibold">{cppName || "—"}</p>
                    <p className="text-[9px] text-slate-500">Signature & Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 3 Footer */}
          <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-500 flex justify-between">
            <span>Friends of Tribals Society • Chapter Performance Report</span>
            <span>Page 3 of 3</span>
          </div>
        </div>
      </div>
    );
  }
);

CPRPrintReport.displayName = "CPRPrintReport";

export default CPRPrintReport;
