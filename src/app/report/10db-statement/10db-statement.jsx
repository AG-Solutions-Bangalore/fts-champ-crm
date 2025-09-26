
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DBStatement = () => {
  const navigate = useNavigate();
  const todayback = moment().format("YYYY-MM-DD");
  const firstdate = moment().startOf("month").format("YYYY-MM-DD");

  const [downloadDonor, setDonorDownload] = useState({
    receipt_from_date: firstdate,
    receipt_to_date: todayback,
    receipt_financial_year: "",
    receipt_chapter_id: "",
  });

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setDonorDownload({
      ...downloadDonor,
      [name]: value,
    });
  };



  const onReportView = (path) => (e) => {
    e.preventDefault();
    if (document.getElementById("dowRecp").reportValidity()) {
      localStorage.setItem("receipt_from_date", downloadDonor.receipt_from_date);
      localStorage.setItem("receipt_to_date", downloadDonor.receipt_to_date);
      navigate(path);
    }
  };

  return (
    <>
      <Card className="mt-4 bg-white">
        <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-lg">
          <CardTitle className="text-blue-600 text-lg font-semibold">
            Download School
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-500 mb-6">
            Please fill all fields to view the report.
          </p>

          <form id="dowRecp" autoComplete="off" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

            <div className="flex flex-wrap justify-start gap-4 py-4">
              <Button
          
                className="w-full sm:w-auto bg-blue-600 hover:bg-green-700"
              >
                Download
              </Button>

              <Button
                onClick={onReportView("/recepit-otg-view")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                View
              </Button>

              <Button
             
                className="w-full sm:w-auto bg-blue-600 hover:bg-green-700"
              >
                No Pan Download
              </Button>

              <Button
                onClick={onReportView("/recepit-nopan-view")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                No Pan View
              </Button>

              <Button
              
                className="w-full sm:w-auto bg-blue-600 hover:bg-green-700"
              >
                Download Group
              </Button>

              <Button
                onClick={onReportView("/recepit-group-view")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                View Group
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default DBStatement;
