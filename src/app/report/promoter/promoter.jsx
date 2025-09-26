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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Printer } from "lucide-react";
import { MemoizedSelect } from "@/components/common/memoized-select";
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

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    setDonorDownload({ ...downloadDonor, [field]: value });
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
      <Card className="bg-white shadow-md border text-[var(--label-color) rounded-md">
        <CardHeader className="border-b bg-[var(--color-light)] rounded-t-md py-2 px-4">
          <CardTitle className="text-lg font-medium">
            <div className="flex justify-between ">
              <h2> Download Promoters</h2>
              <div className="space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        // onClick={handlePrintPdf}
                        className="transition-all duration-300 hover:scale-110 border border-[var(--color-border)] hover:shadow-md"
                      >
                        <Printer className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print Receipt</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        // onClick={handleSavePDF}
                        className=" transition-all duration-300 hover:scale-110 border border-[var(--color-border)] hover:shadow-md"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form id="dowRecp" autoComplete="off" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="indicomp_promoter">Notice Title</Label>
                {/* <Select
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
                </Select> */}
                <MemoizedSelect
                  name="indicomp_promoter"
                  value={downloadDonor?.indicomp_promoter}
                  onChange={(e) => handleInputChange(e, "indicomp_promoter")}
                  options={
                    promoter?.map((item) => ({
                      label: item.indicomp_promoter,
                      value: item.indicomp_promoter,
                    })) || []
                  }
                  placeholder="Select Notice Title"
                />
              </div>

              {/* From Date */}
              <div>
                <Label htmlFor="receipt_from_date">From Date</Label>
                <Input
                  id="receipt_from_date"
                  name="receipt_from_date"
                  type="date"
                  value={downloadDonor.receipt_from_date}
                  onChange={(e) => handleInputChange(e, "receipt_from_date")}
                  
                />
              </div>

              {/* To Date */}
              <div>
                <Label htmlFor="receipt_to_date">To Date</Label>
                <Input
                  id="receipt_to_date"
                  name="receipt_to_date"
                  type="date"
                  value={downloadDonor.receipt_to_date}
                  onChange={(e) => handleInputChange(e, "receipt_to_date")}
                  required
                />
              </div>
              <div className="flex gap-4 pt-6">
                <Button>View</Button>

                <Button>Download</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default Promoter;
