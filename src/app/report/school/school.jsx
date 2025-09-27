"use client";

import { RECEIPT_SUMMARY_DOWNLOAD, SUMMARY_SOURCE_DROPDOWN } from "@/api";
import { MemoizedSelect } from "@/components/common/memoized-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetMutation } from "@/hooks/use-get-mutation";
import { useApiMutation } from "@/hooks/use-mutation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, FileType, Loader, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import SchoolView from "./school-view";

function School() {
  const componentRef = useRef();
  const [downloadDonor, setDonorDownload] = useState({
    indicomp_full_name: "",
    receipt_from_date: "",
    receipt_to_date: "",
  });
  const [viewType, setViewType] = useState(false);

  const { trigger, loading } = useApiMutation();
  const { data: SourceData } = useGetMutation(
    "school-summary-dropdown",
    SUMMARY_SOURCE_DROPDOWN
  );

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    setDonorDownload({ ...downloadDonor, [field]: value });
    if (downloadDonor.indicomp_full_name) setViewType(true);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (downloadDonor.indicomp_full_name) setViewType(true);
  };

  const handlePrintPdf = useReactToPrint({
    content: () => {
      if (!downloadDonor.indicomp_full_name || !viewType) {
        toast.warning("Please select a source before printing!");
        return null;
      }
      return componentRef.current;
    },
    documentTitle: "School_Report",
    pageStyle: `
      @page { size: A4 portrait; margin: 5mm; }
      @media print {
        body { font-size: 10px; margin: 0; padding: 0; }
        table { font-size: 11px; }
        .print-hide { display: none; }
      }
    `,
  });

  const handleSavePDF = () => {
    if (!downloadDonor.indicomp_full_name || !viewType) {
      toast.warning("Please select a source before saving PDF.");
      return;
    }
    const input = componentRef.current;
    if (!input) return toast.warning("No data available to generate PDF.");

    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(
          pdfWidth / canvas.width,
          pdfHeight / canvas.height
        );

        pdf.addImage(
          imgData,
          "PNG",
          10,
          10,
          canvas.width * ratio,
          canvas.height * ratio
        );
        pdf.save("School_Summary.pdf");
      })
      .catch((err) => console.error(err));
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!downloadDonor.indicomp_full_name || !viewType)
      return toast.warning("Please select a source before downloading.");

    try {
      const payload = { indicomp_full_name: downloadDonor.indicomp_full_name };
      const res = await trigger({
        url: RECEIPT_SUMMARY_DOWNLOAD,
        method: "post",
        data: payload,
        responseType: "blob",
      });

      if (!res) return toast.warning("No data found for the selected source.");

      const blob = new Blob([res], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "school_summary.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("School Summary Downloaded Successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download School Summary.");
    }
  };

  return (
    <>
      <Card className="mt-4">
        <CardContent className="p-6">
          <form id="dowRecp" autoComplete="off" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="indicomp_full_name" required>
                  Source
                </Label>
                <MemoizedSelect
                  name="indicomp_full_name"
                  value={downloadDonor?.indicomp_full_name}
                  onChange={(e) => handleInputChange(e, "indicomp_full_name")}
                  options={
                    SourceData?.schoolallot?.map((item) => ({
                      label: item.indicomp_full_name,
                      value: item.id,
                    })) || []
                  }
                  placeholder="Select Source"
                />
              </div>

              <div className="flex gap-2 justify-start items-center">
                <Button type="button" onClick={handleClick}>
                  View
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!viewType}
                        onClick={handlePrintPdf}
                        className="transition-all duration-300 hover:scale-110 border border-[var(--color-border)] hover:shadow-md"
                      >
                        <Printer className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print PDF</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!viewType}
                        onClick={handleSavePDF}
                        className="transition-all duration-300 hover:scale-110 border border-[var(--color-border)] hover:shadow-md"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!viewType}
                        onClick={handleDownload}
                        className="transition-all duration-300 hover:scale-110 border border-[var(--color-border)] hover:shadow-md"
                      >
                        {loading ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <FileType className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download Excel</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      {viewType == true && (
        <div className="mt-4">
          <SchoolView
            indicompFullName={downloadDonor?.indicomp_full_name}
            componentRef={componentRef}
          />
        </div>
      )}
    </>
  );
}

export default School;
