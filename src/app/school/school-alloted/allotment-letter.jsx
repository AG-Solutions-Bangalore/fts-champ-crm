import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetMutation } from "@/hooks/use-get-mutation";
import { decryptId } from "@/utils/encyrption/encyrption";
import { Download, Loader2, Printer } from "lucide-react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { SCHOOL_ALLOT_LETTER } from "../../../api";
import Logo3 from "../../../assets/receipt/ekal.png";
import Logo1 from "../../../assets/receipt/fts.png";
import Logo2 from "../../../assets/receipt/top.png";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SchoolAllotLetter = () => {
  const componentRef = useRef();
  const { id } = useParams();
  const donorId = decryptId(id);
  const today = new Date().toLocaleDateString("en-GB");

  const {
    data: schoolLetter,
    isLoading,
    isError,
    refetch,
  } = useGetMutation(
    `schoolletter-${donorId}`,
    `${SCHOOL_ALLOT_LETTER}/${donorId}`
  );
  const handlePrintPdf = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Allotment_Letter",
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 15mm 10mm;  /* top-bottom 15mm, left-right 10mm */
      }
      @media print {
        body {
          font-size: 11px;
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-container {
          padding: 10mm 8mm; /* extra breathing space inside */
        }
        table {
          font-size: 10px;
        }
        .print-hide {
          display: none;
        }
      }
    `,
  });

  const handleSavePDF = () => {
    const input = componentRef.current;
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: -window.scrollY,
      height: input.scrollHeight,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = 210;
        const pdfHeight = 297;

        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight, "", "FAST");

        if (imgHeight > pdfHeight) {
          const totalPages = Math.ceil(imgHeight / pdfHeight);
          for (let page = 1; page < totalPages; page++) {
            pdf.addPage();
            pdf.addImage(
              imgData,
              "PNG",
              10,
              -page * pdfHeight + 10,
              imgWidth,
              imgHeight,
              "",
              "FAST"
            );
          }
        }

        pdf.save("Allotment-letter.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="w-full p-4  ">
        <div className="flex items-center justify-center h-64 ">
          <div className="text-center ">
            <div className="text-destructive font-medium mb-2">
              Error Fetching School List Data
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const SchoolAlotReceipt = schoolLetter?.SchoolAlotReceipt || {};
  const SchoolAlotView = schoolLetter?.SchoolAlotView || [];
  const OTSReceipts = schoolLetter?.OTSReceipts || [];

  return (
    <div className="invoice-wrapper overflow-x-auto grid md:grid-cols-1 1fr">
      <div className="flex flex-col items-center">
        {/* Floating Action Buttons */}
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="p-3 shadow-2xl border border-white/30 backdrop-blur-lg bg-white/80 rounded-2xl hover:bg-white/90 transition-all duration-300">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={handlePrintPdf}
                    >
                      <Printer className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Print Receipt</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={handleSavePDF}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Card>
        </div>

        {/* Letter Content */}
        <div className="sm:w-[90%] md:w-[90%] lg:w-[70%] mx-auto ">
          <div className="bg-white shadow-md rounded-lg px-16 pb-16 pt-6 ">
            <div ref={componentRef} className="print-container">
              <div className="flex justify-between items-center mb-4 ">
                <div className="invoice-logo">
                  <img src={Logo1} alt="session-logo" width="80" height="80" />
                </div>

                <div className="invoice-logo text-right">
                  <img src={Logo3} alt="session-logo" width="80" height="80" />
                </div>
              </div>

              <div>
                <label className="flex my-4 text-lg">Date: {today}</label>
                <label className="flex my-4 text-lg">To,</label>

                {Object.keys(SchoolAlotReceipt).length !== 0 && (
                  <div className="text-lg">
                    {SchoolAlotReceipt.individual_company.indicomp_type !==
                      "Individual" && (
                      <p>
                        {SchoolAlotReceipt.individual_company.title}{" "}
                        {
                          SchoolAlotReceipt.individual_company
                            .indicomp_full_name
                        }
                      </p>
                    )}
                    {SchoolAlotReceipt.individual_company.indicomp_type ===
                      "Individual" && (
                      <p>
                        {SchoolAlotReceipt.individual_company.title}{" "}
                        {
                          SchoolAlotReceipt.individual_company
                            .indicomp_full_name
                        }
                      </p>
                    )}
                    {SchoolAlotReceipt.individual_company.hasOwnProperty(
                      "indicomp_off_branch_address"
                    ) && (
                      <div className="text-lg">
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_off_branch_address
                          }
                        </p>
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_off_branch_area
                          }
                        </p>
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_off_branch_ladmark
                          }
                        </p>
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_off_branch_city
                          }{" "}
                          -{" "}
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_off_branch_pin_code
                          }
                          ,
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_off_branch_state
                          }
                        </p>
                      </div>
                    )}
                    {SchoolAlotReceipt.individual_company.hasOwnProperty(
                      "indicomp_res_reg_address"
                    ) && (
                      <div className="text-lg">
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_res_reg_address
                          }
                        </p>
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_res_reg_area
                          }
                        </p>
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_res_reg_ladmark
                          }
                        </p>
                        <p>
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_res_reg_city
                          }{" "}
                          -{" "}
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_res_reg_pin_code
                          }
                          ,
                          {
                            SchoolAlotReceipt.individual_company
                              .indicomp_res_reg_state
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <label className="flex my-4  text-lg">
                  {SchoolAlotReceipt?.individual_company?.indicomp_gender ===
                    "Female" && <>Respected Madam,</>}
                  {SchoolAlotReceipt?.individual_company?.indicomp_gender ===
                    "Male" && <>Respected Sir,</>}
                  {SchoolAlotReceipt?.individual_company?.indicomp_gender ==
                    null && <>Respected Sir,</>}
                </label>

                <div className="text-lg">
                  <div className=" mb-5 text-justify">
                    <label>
                      <b>
                        “Giving is not just about making donation, it’s about
                        making a difference”
                      </b>
                      <span>
                        {" "}
                        , we are able to bring about this difference only
                        because of the support of our kind donors. Your support
                        to FTS gives wings to the dreams of the little children
                        studying in Ekal Vidyalaya. We express our sincere
                        thanks and gratitude to you for adopting
                        <b>" One Teacher School " (OTS)</b> and thus helping us
                        in providing light of education to the weaker sections
                        of the society.
                      </span>
                    </label>
                  </div>
                  <div className="my-4 text-justify">
                    {" "}
                    <label>
                      Please find enclosed herewith details of the Ekal
                      Vidyalaya running with your assistance. You may also view
                      the details through our website: www.ekal.org. Please
                      click on <b>INSIGHTS</b> and enter your user ID{" "}
                      <b>
                        {SchoolAlotReceipt?.individual_company
                          ?.indicomp_fts_code || ""}
                      </b>{" "}
                      and Password{" "}
                      <b>
                        {SchoolAlotReceipt?.individual_company
                          ?.indicomp_password || ""}
                      </b>
                      .
                    </label>
                  </div>

                  <label className="flex my-4">
                    Please find enclosed herewith:
                  </label>

                  <label className="flex my-4">
                    • List of your adopted schools
                  </label>
                  <label className="flex my-4">
                    We hope to get your continued patronage for serving the
                    society.
                  </label>
                </div>
                <div className="text-lg">
                  <label className="flex my-4">Thanking you once again!!</label>
                  <label className="flex my-4">With Regards,</label>
                </div>
                <div className="my-2 mb-3 text-justify  text-lg">
                  <label className="flex my-4">Niraj Harodia</label>
                  <label className="flex my-4">(Secretary)</label>
                </div>
              </div>

              <div>
                <div className="invoice-logo">
                  <div className="flex justify-center">
                    <img
                      src={Logo2}
                      alt="session-logo"
                      width="300"
                      height="300"
                      className="mb-2"
                    />
                  </div>
                </div>
                <div className="text-center text-sm">
                  <label>
                    <small>
                      Head Office: Ekal Bhawan, 123/A, Harish Mukherjee Road,
                      Kolkata-26. Web: www.ftsindia.com Ph: 033 - 2454
                      4510/11/12/13 PAN: AAAAF0290L
                    </small>
                  </label>
                </div>
              </div>
              {/* page break from here  */}

              <div className="page-break">
                <div className="flex justify-between items-center mb-4  mt-12">
                  <div className="invoice-logo">
                    <img
                      src={Logo1}
                      alt="session-logo"
                      width="80"
                      height="80"
                    />
                  </div>

                  <div className="invoice-logo text-right">
                    <img
                      src={Logo3}
                      alt="session-logo"
                      width="80"
                      height="80"
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <label>
                      Donor Id : {SchoolAlotReceipt.indicomp_fts_id}
                    </label>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    {SchoolAlotReceipt?.individual_company?.indicomp_type !==
                      "Individual" && (
                      <label>
                        Donor Name :{" "}
                        {
                          SchoolAlotReceipt?.individual_company
                            ?.indicomp_full_name
                        }
                      </label>
                    )}

                    {SchoolAlotReceipt?.individual_company?.indicomp_type ===
                      "Individual" && (
                      <label>
                        Donor Name :{" "}
                        {
                          SchoolAlotReceipt?.individual_company
                            ?.indicomp_full_name
                        }
                      </label>
                    )}
                  </div>
                  <div>
                    <label>
                      No of Schools :
                      {OTSReceipts.map((otsreceipt, key) => (
                        <> {otsreceipt.receipt_no_of_ots}</>
                      ))}
                    </label>
                  </div>
                </div>
                <div className="my-5 overflow-x-auto mb-14">
                  <table className="min-w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-gray-200 ">
                        {[
                          "STATE",
                          "ANCHAL  CLUSTER",
                          "STATE",
                          "SUB CLUSTER",
                          "VILLAGE",
                          "TEACHER",
                          "BOYS",
                          "GIRLS  ",
                          "TOTAL",
                        ].map((header) => (
                          <th
                            key={header}
                            className="border border-black px-1 py-1 text-center text-[10px]"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(SchoolAlotView) &&
                        SchoolAlotView.map((dataSumm) => (
                          <tr key={dataSumm.id}>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.school_state}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.achal}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.cluster}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.sub_cluster}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.village}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.teacher}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.boys}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.girls}
                            </td>
                            <td className="border border-black px-2 py-2 text-xs">
                              {dataSumm.total}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="invoice-logo">
                    <div className="flex justify-center">
                      <img
                        src={Logo2}
                        alt="session-logo"
                        width="300"
                        height="300"
                        className="mb-4"
                      />
                    </div>
                  </div>
                  <div className="text-center text-sm">
                    <label>
                      <small>
                        Head Office: Ekal Bhawan, 123/A, Harish Mukherjee Road,
                        Kolkata-26. Web: www.ftsindia.com Ph: 033 - 2454
                        4510/11/12/13 PAN: AAAAF0290L
                      </small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAllotLetter;
