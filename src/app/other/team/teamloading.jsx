import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";



const TeamLoading = () => {
  return (
    <>
      <Card className="bg-white shadow-md border text-[var(--label-color)] rounded-md">
        <CardContent className="p-6">
          <form id="dowRecp" className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:items-end lg:gap-6 gap-6 flex-wrap">
              {/* Active Duration */}
              <div className="flex flex-col min-w-[220px] mt-2">
                <Skeleton className="h-4 w-32 mb-2" /> {/* Label */}
                <div className="flex gap-2 text-sm mt-1">
                  <Skeleton className="h-6 w-12 rounded-md" /> {/* From */}
                  <Skeleton className="h-6 w-16 rounded-md" /> {/* From Date */}
                  <Skeleton className="h-6 w-10 rounded-md" /> {/* To */}
                  <Skeleton className="h-6 w-16 rounded-md" /> {/* To Date */}
                </div>
              </div>

              {/* Committee Type */}
              <div className="flex-1 min-w-[220px]">
                <Skeleton className="h-4 w-40 mb-2" /> {/* Label */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
              </div>

              {/* Designation */}
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" /> {/* Label */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
              </div>

              {/* Member's Name */}
              <div className="flex-1">
                <Skeleton className="h-4 w-44 mb-2" /> {/* Label */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
              </div>

              {/* Update Button */}
              <div className="flex items-end gap-4 mt-2">
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-4 mt-4">
        <div className="grid w-full grid-cols-4 gap-2 mb-2 sticky top-16 shadow-sm">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <Card
              key={i}
              className="p-4 flex items-center gap-4 border border-gray-200 rounded-xl"
            >
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default TeamLoading;
