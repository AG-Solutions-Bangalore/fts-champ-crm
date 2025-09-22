import {   Route, Routes } from "react-router-dom";



import AuthRoute from "./AuthRoute";
import Login from "@/app/auth/Login";
import ForgotPassword from "@/components/ForgotPassword/ForgotPassword";
import Maintenance from "@/components/common/Maintenance";
import ProtectedRoute from "./ProtectedRoute";

import NotFound from "@/app/errors/NotFound";
import Home from "@/app/home/Home";

import DayBookReport from "@/app/dayBook/DayBookReport";
import Other from "@/app/other/Other";


function AppRoutes() {
  return (

      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/maintenance" element={<Maintenance />} />
           <Route path="/home" element={<Home />} />
           <Route path="/other" element={<Other />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
         
       
          <Route path="/day-book" element={<DayBookReport />} />
         
         
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default AppRoutes;