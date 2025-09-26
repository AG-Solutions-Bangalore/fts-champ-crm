import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReceiptDownload from "@/components/all-download/receipt/receipt-download";
import DonorDownload from "@/components/all-download/donor/donor-download";

const AllDownload = () => {
  return (
    <div className="p-4 max-w-full mx-auto">
      <Tabs defaultValue="receipt" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-2 sticky top-16  z-10 shadow-sm">
  <TabsTrigger value="receipt">Receipt</TabsTrigger>
  <TabsTrigger value="donor">Donor</TabsTrigger>
  <TabsTrigger value="school">School</TabsTrigger>
  <TabsTrigger value="ots">OTS</TabsTrigger>
  <TabsTrigger value="team">Team</TabsTrigger>
  <TabsTrigger value="all-receipt">All Receipt</TabsTrigger>
</TabsList>


        <TabsContent value="receipt" className="space-y-2">
         <ReceiptDownload/>
        </TabsContent>

        <TabsContent value="donor" className="space-y-2">
         <DonorDownload/>
        </TabsContent>

        <TabsContent value="school" className="space-y-2">
          <p>School content goes here</p>
        </TabsContent>

        <TabsContent value="ots" className="space-y-2">
          <p>OTS content goes here</p>
        </TabsContent>

        <TabsContent value="team" className="space-y-2">
          <p>Team content goes here</p>
        </TabsContent>

        <TabsContent value="all-receipt" className="space-y-2">
          <p>All Receipt content goes here</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AllDownload;
