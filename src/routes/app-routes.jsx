import { Route, Routes } from "react-router-dom";

import Login from "@/app/auth/login";
import Maintenance from "@/components/common/maintenance";
import ForgotPassword from "@/components/forgot-password/forgot-password";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";

import DonorList from "@/app/donor/donor-list/donor-list";
import ReceiptCreate from "@/app/donor/donor-list/receipt-create";
import Duplicate from "@/app/donor/duplicate/duplicate";
import AllDownload from "@/app/download/all-download";
import NotFound from "@/app/errors/not-found";
import Home from "@/app/home/home";
import Chapter from "@/app/master-settings/chapter";
import Viewer from "@/app/master-settings/viewer";
import MembershipActive from "@/app/membership/membership-active";
import MemberShipDashboard from "@/app/membership/membership-dashboard";
import MemberShipInactive from "@/app/membership/membership-inactive";
import MembershipList from "@/app/membership/membership-list";
import FaqOther from "@/app/other/faq/faq";
import Notification from "@/app/other/notification/notification";
import Team from "@/app/other/team/team";
import Receipt from "@/app/receipt/receipt";
import ReceiptView from "@/app/receipt/receipt-view";
import DBStatement from "@/app/report/10db-statement/10db-statement";
import DonationSummary from "@/app/report/donation/donation";
import Donor from "@/app/report/donor/donor";
import Promoter from "@/app/report/promoter/promoter";
import ReceiptSummary from "@/app/report/receipt/receipt";
import SchoolSummary from "@/app/report/school/school";
import SuspenseSummary from "@/app/report/suspense/suspense";
import RepeatedDonor from "@/app/school/repeated-donor/repeated-donor";
import SchoolAlloted from "@/app/school/school-alloted/school-alloted";
import SchoolAllotEdit from "@/app/school/school-alloted/school-alloted-edit";
import SchoolAllotView from "@/app/school/school-alloted/school-alloted-view";
import DonorDetails from "@/app/school/school-allotment/donor-details";
import SchoolToAllot from "@/app/school/school-allotment/school-allotment";
import SchoolList from "@/app/school/school-list/school-list";
import SchoolListView from "@/app/school/school-list/school-list-view";
import Settings from "@/app/setting/setting";

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
        <Route path="/school/list-view/:id" element={<SchoolListView />} />
        <Route path="/school/to-allot" element={<SchoolToAllot />} />
        <Route
          path="/school/donor-details/:id/:year/:fyear"
          element={<DonorDetails />}
        />
        <Route path="/school/alloted" element={<SchoolAlloted />} />
        <Route path="/school/allotedit/:id/:year" element={<SchoolAllotEdit />} />
        <Route path="/school/allotview/:id" element={<SchoolAllotView />} />
        <Route path="/school/repeated" element={<RepeatedDonor />} />

        {/* report  */}
        <Route path="/report/suspense-summary" element={<SuspenseSummary />} />
        <Route path="/report/school-summary" element={<SchoolSummary />} />
        <Route path="/report/receipt-summary" element={<ReceiptSummary />} />
        <Route path="/report/donation-summary" element={<DonationSummary />} />
        <Route path="/report/promoter-summary" element={<Promoter />} />
        <Route path="/report/donor-summary" element={<Donor />} />
        <Route
          path="/report/10db-statement-summary"
          element={<DBStatement />}
        />

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
