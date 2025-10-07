import React, { useState } from "react";
import { MemoizedSelect } from "@/components/common/memoized-select";
import { Label } from "@/components/ui/label";
import {
  OTHER_TEAM_COMMITTEE_DROPDOWN,
  OTHER_TEAM_COMMITTEE_LIST,
  OTHER_TEAM_CREATE,
  OTHER_TEAM_DESIGNATION_DROPDOWN,
  OTHER_TEAM_MEMBER_SELECT_LIST,
} from "@/api";
import { useGetMutation } from "@/hooks/use-get-mutation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TeamLoading from "./TeamLoading";
import moment from "moment";
import { useApiMutation } from "@/hooks/use-mutation";
import { toast } from "sonner";
import CommitteeList from "./committee-list";

const commiteeOptions = [
  { value: "Executive Committee", label: "Executive Committee" },
  { value: "Mahila Samiti", label: "Mahila Samiti" },
  { value: "Ekal Yuva", label: "Ekal Yuva" },
  { value: "Functional Committee", label: "Functional Committee" },
];

const Team = () => {
  const [committee, setCommittee] = useState({
    committee_type: "",
    designation: "",
    indicomp_fts_id: "",
    indicomp_full_name: "",
    receipt_from_date: "",
    receipt_to_date: "",
    indicomp_full_name_dummy: "",
  });
  const { trigger, loading } = useApiMutation();
  const { data: committeeResponse, isLoading: committeeLoading } =
    useGetMutation("teamCommitteeList", OTHER_TEAM_COMMITTEE_LIST);
  const { data: designationOptions, isLoading: designationloading } =
    useGetMutation("teamdesignation", OTHER_TEAM_DESIGNATION_DROPDOWN);

  const { data: teamcommittes, isLoading: committesloading } = useGetMutation(
    "teamcommitte",
    OTHER_TEAM_COMMITTEE_DROPDOWN
  );

  const { data: memberdata, isLoading: membersloading } = useGetMutation(
    "memberdata",
    OTHER_TEAM_MEMBER_SELECT_LIST
  );

  const handleInputChange = (value, field) => {
    if (field === "indicomp_full_name_dummy") {
      const selected = memberdata?.individualCompanies?.find(
        (item) => item.indicomp_fts_id === value
      );
      if (selected) {
        setCommittee((prev) => ({
          ...prev,
          indicomp_full_name: selected.indicomp_fts_id,
          indicomp_full_name_dummy: selected.indicomp_full_name,
          receipt_from_date: selected.receipt_from_date || "",
          receipt_to_date: selected.receipt_to_date || "",
        }));
      }
    } else {
      setCommittee((prev) => ({ ...prev, [field]: value }));
    }
  };

  if (
    designationloading ||
    committesloading ||
    membersloading ||
    committeeLoading
  ) {
    // if (true) {
    return <TeamLoading />;
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    if (
      !committee.committee_type ||
      !committee.designation ||
      !committee.indicomp_full_name_dummy
    ) {
      toast.warning("Please select required Fields.");
      return;
    }

    const payload = {
      committee_type: committee.committee_type,
      designation: committee.designation,
      start_date: teamcommittes?.committeDate?.committee_from,
      end_date: teamcommittes?.committeDate?.committee_to,
      indicomp_fts_id: committee.indicomp_full_name,
      indicomp_full_name_dummy: committee.indicomp_full_name_dummy,
    };
    try {
      const res = await trigger({
        url: OTHER_TEAM_CREATE,
        method: "post",
        data: payload,
      });

      if (!res) {
        toast.warning("No response from server.");
        return;
      }
      toast.success(res?.msg || "Team created successfully!");
    } catch (err) {
      console.error("Error creating team:", err);
      toast.error(
        err.message || "Something went wrong while creating the team."
      );
    }
  };

  return (
    <>
      <Card className="bg-white shadow-md border text-[var(--label-color) rounded-md">
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:items-end lg:gap-6 gap-6 flex-wrap">
              <div className="flex flex-col min-w-[220px] mt-2">
                <Label className="font-medium">Active Duration</Label>
                <div className="flex gap-2 text-sm text-gray-600 mt-1">
                  <span className="font-medium">From:</span>
                  <span className="border rounded-md px-2 py-1 bg-gray-50 text-gray-700">
                    {teamcommittes?.committeDate?.committee_from
                      ? moment(
                          teamcommittes.committeDate.committee_from
                        ).format("DD MMM YYYY")
                      : "—"}
                  </span>
                  <span className="font-medium">To:</span>
                  <span className="border rounded-md px-2 py-1 bg-gray-50 text-gray-700">
                    {teamcommittes?.committeDate?.committee_to
                      ? moment(teamcommittes.committeDate.committee_to).format(
                          "DD MMM YYYY"
                        )
                      : "—"}
                  </span>
                </div>
              </div>
              {/* Committee Type */}
              <div className="flex-1 min-w-[220px]">
                <Label className="font-medium" htmlFor="committee_type">
                  Committee Type <span className="text-red-500">*</span>
                </Label>
                <MemoizedSelect
                  name="committee_type"
                  value={committee?.committee_type}
                  onChange={(e) => handleInputChange(e, "committee_type")}
                  options={commiteeOptions}
                  placeholder="Select Committee Type"
                />
              </div>

              {/* Designation */}
              <div className="flex-1">
                <Label className="font-medium" htmlFor="designation">
                  Designation <span className="text-red-500">*</span>
                </Label>
                <MemoizedSelect
                  name="designation"
                  value={committee?.designation}
                  onChange={(e) => handleInputChange(e, "designation")}
                  options={
                    designationOptions?.designation?.map((item) => ({
                      label: item.designation_type,
                      value: item.designation_type,
                    })) || []
                  }
                  placeholder="Select Designation"
                />
              </div>

              {/* Member's Name */}
              <div className="flex-1">
                <Label
                  className="font-medium"
                  htmlFor="indicomp_full_name_dummy"
                >
                  Member's Name <span className="text-red-500">*</span>
                </Label>
                <MemoizedSelect
                  name="indicomp_full_name_dummy"
                  value={committee?.indicomp_full_name_dummy}
                  onChange={(e) =>
                    handleInputChange(e, "indicomp_full_name_dummy")
                  }
                  options={
                    memberdata?.individualCompanies?.map((item) => ({
                      label: `${item.indicomp_full_name} (${item.indicomp_type})`,
                      value: item.indicomp_fts_id,
                    })) || []
                  }
                  placeholder="Select Member's Name"
                />
              </div>

              <div className="flex items-end gap-4 mt-2">
                <Button className="text-white" type="submit">
                  Update
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <CommitteeList committeeResponse={committeeResponse} />
    </>
  );
};

export default Team;
