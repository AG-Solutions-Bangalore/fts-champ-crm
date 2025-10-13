import { RECEIPT_SUMMARY_VIEW } from "@/api";
import ReportHeader from "@/components/common/report-header";
import { Card } from "@/components/ui/card";
import { useGetMutation } from "@/hooks/use-get-mutation";
import { useEffect } from "react";
import { NumericFormat } from "react-number-format";

const RecepitView = ({ componentRef, receiptFromDate, receiptToDate }) => {
  const {
    data,
    isLoading: loader,
    isError: error,
    refetch,
  } = useGetMutation(
    "recepit-summary-view",
    `${RECEIPT_SUMMARY_VIEW}?${receiptFromDate}&${receiptToDate}`,
    {},
    { enabled: false }
  );

  useEffect(() => {
    if (receiptFromDate && receiptToDate) {
      refetch();
    }
  }, [receiptFromDate, receiptToDate]);
  const donorsummary = data?.receipt || [];
  const receiptsummary = data?.data?.receiptTotal || [];
  const grandots = data?.data?.receipt_grand_total_ots || [];
  const totalsummarygeneral = data?.data?.recveiptTotalGeneral || [];
  const receiptsummaryfootertotal =
    data?.data?.receipt_grand_total_amount || [];
  const grandtotal = data?.data?.receipt_grand_total_count || [];
  const receiptTotalMembership = data?.data?.receiptTotalMembership || [];
  const receiptTotalOTS = data?.data?.receiptTotalOTS || [];
  return (
    <>
      {!loader && error && (
        <div className="text-red-600 text-center">{error}</div>
      )}
      {!loader && !error && (
        <div className="invoice-wrapper">
          <div className="flex flex-col items-center">
            <div className="w-full mx-auto ">
              <Card className="p-6 overflow-x-auto grid md:grid-cols-1 1fr">
                <div ref={componentRef} className="my-5">
                  <ReportHeader title="RECEPIT SUMMARY" />

                  <table className="min-w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-gray-200">
                        {[
                          "Month",
                          "Recepit Type",
                          "NO of Recpits",
                          "No of OTS",
                          "Amount",
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
                      {donorsummary.length > 0 ? (
                        donorsummary.map((dataSumm) => (
                          <tr key={dataSumm.id}>
                            <td className="border border-black px-4 py-2 text-xs">
                              {dataSumm.month_year}
                            </td>
                            <td className="border border-black px-4 py-2 text-xs">
                              {dataSumm.receipt_donation_type}
                            </td>
                            <td className="border border-black px-4 py-2 text-xs">
                              {dataSumm.total_count}
                            </td>
                            <td className="border border-black px-4 py-2 text-xs">
                              {dataSumm.total_ots}
                            </td>
                            <td className="border border-black text-right px-4 text-xs">
                              <NumericFormat
                                value={dataSumm.total_amount}
                                displayType={"text"}
                                thousandSeparator={true}
                                thousandsGroupStyle="lakh"
                                prefix={"₹"}
                                decimalScale={0}
                                fixedDecimalScale={true}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="border border-black text-center py-4"
                          >
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {donorsummary.length > 0 && (
                      <tfoot>
                        <tr>
                          <td
                            colSpan={2}
                            className="border border-black text-center font-bold text-xs"
                          >
                            Total
                          </td>
                          {grandtotal?.map((grandcount, key) => (
                            <td
                              key={key}
                              className="border border-black px-4 py-2 text-xs font-bold"
                            >
                              {grandcount.total_grand_count}
                            </td>
                          ))}
                          {grandots.map((footv, key) => (
                            <td
                              key={key}
                              className="border border-black px-4 py-2 text-xs font-bold"
                            >
                              {footv.total_no_of_ots}
                            </td>
                          ))}
                          {receiptsummaryfootertotal?.map((foota, key) => (
                            <td
                              key={key}
                              className="border border-black text-right px-4 py-2 text-xs font-bold"
                            >
                              <NumericFormat
                                value={foota.total_grand_amount}
                                displayType={"text"}
                                thousandSeparator={true}
                                thousandsGroupStyle="lakh"
                                prefix={"₹"}
                                decimalScale={0}
                                fixedDecimalScale={true}
                              />
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    )}
                  </table>

                  <div className="grid grid-cols-4 mt-6">
                    {receiptTotalOTS?.length > 0 && (
                      <div className="col-xl-3 flex items-center flex-col mb-4 md:mb-0">
                        <b className="items-center text-center">
                          One Teacher School
                        </b>
                        {receiptTotalOTS.map((grandcount, key) => (
                          <NumericFormat
                            key={key}
                            thousandSeparator={true}
                            thousandsGroupStyle="lakh"
                            displayType={"text"}
                            prefix={"₹ "}
                            value={grandcount.total_ots_donation}
                            className="mt-2"
                          />
                        ))}
                      </div>
                    )}

                    {receiptTotalMembership?.length > 0 && (
                      <div className="col-xl-3 flex items-center flex-col mb-4 md:mb-0">
                        <b className="items-center text-center">
                          Membership Fees
                        </b>
                        {receiptTotalMembership.map((grandcount, key) => (
                          <NumericFormat
                            key={key}
                            thousandSeparator={true}
                            thousandsGroupStyle="lakh"
                            displayType={"text"}
                            prefix={"₹ "}
                            value={grandcount.total_membership_donation}
                            className="mt-2"
                          />
                        ))}
                      </div>
                    )}

                    {totalsummarygeneral?.length > 0 && (
                      <div className="col-xl-3 flex items-center flex-col mb-4 md:mb-0">
                        <b className="items-center text-center">Gn. Donation</b>
                        {totalsummarygeneral.map((grandcount, key) => (
                          <NumericFormat
                            key={key}
                            thousandSeparator={true}
                            thousandsGroupStyle="lakh"
                            displayType={"text"}
                            prefix={"₹ "}
                            value={grandcount.total_general_donation}
                            className="mt-2"
                          />
                        ))}
                      </div>
                    )}

                    {receiptsummary?.length > 0 && (
                      <div className="col-xl-3 flex items-center flex-col mb-4 md:mb-0">
                        <b className="items-center text-center">Total</b>
                        {receiptsummary.map((grandcount, key) => (
                          <NumericFormat
                            key={key}
                            thousandSeparator={true}
                            thousandsGroupStyle="lakh"
                            displayType={"text"}
                            prefix={"₹ "}
                            value={grandcount.total_donation}
                            className="mt-2"
                          />
                        ))}
                      </div>
                    )}
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

export default RecepitView;
