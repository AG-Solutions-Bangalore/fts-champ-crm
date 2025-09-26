"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Recepit = () => {
  const navigate = useNavigate();
  const todayback = moment().format("YYYY-MM-DD");
  const firstdate = moment().startOf("month").format("YYYY-MM-DD");

  const [downloadDonor, setDonorDownload] = useState({
    receipt_from_date: firstdate,
    receipt_to_date: todayback,
  });

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setDonorDownload({
      ...downloadDonor,
      [name]: value,
    });
  };

  const onReportView = (e) => {
    e.preventDefault();
    if (document.getElementById("dowRecp").checkValidity()) {
      const { receipt_from_date, receipt_to_date } = downloadDonor;
      localStorage.setItem("receipt_from_date_recp", receipt_from_date);
      localStorage.setItem("receipt_to_date_recp", receipt_to_date);
      navigate("/recepit-summary-view");
    }
  };


  return (
    <>
      <Card className="mt-4">
        <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-lg">
          <CardTitle className="text-blue-600 text-lg font-semibold">
            Download Receipt 
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-500 mb-6">
            Please fill all fields to view the report.
          </p>
          <form id="dowRecp" autoComplete="off" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* From Date */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="receipt_from_date" required>
                  From Date
                </Label>
                <Input
                  id="receipt_from_date"
                  name="receipt_from_date"
                  type="date"
                  value={downloadDonor.receipt_from_date}
                  onChange={onInputChange}
                  required
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="receipt_to_date" required>
                  To Date
                </Label>
                <Input
                  id="receipt_to_date"
                  name="receipt_to_date"
                  type="date"
                  value={downloadDonor.receipt_to_date}
                  onChange={onInputChange}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                className="bg-blue-600 hover:bg-green-700 text-white"
              >
                Download
              </Button>
              <Button
                onClick={onReportView}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default Recepit;
