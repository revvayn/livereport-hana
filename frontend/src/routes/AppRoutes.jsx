import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../pages/Dashboard/Layout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import RencanaPengiriman from "../pages/Dashboard/Live Report/RencanaPengiriman";
import DataSync from "../pages/Dashboard/Live Report/DataSync";
import EntryBahanbaku from "../pages/Dashboard/Live Report/EntryBahanbaku";
import FormDemand from "../pages/Dashboard/MRP/FormDemand";
import DemandList from "../pages/Dashboard/MRP/DemandList";
import PlannedOrder from "../pages/Dashboard/MRP/PlannedOrder";
import BOMCalculation from "../pages/Dashboard/MRP/BOMCalculation";
import RejectRateMechine from "../pages/Dashboard/Live Report/RejectRateMechine";
import RejectRateFG from "../pages/Dashboard/Live Report/RejectRateFG";
import RejectRateFI from "../pages/Dashboard/Live Report/RejectRateFI";
import RejectRateHotpress from "../pages/Dashboard/Live Report/RejectRateHotpress";
import RejectRateBlowdetector from "../pages/Dashboard/Live Report/RejectRateBlowdetector";
import RejectRateSanding from "../pages/Dashboard/Live Report/RejectRateSanding";
import BBPerforma from "../pages/Dashboard/Live Report/BBPerforma";
import BBAsalLog from "../pages/Dashboard/Live Report/BBAsalLog";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Dashboard/Profile";
import EntryBOM from "../pages/Dashboard/MRP/EntryBOM";
import EntryInventroy from "../pages/Dashboard/MRP/EntryInventory"
import EntryMasteritems from "../pages/Dashboard/MRP/EntryMasteritems";
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
          <Route path="demand/form" element={<FormDemand />} />
          <Route path="demand/list"element={<DemandList />}/>
          <Route path="demand/planned-order" element={<PlannedOrder />} />
          <Route path="demand/bom-calculation" element={<BOMCalculation />} />
          <Route path="master-items/entry" element={<EntryMasteritems />} />
          <Route path="bom/entry" element={<EntryBOM />} />
          <Route path="inventory/entry" element={<EntryInventroy />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
