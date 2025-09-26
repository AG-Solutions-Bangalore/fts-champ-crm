"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function School() {
  const navigate = useNavigate();
  const [individual, setIndividuals] = useState([]);
  const [downloadDonor, setDonorDownload] = useState({
    indicomp_full_name: "",
  });

  // Input change handler
  const onInputChange = (e) => {
    const { name, value } = e.target;
    setDonorDownload({
      ...downloadDonor,
      [name]: value,
    });
  };

  const onReportView = (e) => {
    e.preventDefault();
    if (document.getElementById("dowRecp").reportValidity()) {
      localStorage.setItem("schl_sum_viw", downloadDonor.indicomp_full_name);
      navigate("/report/schoolview");
    }
  };



  return (
    <>
      <Card className="mt-4">
        <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-lg">
          <CardTitle className="text-blue-600 text-lg font-semibold">School Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-500 mb-6">Please fill all fields to view the report.</p>
          <form id="dowRecp" autoComplete="off" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Donor Select */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="indicomp_full_name" required>
                  Source
                </Label>
                <Select
                  value={downloadDonor.indicomp_full_name}
                  onValueChange={(value) =>
                    setDonorDownload({ ...downloadDonor, indicomp_full_name: value })
                  }
                  required
                >
                  <SelectTrigger id="indicomp_full_name" className="w-full">
                    <SelectValue placeholder="Select Donor" />
                  </SelectTrigger>
                  <SelectContent>
                    {individual.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.indicomp_full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button  className="bg-blue-600 hover:bg-green-700 text-white">
                Download
              </Button>
              <Button onClick={onReportView} className="bg-blue-600 hover:bg-blue-700 text-white">
                View
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default School;
