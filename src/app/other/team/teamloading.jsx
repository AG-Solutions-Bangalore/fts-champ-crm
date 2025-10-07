import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


const TeamLoading = () => {
  return (
    <Card className="bg-white shadow-md border text-[var(--label-color) rounded-md">
      <CardContent className="p-6">
        <form id="dowRecp" className="space-y-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:items-end lg:gap-6 gap-6 flex-wrap">
            {/* Active Duration */}
            <div className="flex flex-col min-w-[220px] mt-2">
              <Label className="font-medium">Active Duration</Label>
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-10 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-10 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>

            {/* Committee Type */}
            <div className="flex-1 min-w-[220px]">
              <Label className="font-medium">Committee Type</Label>
              <Skeleton className="h-10 w-full mt-2 rounded-md" />
            </div>

            {/* Designation */}
            <div className="flex-1">
              <Label className="font-medium">Designation</Label>
              <Skeleton className="h-10 w-full mt-2 rounded-md" />
            </div>

            {/* Member's Name */}
            <div className="flex-1">
              <Label className="font-medium">Member's Name</Label>
              <Skeleton className="h-10 w-full mt-2 rounded-md" />
            </div>

            {/* Submit Button */}
            <div className="flex items-end gap-4 mt-2">
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeamLoading;
