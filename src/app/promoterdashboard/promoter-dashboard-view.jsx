import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { Calendar, Mail, Receipt, Users } from "lucide-react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { PROMOTER_DASHBOARD_VIEW } from "@/api";
import DonorMembersTable from "./promoter-dashboard-donorlist";
import { useState } from "react";

const PromoterDashboardView = () => {
  const { id } = useParams();
  const token = Cookies.get("token");
  const [selectedType, setSelectedType] = useState(null);
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["promoter-dashboard-by-ftsid", id],
    queryFn: async () => {
      const response = await axios.get(`${PROMOTER_DASHBOARD_VIEW}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    retry: 2,
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const members = dashboardData?.data || [];
  const memberrecepit = members?.individualCompanies || [];
  const receipts = [
    ...(dashboardData?.data?.receipts1 || []),
    ...(dashboardData?.data?.receipts2 || []),
    ...(dashboardData?.data?.receipts3 || []),
  ];
  const receiptsByYear = receipts.reduce((acc, item) => {
    const year = item.receipt_financial_year;

    if (!acc[year]) {
      acc[year] = {
        total: 0,
        types: {},
      };
    }

    acc[year].total += item.total;

    acc[year].types[item.receipt_donation_type] =
      (acc[year].types[item.receipt_donation_type] || 0) + item.total;

    return acc;
  }, {});
  const years = Object.entries(receiptsByYear).sort(
    ([yearA], [yearB]) =>
      parseInt(yearB.split("-")[0]) - parseInt(yearA.split("-")[0]),
  );
  const totalReceipts = years.reduce((sum, [, data]) => sum + data.total, 0);
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-6 w-10" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header Section */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 w-full">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="text-blue-600 w-4 h-4" />
            </div>
            <div className="w-full">
              <div className="flex justify-between w-full">
                <h1 className="text-lg font-semibold">Promoter Dashboard</h1>
                <h2 className="text-lg font-semibold">
                  {dashboardData?.data?.promoter?.title}{" "}
                  {dashboardData?.data?.promoter?.indicomp_full_name}
                </h2>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-sm text-gray-500">
                  Manage donors across different years
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData?.data?.promoter?.chapter?.chapter_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            label: "Active Members",
            sub: "Registered individuals",
            value: memberrecepit?.length ?? 0,
            accent: "border-l-slate-400",
            num: "text-slate-800",
            icon: Users,
            iconBg: "bg-slate-100",
            iconColor: "text-slate-500",
          },
          {
            label: "Financial Years",
            sub: "Years with activity",
            value: years?.length ?? 0,
            accent: "border-l-teal-400",
            num: "text-slate-800",
            icon: Calendar,
            iconBg: "bg-teal-50",
            iconColor: "text-teal-500",
          },
          {
            label: "Total Receipts",
            sub: "Across all years",
            value: totalReceipts ?? 0,
            accent: "border-l-amber-400",
            num: "text-slate-800",
            icon: Receipt,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
          },
        ].map(
          ({
            label,
            sub,
            value,
            accent,
            num,
            icon: Icon,
            iconBg,
            iconColor,
          }) => (
            <div
              key={label}
              className={`group relative bg-white border border-gray-100 border-l-4 ${accent}
        rounded-xl px-5 py-4 flex flex-col justify-between gap-3 transition-all duration-200`}
            >
              {/* Top */}
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  {label}
                </p>
              </div>

              {/* Middle */}
              <div className="flex items-center justify-between">
                <p
                  className={`text-4xl font-bold ${num} leading-none tracking-tight tabular-nums`}
                >
                  {(value ?? 0).toLocaleString()}
                </p>

                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}
                >
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
              </div>

              {/* Bottom */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
              </div>
            </div>
          ),
        )}
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calendar className="text-emerald-600 w-3.5 h-3.5" />
            </div>

            <div>
              <CardTitle className="text-sm font-semibold text-gray-800">
                Receipts
              </CardTitle>
              <p className="text-[10px] text-gray-400">
                {years.length} financial years
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          {years?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                {/* THEAD */}
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="text-left px-3 py-2 font-semibold">Type</th>

                    {years.map(([year]) => (
                      <th
                        key={year}
                        className="text-center px-3 py-2 font-semibold"
                      >
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {[
                    ...new Set(
                      years.flatMap(([, data]) => Object.keys(data.types)),
                    ),
                  ].map((type) => (
                    <tr
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="border-b hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-3 py-2 font-medium text-gray-600">
                        {type}
                      </td>

                      {years.map(([year, data]) => (
                        <td
                          key={year}
                          className="text-center px-3 py-2 text-gray-700"
                        >
                          {data.types[type] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

                {/* FOOTER */}
                <tfoot>
                  <tr className="border-t bg-gray-50 font-semibold">
                    <td className="px-3 py-2 text-gray-700">Total</td>

                    {years.map(([year, data]) => (
                      <td
                        key={year}
                        className="text-center px-3 py-2 text-gray-900"
                      >
                        {data.total}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-gray-500">
              No data found
            </div>
          )}
        </CardContent>
      </Card>
      {selectedType && (
        <DonorMembersTable data={memberrecepit} selectedType={selectedType} />
      )}
    </div>
  );
};

export default PromoterDashboardView;
