import {   Route, Routes } from "react-router-dom";



import AuthRoute from "./auth-route";
import Login from "@/app/auth/login";
import ForgotPassword from "@/components/forgot-password/forgot-password";
import Maintenance from "@/components/common/maintenance";
import ProtectedRoute from "./protected-route";

import NotFound from "@/app/errors/not-found";
import Home from "@/app/home/home";
import Chapter from "@/app/master-settings/chapter";
import Viewer from "@/app/master-settings/viewer";
import MemberShipDashboard from "@/app/membership/membership-dashboard";
import MemberShipInactive from "@/app/membership/membership-inactive";
import MembershipActive from "@/app/membership/membership-active";
import DonorList from "@/app/donor/donor-list/donor-list";
import Duplicate from "@/app/donor/duplicate/duplicate";
import Receipt from "@/app/receipt/receipt";
import SchoolList from "@/app/school/school-list/school-list";
import SchoolAllotment from "@/app/school/school-allotment/school-allotment";
import SchoolAlloted from "@/app/school/school-alloted/school-alloted";
import RepeatedDonor from "@/app/school/repeated-donor/repeated-donor";
import Donor from "@/app/report/donor/donor";
import DBStatement from "@/app/report/10db-statement/10db-statement";
import Promoter from "@/app/report/promoter/promoter";
import ReceiptSummary from "@/app/report/receipt/receipt";
import SchoolSummary from "@/app/report/school/school";
import SuspenseSummary from "@/app/report/suspense/suspense";
import Team from "@/app/other/team/team";
import Notification from "@/app/other/notification/notification";
import FaqOther from "@/app/other/faq/faq";
import Settings from "@/app/setting/setting";
import ReceiptView from "@/app/receipt/receipt-view";
import AllDownload from "@/app/download/all-download";
import DonationSummary from "@/app/report/donation/donation";
import MembershipList from "@/app/membership/membership-list";
import ReceiptCreate from "@/app/donor/donor-list/receipt-create";


function AppRoutes() {
  return (

      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
        {/* dashboard  */}
          <Route path="/home" element={<Home />} />

          {/* master-setting */}

          <Route path="/master/chapter" element={<Chapter />} />
          <Route path="/master/viewer" element={<Viewer />} />

          {/* membership  */}
          <Route path="/membership/dashboard" element={<MemberShipDashboard />} />
          <Route path="/member-list" element={<MembershipList />} />
          <Route path="/membership/active" element={<MembershipActive />} />
          <Route path="/membership/inactive" element={<MemberShipInactive />} />

          {/* donor  */}
          <Route path="/donor/donors" element={<DonorList />} />
          <Route path="/donor/duplicate" element={<Duplicate />} />


          {/* receipt  */}
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/receipt-view/:id" element={<ReceiptView />} />
          <Route path="/donor-create-receipt/:id" element={<ReceiptCreate />} />

          {/* school  */}

          <Route path="/school/list" element={<SchoolList />} />
          <Route path="/school/allotment" element={<SchoolAllotment />} />
          <Route path="/school/alloted" element={<SchoolAlloted />} />
          <Route path="/school/repeated" element={<RepeatedDonor />} />



        {/* report  */}
        <Route path="/report/suspense-summary" element={<SuspenseSummary />} />
        <Route path="/report/school-summary" element={<SchoolSummary />} />
        <Route path="/report/receipt-summary" element={<ReceiptSummary />} />
        <Route path="/report/donation-summary" element={<DonationSummary />} />
        <Route path="/report/promoter-summary" element={<Promoter />} />
        <Route path="/report/donor-summary" element={<Donor />} />
        <Route path="/report/10db-statement-summary" element={<DBStatement />} />


        {/* download  */}
        <Route path="/download" element={<AllDownload />} />



        {/* others  */}
        <Route path="/other/faq" element={<FaqOther />} />
        <Route path="/other/team" element={<Team />} />
        <Route path="/other/notification" element={<Notification />} />

        {/* settings  */}
        <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default AppRoutes;