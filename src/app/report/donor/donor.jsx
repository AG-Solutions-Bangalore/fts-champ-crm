"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Calendar } from "@/components/ui/calendar";

const Donor = () => {
  const navigate = useNavigate();
  const today = moment().format("YYYY-MM-DD");
  const firstOfMonth = moment().startOf("month").format("YYYY-MM-DD");

  const [donorSummary, setDonorSummary] = useState({
    indicomp_full_name: "",
    receipt_from_date: firstOfMonth,
    receipt_to_date: today,
  });

  // Handle input change
  const onInputChange = (e) => {
    const { name, value } = e.target;
    setDonorSummary({
      ...donorSummary,
      [name]: value,
    });
  };

  const onReportIndividualView = (e) => {
    e.preventDefault();
    const { receipt_from_date, receipt_to_date, indicomp_full_name } =
      donorSummary;

    localStorage.setItem("receipt_from_date_indv", receipt_from_date);
    localStorage.setItem("receipt_to_date_indv", receipt_to_date);
    localStorage.setItem("indicomp_full_name_indv", indicomp_full_name);

    navigate("/report/donor-view");
  };

  const onReportGroupView = (e) => {
    e.preventDefault();
    const { receipt_from_date, receipt_to_date, indicomp_full_name } =
      donorSummary;

    localStorage.setItem("receipt_from_date_grp", receipt_from_date);
    localStorage.setItem("receipt_to_date_grp", receipt_to_date);
    localStorage.setItem("indicomp_full_name_grp", indicomp_full_name);

    navigate("/report/donorgroup-view");
  };

  return (
    <Card className="bg-white shadow-md border border-blue-200">
      <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-lg">
        <CardTitle className="text-blue-600 text-lg font-semibold">
          Download Receipts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-red-500 mb-6">
          Please fill all fields to view the report.
        </p>

        <form id="dowRecp" className="space-y-6" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Donor Name */}
            <div className="flex flex-col space-y-2">
              <Label
                className="text-blue-600 font-medium"
                htmlFor="indicomp_full_name"
              >
                Donor Name
              </Label>
              <Input
                id="indicomp_full_name"
                name="indicomp_full_name"
                value={donorSummary.indicomp_full_name}
                onChange={onInputChange}
                required
              />
            </div>

            {/* From Date */}
            <div className="flex flex-col space-y-2">
              <Label
                className="text-blue-600 font-medium"
                htmlFor="receipt_from_date"
              >
                From Date
              </Label>
              <Input
                type="date"
                id="receipt_from_date"
                name="receipt_from_date"
                value={donorSummary.receipt_from_date}
                onChange={onInputChange}
                required
              />
              {/* <Calendar
                mode="single"
                selected={donorSummary.receipt_from_date}
                onSelect={onInputChange}
                className="rounded-md border shadow"
                disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                captionLayout="dropdown" 
              /> */}
            </div>

            {/* To Date */}
            <div className="flex flex-col space-y-2">
              <Label
                className="text-blue-600 font-medium"
                htmlFor="receipt_to_date"
              >
                To Date
              </Label>
              <Input
                type="date"
                id="receipt_to_date"
                name="receipt_to_date"
                value={donorSummary.receipt_to_date}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onReportIndividualView}
            >
              Individual View
            </Button>
            <Button
              className="bg-blue-600 hover:bg-green-700 text-white"
              onClick={onReportGroupView}
            >
              Group View
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Donor;
