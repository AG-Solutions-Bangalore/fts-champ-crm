import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { Calendar, Download, Mail, Users } from "lucide-react";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PROMOTER_DASHBOARD_VIEW } from "@/api";
import moment from "moment";
import DonorMembersTable from "./promoter-dashboard-donorlist";

const PromoterDashboardView = () => {
  const { id } = useParams();
  const token = Cookies.get("token");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["promoter-dashboard-by-ftsid"],
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="text-blue-600 w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Promoter Dashboard</h1>
              <p className="text-sm text-gray-500">
                Manage donors across different years
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Members</p>
              <h3 className="text-lg font-semibold">
                {memberrecepit.length ?? 0}
              </h3>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Years</p>
              <h3 className="text-lg font-semibold">{years.length ?? 0}</h3>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Recepits</p>
              <h3 className="text-lg font-semibold">{totalReceipts}</h3>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-600">
              <Mail className="w-4 h-4 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center justify-between">
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
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {years.map(([year, data]) => (
              <div
                key={year}
                className="rounded-lg border border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-white hover:shadow-sm transition-all duration-150 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {year}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.total}
                  </span>
                </div>

                <div className="w-full h-0.5 bg-gray-200 rounded-full mb-2">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{
                      width: `${Math.min((data.total / Math.max(...years.map(([, d]) => d.total))) * 100, 100)}%`,
                    }}
                  />
                </div>

                <div className="space-y-1">
                  {Object.entries(data.types).map(([type, count], i) => {
                    const colors = [
                      { dot: "bg-blue-400", text: "text-blue-600" },
                      { dot: "bg-emerald-400", text: "text-emerald-600" },
                      { dot: "bg-orange-400", text: "text-orange-600" },
                      { dot: "bg-purple-400", text: "text-purple-600" },
                    ];
                    const c = colors[i % colors.length];
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-1 h-1 rounded-full flex-shrink-0 ${c.dot}`}
                          />
                          <span className="text-[12px] text-gray-500 truncate">
                            {type}
                          </span>
                        </div>
                        <span
                          className={`text-[12px] font-semibold flex-shrink-0 ml-1 ${c.text}`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {memberrecepit?.length > 0 && <DonorMembersTable data={memberrecepit} />}
    </div>
  );
};

export default PromoterDashboardView;
