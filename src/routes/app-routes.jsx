import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from 'react';
import LoadingBar from "@/components/loader/loading-bar";
import ReceiptEdit from "@/app/receipt/test";

// import Login from "@/app/auth/login";
// import DonorList from "@/app/donor/donor-list/donor-list";
// import ReceiptCreate from "@/app/donor/donor-list/receipt-create";
// import AllDownload from "@/app/download/all-download";
// import NotFound from "@/app/errors/not-found";
// import Home from "@/app/home/home";
// import Chapter from "@/app/master-settings/chapter";
// import Viewer from "@/app/master-settings/viewer";
// import MembershipActive from "@/app/membership/membership-active";
// import MemberShipDashboard from "@/app/membership/membership-dashboard";
// import MemberShipInactive from "@/app/membership/membership-inactive";
// import MembershipList from "@/app/membership/membership-list";
// import FaqOther from "@/app/other/faq/faq";
// import Notification from "@/app/other/notification/notification";
// import Team from "@/app/other/team/team";
// import Maintenance from "@/components/common/maintenance";
// import ForgotPassword from "@/components/forgot-password/forgot-password";
// import AuthRoute from "./auth-route";
// import ProtectedRoute from "./protected-route";
// import DonorCompanyCreate from "@/app/donor/donor-list/donor-company-create";
// import DonorIndiviusalCreate from "@/app/donor/donor-list/donor-indiviusal-create";
// import DonorView from "@/app/donor/donor-list/donor-view";
// import DuplicateDonor from "@/app/donor/duplicate/duplicate-donor";
// import DuplicateDonorEdit from "@/app/donor/duplicate/duplicate-donor-edit";
// import Receipt from "@/app/receipt/receipt";
// import ReceiptView from "@/app/receipt/receipt-view";
// import DBStatement from "@/app/report/10db-statement/10db-statement";
// import DonationSummary from "@/app/report/donation/donation";
// import Donor from "@/app/report/donor/donor";
// import Promoter from "@/app/report/promoter/promoter";
// import ReceiptSummary from "@/app/report/receipt/receipt";
// import SchoolSummary from "@/app/report/school/school";
// import SuspenseSummary from "@/app/report/suspense/suspense";
// import RepeatedDonor from "@/app/school/repeated-donor/repeated-donor";
// import SchoolAllotLetter from "@/app/school/school-alloted/allotment-letter";
// import SchoolAlloted from "@/app/school/school-alloted/school-alloted";
// import SchoolAllotEdit from "@/app/school/school-alloted/school-alloted-edit";
// import SchoolAllotView from "@/app/school/school-alloted/school-alloted-view";
// import DonorDetails from "@/app/school/school-allotment/donor-details";
// import SchoolToAllot from "@/app/school/school-allotment/school-allotment";
// import SchoolList from "@/app/school/school-list/school-list";
// import SchoolListView from "@/app/school/school-list/school-list-view";
// import Settings from "@/app/setting/setting";
// import AllotedList from "@/app/school/repeated-donor/alloted-list";
// import DonorIndiviusalEdit from "@/app/donor/donor-list/donor-indiviusal-edit";
// import DonorCompanyEdit from "@/app/donor/donor-list/donor-company-edit";
// import RecepitZeroList from "@/app/recepit-super/recepit-zero-list";
// import RecepitNonZeroList from "@/app/recepit-super/recepit-nonzero-list";
// import CreateViewer from "@/components/master-settings/viewers/create-viewer";
// import EditViewer from "@/components/master-settings/viewers/edit-viewer";
// import ChapterViewSuperAdmin from "@/components/master-settings/chapter-superadmin/chapter-view";
// import ChapterCreate from "@/components/master-settings/chapter-superadmin/chapter-create";
// import ChapterViewAdmin from "@/app/chapter/chapter-view-admin";
// import SuperReceiptDonor from "@/app/change-recepit-donor/change-recepit-donor";
// import MultipleRecepitList from "@/app/recepit-super/multiple-recepit-list";


const Login = lazy(() => import("@/app/auth/login"));
const DonorList = lazy(() => import("@/app/donor/donor-list/donor-list"));
const ReceiptCreate = lazy(() => import("@/app/donor/donor-list/receipt-create"));
const AllDownload = lazy(() => import("@/app/download/all-download"));
const NotFound = lazy(() => import("@/app/errors/not-found"));
const Home = lazy(() => import("@/app/home/home"));
const Chapter = lazy(() => import("@/app/master-settings/chapter"));
const Viewer = lazy(() => import("@/app/master-settings/viewer"));
const MembershipActive = lazy(() => import("@/app/membership/membership-active"));
const MemberShipDashboard = lazy(() => import("@/app/membership/membership-dashboard"));
const MemberShipInactive = lazy(() => import("@/app/membership/membership-inactive"));
const MembershipList = lazy(() => import("@/app/membership/membership-list"));
const FaqOther = lazy(() => import("@/app/other/faq/faq"));
const Notification = lazy(() => import("@/app/other/notification/notification"));
const Team = lazy(() => import("@/app/other/team/team"));
const Maintenance = lazy(() => import("@/components/common/maintenance"));
const ForgotPassword = lazy(() => import("@/components/forgot-password/forgot-password"));
const AuthRoute = lazy(() => import("./auth-route"));
const ProtectedRoute = lazy(() => import("./protected-route"));
const DonorCompanyCreate = lazy(() => import("@/app/donor/donor-list/donor-company-create"));
const DonorIndiviusalCreate = lazy(() => import("@/app/donor/donor-list/donor-indiviusal-create"));
const DonorView = lazy(() => import("@/app/donor/donor-list/donor-view"));
const DuplicateDonor = lazy(() => import("@/app/donor/duplicate/duplicate-donor"));
const DuplicateDonorEdit = lazy(() => import("@/app/donor/duplicate/duplicate-donor-edit"));
const Receipt = lazy(() => import("@/app/receipt/receipt"));
const ReceiptView = lazy(() => import("@/app/receipt/receipt-view"));
const DBStatement = lazy(() => import("@/app/report/10db-statement/10db-statement"));
const DonationSummary = lazy(() => import("@/app/report/donation/donation"));
const Donor = lazy(() => import("@/app/report/donor/donor"));
const Promoter = lazy(() => import("@/app/report/promoter/promoter"));
const ReceiptSummary = lazy(() => import("@/app/report/receipt/receipt"));
const SchoolSummary = lazy(() => import("@/app/report/school/school"));
const SuspenseSummary = lazy(() => import("@/app/report/suspense/suspense"));
const RepeatedDonor = lazy(() => import("@/app/school/repeated-donor/repeated-donor"));
const SchoolAllotLetter = lazy(() => import("@/app/school/school-alloted/allotment-letter"));
const SchoolAlloted = lazy(() => import("@/app/school/school-alloted/school-alloted"));
const SchoolAllotEdit = lazy(() => import("@/app/school/school-alloted/school-alloted-edit"));
const SchoolAllotView = lazy(() => import("@/app/school/school-alloted/school-alloted-view"));
const DonorDetails = lazy(() => import("@/app/school/school-allotment/donor-details"));
const SchoolToAllot = lazy(() => import("@/app/school/school-allotment/school-allotment"));
const SchoolList = lazy(() => import("@/app/school/school-list/school-list"));
const SchoolListView = lazy(() => import("@/app/school/school-list/school-list-view"));
const Settings = lazy(() => import("@/app/setting/setting"));
const AllotedList = lazy(() => import("@/app/school/repeated-donor/alloted-list"));
const DonorIndiviusalEdit = lazy(() => import("@/app/donor/donor-list/donor-indiviusal-edit"));
const DonorCompanyEdit = lazy(() => import("@/app/donor/donor-list/donor-company-edit"));
const RecepitZeroList = lazy(() => import("@/app/recepit-super/recepit-zero-list"));
const RecepitNonZeroList = lazy(() => import("@/app/recepit-super/recepit-nonzero-list"));
const CreateViewer = lazy(() => import("@/components/master-settings/viewers/create-viewer"));
const EditViewer = lazy(() => import("@/components/master-settings/viewers/edit-viewer"));
const ChapterViewSuperAdmin = lazy(() => import("@/components/master-settings/chapter-superadmin/chapter-view"));
const ChapterCreate = lazy(() => import("@/components/master-settings/chapter-superadmin/chapter-create"));
const ChapterViewAdmin = lazy(() => import("@/app/chapter/chapter-view-admin"));
const SuperReceiptDonor = lazy(() => import("@/app/change-recepit-donor/change-recepit-donor"));
const MultipleRecepitList = lazy(() => import("@/app/recepit-super/multiple-recepit-list"));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute />}>
        <Route path="/" element={<Login />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        <Route path="/forgot-password" element={
                    <Suspense fallback={<LoadingBar />}>
                      <ForgotPassword />
                    </Suspense>
                  } />
        <Route path="/maintenance" element={<Maintenance />} />
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        {/* dashboard  */}
                  <Route path="/home" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Home />
                    </Suspense>
                  } />
                  <Route path="/chapter" element={
                    <Suspense fallback={<LoadingBar />}>
                      <ChapterViewAdmin />
                    </Suspense>
                  } />
        
                  {/* master-setting */}
                  <Route path="/master/chapter" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Chapter />
                    </Suspense>
                  } />
                  <Route path="/master/chapter/create" element={
                    <Suspense fallback={<LoadingBar />}>
                      <ChapterCreate />
                    </Suspense>
                  } />
                  <Route path="/master/chapter/view/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <ChapterViewSuperAdmin />
                    </Suspense>
                  } />
                  <Route path="/master/viewer" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Viewer />
                    </Suspense>
                  } />
                  <Route path="/master/viewer/create" element={
                    <Suspense fallback={<LoadingBar />}>
                      <CreateViewer />
                    </Suspense>
                  } />
                  <Route path="/master/viewer/edit/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <EditViewer />
                    </Suspense>
                  } />
        
                  {/* membership  */}
                  <Route path="/membership/dashboard" element={
                    <Suspense fallback={<LoadingBar />}>
                      <MemberShipDashboard />
                    </Suspense>
                  } />
                  <Route path="/member-list" element={
                    <Suspense fallback={<LoadingBar />}>
                      <MembershipList />
                    </Suspense>
                  } />
                  <Route path="/membership/active" element={
                    <Suspense fallback={<LoadingBar />}>
                      <MembershipActive />
                    </Suspense>
                  } />
                  <Route path="/membership/inactive" element={
                    <Suspense fallback={<LoadingBar />}>
                      <MemberShipInactive />
                    </Suspense>
                  } />
        
                  {/* donor  */}
                  <Route path="/donor/donors" element={
                    <Suspense fallback={<LoadingBar />}>
                      <DonorList />
                    </Suspense>
                  } />
                  <Route
                    path="/donor/donors-indiviusal-create"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <DonorIndiviusalCreate />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/donor/donors-company-create"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <DonorCompanyCreate />
                      </Suspense>
                    }
                  />
                  <Route path="/donor/donor-view/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <DonorView />
                    </Suspense>
                  } />
                  <Route
                    path="/donor/donor-edit-indivisual/:id"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <DonorIndiviusalEdit />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/donor/donor-edit-company/:id"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <DonorCompanyEdit />
                      </Suspense>
                    }
                  />
                  <Route path="/donor/duplicate" element={
                    <Suspense fallback={<LoadingBar />}>
                      <DuplicateDonor />
                    </Suspense>
                  } />
                  <Route
                    path="/donor/duplicate-edit/:id"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <DuplicateDonorEdit />
                      </Suspense>
                    }
                  />
        
                  {/* receipt  */}
                  <Route path="/receipt" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Receipt />
                    </Suspense>
                  } />
                  <Route path="/receipt-view" element={
                    <Suspense fallback={<LoadingBar />}>
                      <ReceiptView />
                    </Suspense>
                  } />
               
                  <Route path="/donor-create-receipt/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <ReceiptCreate />
                    </Suspense>
                  } />
        
                  {/* school  */}
                  <Route path="/school/list" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SchoolList />
                    </Suspense>
                  } />
                  <Route path="/school/list-view/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SchoolListView />
                    </Suspense>
                  } />
                  <Route path="/school/to-allot" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SchoolToAllot />
                    </Suspense>
                  } />
                  <Route
                    path="/school/donor-details/:id/:year/:fyear"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <DonorDetails />
                      </Suspense>
                    }
                  />
                  <Route path="/school/alloted" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SchoolAlloted />
                    </Suspense>
                  } />
                  <Route
                    path="/school/allotedit/:id/:year"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <SchoolAllotEdit />
                      </Suspense>
                    }
                  />
                  <Route path="/school/allotview/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SchoolAllotView />
                    </Suspense>
                  } />
                  <Route path="/school/repeated" element={
                    <Suspense fallback={<LoadingBar />}>
                      <RepeatedDonor />
                    </Suspense>
                  } />
                  <Route
                    path="/school/allotment-letter/:id"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <SchoolAllotLetter />
                      </Suspense>
                    }
                  />
                  <Route path="/school/repeat-list/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <AllotedList />
                    </Suspense>
                  } />
        
                  {/* report  */}
                  <Route path="/report/suspense-summary" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SuspenseSummary />
                    </Suspense>
                  } />
                  <Route path="/report/school-summary" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SchoolSummary />
                    </Suspense>
                  } />
                  <Route path="/report/receipt-summary" element={
                    <Suspense fallback={<LoadingBar />}>
                      <ReceiptSummary />
                    </Suspense>
                  } />
                  <Route path="/report/donation-summary" element={
                    <Suspense fallback={<LoadingBar />}>
                      <DonationSummary />
                    </Suspense>
                  } />
                  <Route path="/report/promoter-summary" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Promoter />
                    </Suspense>
                  } />
                  <Route path="/report/donor-summary" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Donor />
                    </Suspense>
                  } />
                  <Route
                    path="/report/10db-statement-summary"
                    element={
                      <Suspense fallback={<LoadingBar />}>
                        <DBStatement />
                      </Suspense>
                    }
                  />
        
                  {/* download  */}
                  <Route path="/download" element={
                    <Suspense fallback={<LoadingBar />}>
                      <AllDownload />
                    </Suspense>
                  } />
        
                  {/* others  */}
                  <Route path="/other/faq" element={
                    <Suspense fallback={<LoadingBar />}>
                      <FaqOther />
                    </Suspense>
                  } />
                  <Route path="/other/team" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Team />
                    </Suspense>
                  } />
                  <Route path="/other/notification" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Notification />
                    </Suspense>
                  } />
        
                  {/* settings  */}
                  <Route path="/settings" element={
                    <Suspense fallback={<LoadingBar />}>
                      <Settings />
                    </Suspense>
                  } />
               
                  <Route path="/recepit/zero-list" element={
                    <Suspense fallback={<LoadingBar />}>
                      <RecepitZeroList />
                    </Suspense>
                  } />
                  <Route path="/recepit/non-zero-list/:id" element={
                    <Suspense fallback={<LoadingBar />}>
                      <RecepitNonZeroList />
                    </Suspense>
                  } />
                  <Route path="/recepit/change-donor" element={
                    <Suspense fallback={<LoadingBar />}>
                      <SuperReceiptDonor />
                    </Suspense>
                  } />
                  <Route path="/recepit/multiple-list" element={
                    <Suspense fallback={<LoadingBar />}>
                      <MultipleRecepitList />
                    </Suspense>
                  } />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
