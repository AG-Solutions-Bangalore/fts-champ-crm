import { PROMOTER_SUMMARY_VIEW } from "@/api";
import ReportHeader from "@/components/common/report-header";
import { Card } from "@/components/ui/card";
import { useGetMutation } from "@/hooks/use-get-mutation";
import Moment from "moment";
import { useEffect, useMemo } from "react";

const PromoterView = ({
  componentRef,
  receiptFromDate,
  receiptToDate,
  indicompFullName,
}) => {
  const {
    data,
    isLoading: loader,
    isError: error,
    refetch,
  } = useGetMutation(
    "donor-summary-view",
    `${PROMOTER_SUMMARY_VIEW}/${indicompFullName}/${receiptFromDate}/${receiptToDate}`,
    {},
    { enabled: false }
  );

  useEffect(() => {
    if (indicompFullName && receiptFromDate && receiptToDate) {
      refetch();
    }
  }, [indicompFullName, receiptFromDate, receiptToDate]);

  const donorsummary = data?.receipt || [];
  const receiptsummaryfooterOTS = data?.receipt_grand_total_ots || [];
  const receiptsummaryfootertotal = data?.receipt_grand_total_amount || [];

  const groupedData = useMemo(() => {
    const result = {};
    donorsummary.forEach((item) => {
      const year = item.receipt_financial_year;
      const donationType = item.receipt_donation_type;
      const amount = item.receipt_total_amount;

      if (!result[year]) result[year] = {};
      if (!result[year][donationType]) result[year][donationType] = 0;
      result[year][donationType] += amount;
    });
    return result;
  }, [donorsummary]);

  const donationTypes = useMemo(() => {
    const types = new Set();
    donorsummary.forEach((item) => types.add(item.receipt_donation_type));
    return Array.from(types);
  }, [donorsummary]);

  return (
    <>
      {!loader && error && (
        <div className="text-red-600 text-center">{error}</div>
      )}

      {!loader && !error && (
        <div className="invoice-wrapper">
          <div className="flex flex-col items-center">
            <div className="w-full mx-auto">
              <Card className="p-6 overflow-x-auto grid md:grid-cols-1 1fr">
                <div ref={componentRef} className="my-5">
                  <ReportHeader title="PROMOTER SUMMARY" />
                  <table className="min-w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-gray-200">
                        {[
                          "Promoter",
                          "Donor Name",
                          "Contact",
                          "Mobile",
                          "Receipt No",
                          "Receipt Date",
                          "Year",
                          "Donation Type",
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
                      {donorsummary.map((dataSumm) => (
                        <tr key={dataSumm.id}>
                          <td className="border border-black px-4 py-2 text-xs">
                            {dataSumm.indicomp_promoter}
                          </td>
                          <td className="border border-black px-4 py-2 text-xs">
                            {dataSumm.indicomp_full_name}
                          </td>
                          <td className="border border-black px-4 py-2 text-xs">
                            {dataSumm.indicomp_com_contact_name}
                          </td>
                          <td className="border border-black px-4 py-2 text-xs">
                            {dataSumm.indicomp_mobile_phone}
                          </td>
                          <td className="border border-black text-center text-xs">
                            {dataSumm.receipt_no}
                          </td>
                          <td className="border border-black text-center text-xs">
                            {Moment(dataSumm.receipt_date).format("DD-MM-YYYY")}
                          </td>
                          <td className="border border-black text-center text-xs">
                            {dataSumm.receipt_financial_year}
                          </td>
                          <td className="border border-black text-center text-xs">
                            {dataSumm.receipt_donation_type}
                          </td>
                          <td className="border border-black text-center text-xs">
                            {dataSumm.receipt_no_of_ots}
                          </td>
                          <td className="border border-black text-right px-4 text-xs">
                            {dataSumm.receipt_total_amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan={7}
                          className="border border-black text-center font-bold text-xs"
                        >
                          Total
                        </td>
                        {receiptsummaryfooterOTS.map((footv, key) => (
                          <td
                            key={key}
                            className="border border-black text-center text-xs font-bold"
                          >
                            {footv.total_no_of_ots}
                          </td>
                        ))}
                        {receiptsummaryfootertotal.map((foota, key) => (
                          <td
                            key={key}
                            className="border border-black text-right px-4 text-xs font-bold"
                          >
                            {foota.total_grand_amount}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>

                  <div className="mt-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-black border-collapse text-left">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="border border-black px-2 py-1">
                              Financial Year
                            </th>
                            {donationTypes.map((type, index) => (
                              <th
                                key={index}
                                className="border border-black px-2 py-1"
                              >
                                {type}
                              </th>
                            ))}
                            <th className="border border-black px-2 py-1">
                              Grand Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(groupedData).map((year) => (
                            <tr key={year}>
                              <td className="border border-black px-2 py-1">
                                {year}
                              </td>
                              {donationTypes.map((type, index) => (
                                <td
                                  key={index}
                                  className="border border-black px-2 py-1"
                                >
                                  {groupedData[year][type] || 0}
                                </td>
                              ))}
                              <td className="border border-black px-2 py-1">
                                {Object.values(groupedData[year]).reduce(
                                  (total, amount) => total + amount,
                                  0
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="border border-black px-2 py-1 font-bold">
                              Grand Total:
                            </td>
                            {donationTypes.map((type, index) => {
                              const totalForType = Object.keys(
                                groupedData
                              ).reduce(
                                (total, year) =>
                                  total + (groupedData[year][type] || 0),
                                0
                              );
                              return (
                                <td
                                  key={index}
                                  className="border border-black px-2 py-1 font-bold"
                                >
                                  {totalForType}
                                </td>
                              );
                            })}
                            <td className="border border-black px-2 py-1 font-bold">
                              {Object.values(groupedData).reduce(
                                (grandTotal, dt) =>
                                  grandTotal +
                                  Object.values(dt).reduce(
                                    (sum, amt) => sum + amt,
                                    0
                                  ),
                                0
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
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

export default PromoterView;
