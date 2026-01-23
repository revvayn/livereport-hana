import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../pages/Dashboard/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import RencanaPengiriman from "../pages/Dashboard/RencanaPengiriman";
import DataSync from "../pages/Dashboard/DataSync";
import EntryBahanbaku from "../pages/Dashboard/EntryBahanbaku";

import RejectRateMechine from "../pages/Dashboard/RejectRateMechine";
import RejectRateFG from "../pages/Dashboard/RejectRateFG";
import RejectRateFI from "../pages/Dashboard/RejectRateFI";
import RejectRateHotpress from "../pages/Dashboard/RejectRateHotpress";
import RejectRateBlowdetector from "../pages/Dashboard/RejectRateBlowdetector";
import RejectRateSanding from "../pages/Dashboard/RejectRateSanding";
import BBPerforma from "../pages/Dashboard/BBPerforma";

import Profile from "../pages/Dashboard/Profile";

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="rencana-pengiriman" element={<RencanaPengiriman />} />
        <Route path="data-sync" element={<DataSync />} />
        <Route path="bahanbaku" element={<EntryBahanbaku />} />

        {/* Reject Rate */}
        <Route path="reject-rate/machine" element={<RejectRateMechine />} />
        <Route path="reject-rate/grading-fg" element={<RejectRateFG />} />
        <Route path="reject-rate/grading-fi" element={<RejectRateFI />} />
        <Route path="reject-rate/hotpress" element={<RejectRateHotpress />} />
        <Route path="reject-rate/blow-detector" element={<RejectRateBlowdetector />} />
        <Route path="reject-rate/sanding" element={<RejectRateSanding />} />
        <Route path="bahan-baku/performa" element={<BBPerforma />} />
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
