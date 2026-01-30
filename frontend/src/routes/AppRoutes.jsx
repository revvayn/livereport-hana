import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../pages/Dashboard/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import RencanaPengiriman from "../pages/Dashboard/RencanaPengiriman";
import DataSync from "../pages/Dashboard/DataSync";
import EntryBahanbaku from "../pages/Dashboard/EntryBahanbaku";
import FormPlanning from "../pages/Dashboard/FormPlanning";
import RejectRateMechine from "../pages/Dashboard/RejectRateMechine";
import RejectRateFG from "../pages/Dashboard/RejectRateFG";
import RejectRateFI from "../pages/Dashboard/RejectRateFI";
import RejectRateHotpress from "../pages/Dashboard/RejectRateHotpress";
import RejectRateBlowdetector from "../pages/Dashboard/RejectRateBlowdetector";
import RejectRateSanding from "../pages/Dashboard/RejectRateSanding";
import BBPerforma from "../pages/Dashboard/BBPerforma";
import BBAsalLog from "../pages/Dashboard/BBAsalLog";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Dashboard/Profile";
import EntryBOM from "../pages/Dashboard/EntryBOM";

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        {/* ADMIN ONLY */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="rencana-pengiriman" element={<RencanaPengiriman />} />
          <Route path="data-sync" element={<DataSync />} />
          <Route path="bahanbaku" element={<EntryBahanbaku />} />

          {/* Reject Rate */}
          <Route path="reject-rate/machine" element={<RejectRateMechine />} />
          <Route path="reject-rate/grading-fg" element={<RejectRateFG />} />
          <Route path="reject-rate/grading-fi" element={<RejectRateFI />} />
          <Route path="reject-rate/hotpress" element={<RejectRateHotpress />} />
          <Route
            path="reject-rate/blow-detector"
            element={<RejectRateBlowdetector />}
          />
          <Route path="reject-rate/sanding" element={<RejectRateSanding />} />

          {/* Bahan Baku */}
          <Route path="bahan-baku/performa" element={<BBPerforma />} />
          <Route path="bahan-baku/asal-log" element={<BBAsalLog />} />
        </Route>

        {/* ADMIN & PLANNER */}
        <Route
          element={<ProtectedRoute allowedRoles={["Admin", "Planner"]} />}
        >
          <Route path="planning/form" element={<FormPlanning />} />
          <Route path="bom/entry" element={<EntryBOM />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
