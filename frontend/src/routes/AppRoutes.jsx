import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../pages/Dashboard/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import RencanaPengiriman from "../pages/Dashboard/RencanaPengiriman";
import DataSync from "../pages/Dashboard/DataSync";
import RejectRateMechine from "../pages/Dashboard/RejectRateMechine";
import Profile from "../pages/Dashboard/Profile";

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Dashboard Layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />           {/* /dashboard */}
        <Route path="rencana-pengiriman" element={<RencanaPengiriman />} />
        <Route path="data-sync" element={<DataSync />} /> {/* /dashboard/data-sync */}
        <Route path="reject-rate/machine" element={<RejectRateMechine />} />

        <Route path="profile" element={<Profile />} />   {/* /dashboard/profile */}

        {/* Tambahan jika ada menu lain */}
        {/* <Route path="reject-bahanbaku" element={<RejectBahanBaku />} /> */}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
