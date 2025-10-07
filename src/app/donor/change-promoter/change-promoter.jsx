import { MemoizedSelect } from "@/components/common/memoized-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGetMutation } from "@/hooks/use-get-mutation";
import { useApiMutation } from "@/hooks/use-mutation";
import { useState } from "react";
import { toast } from "sonner";
import {
  DONOR_CHANGE_PROMOTER_UPDATE_SUMBIT,
  PROMOTER_SUMMARY_DROPDOWN,
} from "../../../api";
import ChangePromoterLoading from "./loading";

const ChangePromoter = () => {
  const [changePromoter, setChangePromoter] = useState({
    new_promoter: "",
    old_promoter: "",
  });

  const { data: PromoterData, isLoading } = useGetMutation(
    "promter-summary-dropdown-s",
    PROMOTER_SUMMARY_DROPDOWN
  );
  const { trigger, loading: isUpdating } = useApiMutation();

  const handleInputChange = (value, field) => {
    setChangePromoter({
      ...changePromoter,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!changePromoter.old_promoter || !changePromoter.new_promoter) {
      toast.error("Please fill all required fields");
      return;
    }

    if (changePromoter.old_promoter === changePromoter.new_promoter) {
      toast.error("New promoter must be different from old promoter");
      return;
    }

    try {
      const res = await trigger({
        url: DONOR_CHANGE_PROMOTER_UPDATE_SUMBIT,
        method: "post",
        data: changePromoter,
      });

      if (res?.code === 200) {
        toast.success(res.msg);
        setChangePromoter({ old_promoter: "", new_promoter: "" });
      } else {
        toast.error(res?.msg || "Unexpected error occurred");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to update promoter");
    }
  };
  if(isLoading){
    return <ChangePromoterLoading/>
  }
  return (
    <Card className="bg-white shadow-md border text-[var(--label-color) rounded-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="old_promoter" className="mb-1">
                Old Promoter <span className="text-red-500">*</span>
              </Label>
              <MemoizedSelect
                name="old_promoter"
                value={changePromoter.old_promoter}
                onChange={(val) => handleInputChange(val, "old_promoter")}
                options={
                  PromoterData?.promoter?.map((item) => ({
                    label: item.indicomp_promoter,
                    value: item.indicomp_promoter,
                  })) || []
                }
                placeholder="Select Old Promoter"
              />
            </div>

            <div>
              <Label htmlFor="new_promoter" className="mb-1">
                New Promoter <span className="text-red-500">*</span>
              </Label>
              <MemoizedSelect
                name="new_promoter"
                value={changePromoter.new_promoter}
                onChange={(val) => handleInputChange(val, "new_promoter")}
                options={
                  PromoterData?.promoter?.map((item) => ({
                    label: item.indicomp_promoter,
                    value: item.indicomp_promoter,
                  })) || []
                }
                placeholder="Select New Promoter"
              />
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              disabled={isUpdating}
              variant="default"
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePromoter;
