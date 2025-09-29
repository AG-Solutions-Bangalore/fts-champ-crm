import { DB_DOCUMENT_VIEW_GROUP } from "@/api";
import ReportHeader from "@/components/common/report-header";
import { Card } from "@/components/ui/card";
import { useApiMutation } from "@/hooks/use-mutation";
import { useEffect, useState } from "react";

const DbStatementGroup = ({ receiptFromDate, receiptToDate, componentRef }) => {
  const [donorSummary, setDonorSummary] = useState();
  const { trigger } = useApiMutation();
  const fetchDonorSummary = async () => {
    if (!receiptFromDate || !receiptToDate) {
      toast.warning("Please select both From and To dates.");
      return;
    }

    try {
      const payload = {
        receipt_from_date: receiptFromDate,
        receipt_to_date: receiptToDate,
      };

      const res = await trigger({
        url: DB_DOCUMENT_VIEW_GROUP,
        method: "post",
        data: payload,
      });

      if (!res) {
        toast.warning("No data found for the selected donation.");
        return;
      }
      const donorSummary = res.receipt || [];
      setDonorSummary(donorSummary || []);
      console.log("Donor Summary:", donorSummary);
      return donorSummary;
    } catch (err) {
      console.error("Error fetching donor summary:", err);
      toast.error("Could not fetch dbstatement summary.");
    }
  };

  useEffect(() => {
    if (receiptFromDate && receiptToDate) {
      fetchDonorSummary();
    }
  }, [receiptFromDate, receiptToDate]);

  return (
    <>
      <div className="invoice-wrapper">
        <div className="flex flex-col items-center">
          <div className="w-full mx-auto">
            <Card className="p-6 overflow-x-auto grid md:grid-cols-1 1fr">
              {/* Table */}
              <div ref={componentRef}>
                <ReportHeader title="FORM No. 10BD" />
                <table className="min-w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-200">
                      {[
                        "Unique Identification Number of the donor	",
                        "ID code",
                        "Section code",
                        "Name of donor",
                        "Address of donor",
                        "Donation Type",
                        "Mode of receipt",
                        "Amount of donation (Indian rupees)",
                      ].map((header) => (
                        <th
                          key={header}
                          className="border border-black px-4 py-2 text-center text-xs"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {donorSummary?.map((dataSumm) => (
                      <tr key={dataSumm.id}>
                        <td className="border border-black px-4 py-2 text-xs">
                          {dataSumm.indicomp_pan_no}
                        </td>
                        <td className="border border-black px-4 py-2 text-xs">
                          1
                        </td>
                        <td className="border border-black px-4 py-2 text-xs">
                          Section 80G
                        </td>
                        <td className="border border-black px-4 py-2 text-xs">
                          {dataSumm.indicomp_type !== "Individual" && (
                            <>M/s {dataSumm.indicomp_full_name} </>
                          )}
                          {dataSumm.indicomp_type === "Individual" && (
                            <>
                              {dataSumm.title} {dataSumm.indicomp_full_name}
                            </>
                          )}
                        </td>

                        <td className="border border-black text-center text-xs">
                          {dataSumm.indicomp_corr_preffer == "Residence" && (
                            <>
                              {dataSumm.indicomp_res_reg_address}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_area}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_ladmark}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_city}
                              {" - "}
                              {dataSumm.indicomp_res_reg_pin_code}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_state}
                            </>
                          )}
                          {dataSumm.indicomp_corr_preffer == "Registered" && (
                            <>
                              {dataSumm.indicomp_res_reg_address}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_area}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_ladmark}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_city}
                              {" - "}
                              {dataSumm.indicomp_res_reg_pin_code}
                              {" ,"}
                              {dataSumm.indicomp_res_reg_state}
                            </>
                          )}{" "}
                          {dataSumm.indicomp_corr_preffer == "Office" && (
                            <>
                              {dataSumm.indicomp_off_branch_address}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_area}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_ladmark}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_city}
                              {" - "}
                              {dataSumm.indicomp_off_branch_pin_code}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_state}
                            </>
                          )}
                          {dataSumm.indicomp_corr_preffer ==
                            "Branch Office" && (
                            <>
                              {dataSumm.indicomp_off_branch_address}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_area}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_ladmark}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_city}
                              {" - "}
                              {dataSumm.indicomp_off_branch_pin_code}
                              {" ,"}
                              {dataSumm.indicomp_off_branch_state}
                            </>
                          )}
                        </td>
                        <td className="border border-black text-center text-xs">
                          {dataSumm.receipt_donation_type}
                        </td>
                        <td className="border border-black text-center text-xs">
                          {dataSumm.receipt_tran_pay_mode}
                        </td>
                        <td className="border border-black text-center text-xs">
                          {dataSumm.receipt_total_amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DbStatementGroup;
