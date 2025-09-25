import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const Promoter = () => {
  const navigate = useNavigate();
  const todayback = moment().format("YYYY-MM-DD");
  const firstdate = moment().startOf("month").format("YYYY-MM-DD");

  const [promoter, setPromoters] = useState([]);
  const [downloadDonor, setDonorDownload] = useState({
    receipt_from_date: firstdate,
    receipt_to_date: todayback,
    indicomp_promoter: "",
  });

  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    const updatedDonor = { ...downloadDonor, [name]: value };
    setDonorDownload(updatedDonor);
    checkIfButtonShouldBeEnabled(updatedDonor);
  };

  const checkIfButtonShouldBeEnabled = (data) => {
    const { receipt_from_date, receipt_to_date, indicomp_promoter } = data;
    setIsButtonEnabled(
      Boolean(receipt_from_date && receipt_to_date && indicomp_promoter)
    );
  };

  const onReportView = (e) => {
    e.preventDefault();
    if (document.getElementById("dowRecp").checkValidity()) {
      const { receipt_from_date, receipt_to_date, indicomp_promoter } =
        downloadDonor;
      localStorage.setItem("receipt_from_date_prm", receipt_from_date);
      localStorage.setItem("receipt_to_date_prm", receipt_to_date);
      localStorage.setItem("indicomp_full_name_prm", indicomp_promoter);
      navigate("/report/promoter-view");
    }
  };

  return (
    <>
      <Card className="bg-white shadow-md border border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-lg">
          <CardTitle className="text-blue-600 text-lg font-semibold">
            Download Promoters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-500 mb-6">
            Please fill all fields to view the report.
          </p>
          <form id="dowRecp" autoComplete="off" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Promoter Select */}

              <div className="flex flex-col space-y-2">
                <Label htmlFor="indicomp_promoter">Notice Title</Label>
                <Select
                  value={downloadDonor.indicomp_promoter}
                  onValueChange={(value) =>
                    setDonorDownload({
                      ...downloadDonor,
                      indicomp_promoter: value,
                    })
                  }
                  required
                >
                  <SelectTrigger id="indicomp_promoter" className="w-full">
                    <SelectValue placeholder="Select Notice" />
                  </SelectTrigger>
                  <SelectContent>
                    {promoter.map((item) => (
                      <SelectItem
                        key={item.indicomp_promoter}
                        value={item.indicomp_promoter}
                      >
                        {item.indicomp_promoter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="receipt_from_date">From Date</Label>
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
                <Label htmlFor="receipt_to_date">To Date</Label>
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
                onClick={onReportView}
                disabled={!isButtonEnabled}
                className={`bg-blue-600 hover:bg-blue-700 text-white ${
                  !isButtonEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                View
              </Button>

              <Button
                disabled={!isButtonEnabled}
                className={`bg-blue-600 hover:bg-green-700 text-white ${
                  !isButtonEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Download
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default Promoter;
