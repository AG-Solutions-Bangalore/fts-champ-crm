import React, { useState } from "react";
import CPRReportList from "./cpr-report-list";
import CPRForm from "./cpr-form";

const CPRReportIndex = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [reportConfig, setReportConfig] = useState({
    month: "",
    year: "",
    reportId: null,
    isEdit: false,
    isView: false,
  });

  const handleStartOrCreate = (config) => {
    setReportConfig(config);
    setView("form");
  };

  const handleBackToList = () => {
    setView("list");
  };

  if (view === "form") {
    return (
      <CPRForm
        initialMonth={reportConfig.month}
        initialYear={reportConfig.year}
        reportId={reportConfig.reportId}
        isView={reportConfig.isView}
        isEdit={reportConfig.isEdit}
        onBack={handleBackToList}
      />
    );
  }

  return <CPRReportList onStartOrCreate={handleStartOrCreate} />;
};

export default CPRReportIndex;
