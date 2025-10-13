import axios from "axios";
import Moment from "moment";
import { useEffect } from "react";

import ReportHeader from "@/components/common/report-header";
import { Card } from "@/components/ui/card";
import {
  DONOR_SUMMARY_GROUP_DOWNLOAD,
  DONOR_SUMMARY_GROUP_VIEW,
} from "../../../api";
import { useGetMutation } from "@/hooks/use-get-mutation";

const DonorGroupView = ({
  receiptFromDate,
  receiptToDate,
  indicompFullName,
  componentRef,
}) => {
  const {
    data,
    isLoading: loader,
    isError,
    refetch,
  } = useGetMutation(
    `donor-summary-group${indicompFullName}`,
    `${DONOR_SUMMARY_GROUP_VIEW}/${indicompFullName}?${receiptFromDate}&${receiptToDate}`,
    {},
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (indicompFullName && receiptFromDate && receiptToDate) {
      refetch();
    }
  }, [indicompFullName, receiptFromDate, receiptToDate]);

  const donorsummary = data?.data?.receipt || [];
  console.log(donorsummary, "donorsummary");
  const individual = data?.data?.individual_Company || [];
  const receiptsummary = data?.data?.receipt_total || [];
  const receiptsummaryfooterOTS = data?.data?.receipt_grand_total_ots || [];
  const receiptsummaryfootertotal =
    data?.data?.receipt_grand_total_amount || [];

  return (
    <>
      {!loader && isError && (
        <div className="text-red-600 text-center">
          Error fetching donor summary. Please try again.
        </div>
      )}
      {!isError && (
        <div className="invoice-wrapper">
          <div className="flex flex-col items-center ">
            <div className="w-full mx-auto ">
              <Card className="p-6 overflow-x-auto  grid md:grid-cols-1 1fr">
                <div ref={componentRef}>
                  <ReportHeader title="DONOR GROUP SUMMARY" />
                  {individual.map((individ, key) => (
                    <div className="flex  justify-between mb-6" key={key}>
                      <div className="mb-4 md:mb-0">
                        <p className="font-bold mb-1">
                          Full Name:{" "}
                          <span className="font-normal">
                            {individ.indicomp_type === "Individual" ? (
                              <>
                                {individ.title} {individ.indicomp_full_name}
                              </>
                            ) : (
                              <>M/s {individ.indicomp_full_name}</>
                            )}
                          </span>
                        </p>
                        <p className="font-bold mb-1">
                          Contact Person/Spouse:{" "}
                          <span className="font-normal">
                            {individ.indicomp_type === "Individual" ? (
                              <>{individ.indicomp_spouse_name}</>
                            ) : (
                              <>
                                {individ.title}{" "}
                                {individ.indicomp_com_contact_name}
                              </>
                            )}
                          </span>
                        </p>
                        <p className="font-bold mb-1">
                          Promoter:{" "}
                          <span className="font-normal">
                            {individ.indicomp_promoter}
                          </span>
                        </p>
                      </div>

                      {/* Right Section */}
                      <div>
                        <p className="font-bold mb-1">
                          Mobile:{" "}
                          <span className="font-normal">
                            {individ.indicomp_mobile_phone}
                          </span>
                        </p>
                        <p className="font-bold mb-1">
                          PAN Number:{" "}
                          <span className="font-normal">
                            {individ.indicomp_pan_no}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}

                  <div ref={componentRef} className="my-5">
                    <table className="min-w-full border-collapse border border-black">
                      <thead>
                        <tr className="bg-gray-200">
                          {[
                            "Receipt Date",
                            "Receipt No",
                            "Donor",
                            "Promoter",
                            "Year",
                            "Amount",
                            "Exemption Type",
                            "Donation Type",
                            "No of OTS",
                            "Pay Mode",
                            "Pay Details",
                            "Realization Date",
                            "Reason",
                            "Remarks",
                          ].map((header) => (
                            <th
                              key={header}
                              className="border border-black px-2 py-2 text-center text-xs"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {donorsummary && donorsummary.length > 0 ? (
                          donorsummary.map((dataSumm) => (
                            <tr key={dataSumm.id}>
                              <td className="border border-black px-4 py-2 text-xs">
                                {Moment(dataSumm.receipt_date).format(
                                  "DD-MM-YYYY"
                                )}
                              </td>
                              <td className="border border-black px-4 py-2 text-xs">
                                {dataSumm.receipt_no}
                              </td>
                              <td className="border border-black px-4 py-2 text-xs">
                                {dataSumm.indicomp_full_name}
                              </td>
                              <td className="border border-black px-4 py-2 text-xs">
                                {dataSumm.indicomp_promoter}
                              </td>
                              <td className="border border-black px-4 py-2 text-xs">
                                {dataSumm.receipt_financial_year}
                              </td>
                              <td className="border border-black px-4 py-2 text-xs">
                                {dataSumm.receipt_total_amount}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_exemption_type}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_donation_type}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_no_of_ots}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_tran_pay_mode}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_tran_pay_details}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_realization_date != null
                                  ? Moment(
                                      dataSumm.receipt_realization_date
                                    ).format("DD-MM-YYYY")
                                  : "-"}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_reason}
                              </td>
                              <td className="border border-black text-center text-xs">
                                {dataSumm.receipt_remarks}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={14} className="text-center py-4">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {donorsummary.length > 0 && (
                        <tfoot>
                          <tr>
                            <td
                              colSpan={5}
                              className="border border-black text-center font-bold text-sm p-2"
                            >
                              Total
                            </td>
                            {receiptsummaryfootertotal.map((footv, key) => (
                              <td className="border border-black text-center text-sm p-2 font-bold">
                                {footv.total_grand_amount}
                              </td>
                            ))}

                            <td
                              className="border border-black text-right px-4 text-sm p-2 md:text-base font-bold"
                              colSpan={2}
                            ></td>

                            {receiptsummaryfooterOTS.map((footv, key) => (
                              <td className="border border-black text-center text-xs font-bold">
                                {footv.total_no_of_ots}
                              </td>
                            ))}

                            <td
                              className="border border-black text-right px-4 text-xs font-bold"
                              colSpan={5}
                            ></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                  <div className="flex justify-center items-center  ">
                    <b className="text-xl text-[#464D69]">TOTAL</b>
                  </div>

                  <div ref={componentRef} className="my-5">
                    <table className="min-w-full border-collapse border border-black">
                      <thead>
                        <tr className="bg-gray-200">
                          {["Year", "Total Amount"].map((header) => (
                            <th
                              key={header}
                              className="border border-black px-4 py-2 text-center text-sm md:text-base"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {receiptsummary && receiptsummary.length > 0 ? (
                          receiptsummary.map((dataSumm) => (
                            <tr key={dataSumm.id}>
                              <td className="border border-black px-4 py-2 text-sm md:text-base text-center">
                                {dataSumm.receipt_financial_year}
                              </td>
                              <td className="border border-black px-4 py-2 text-sm md:text-base text-center">
                                {dataSumm.receipt_total_amount}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={2}
                              className="border border-black text-center py-4 text-sm md:text-base"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonorGroupView;
