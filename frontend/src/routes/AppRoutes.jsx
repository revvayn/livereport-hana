import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../pages/Dashboard/Layout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Dashboard/Profile";

{/* Admin */ }
import User from "../pages/Dashboard/Admin/User";

{/* Live Report */ }
import RencanaPengiriman from "../pages/Dashboard/Live Report/RencanaPengiriman";
import DataSync from "../pages/Dashboard/Live Report/DataSync";
import EntryBahanbaku from "../pages/Dashboard/Live Report/EntryBahanbaku";
import RejectRateMechine from "../pages/Dashboard/Live Report/RejectRateMechine";
import RejectRateFG from "../pages/Dashboard/Live Report/RejectRateFG";
import RejectRateFI from "../pages/Dashboard/Live Report/RejectRateFI";
import RejectRateHotpress from "../pages/Dashboard/Live Report/RejectRateHotpress";
import RejectRateBlowdetector from "../pages/Dashboard/Live Report/RejectRateBlowdetector";
import RejectRateSanding from "../pages/Dashboard/Live Report/RejectRateSanding";
import BBPerforma from "../pages/Dashboard/Live Report/BBPerforma";
import BBAsalLog from "../pages/Dashboard/Live Report/BBAsalLog";

{/* MRP */ }
import Customers from "../pages/Dashboard/MRP/Customers";
import Items from "../pages/Dashboard/MRP/Items";
import FinishingItems from "../pages/Dashboard/MRP/FinishingItems"; // Import tunggal di sini
import AssemblyItems from "../pages/Dashboard/MRP/AssemblyItems";
import Machines from "../pages/Dashboard/MRP/Machines";
import Operations from "../pages/Dashboard/MRP/Operations";
import ItemRoutings from "../pages/Dashboard/MRP/ItemRoutings";
import SalesOrders from "../pages/Dashboard/MRP/SalesOrders";
import SalesOrderItems from "../pages/Dashboard/MRP/SalesOrderItems";
import FormDemand from "../pages/Dashboard/MRP/FormDemand";
import Kalender from "../pages/Dashboard/MRP/Kalender";
import PackingList from "../pages/Dashboard/MRP/PackingList";
import FinishingList from "../pages/Dashboard/MRP/FinishingList";
import AssemblyList from "../pages/Dashboard/MRP/AssemblyList";
import BOMCalculation from "../pages/Dashboard/MRP/BOMCalculation";
import EntryBOM from "../pages/Dashboard/MRP/EntryBOM";


function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        {/*ADMIN ONLY*/}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="user" element={<User />} />
        </Route>

        {/* REPORTER ONLY */}
        <Route element={<ProtectedRoute allowedRoles={["Reporter"]} />}>
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

          {/* Bahan Baku */}
          <Route path="bahan-baku/performa" element={<BBPerforma />} />
          <Route path="bahan-baku/asal-log" element={<BBAsalLog />} />
        </Route>

        {/* ADMIN & PLANNER */}
        <Route element={<ProtectedRoute allowedRoles={["Planner", "Admin"]} />}>
          {/* Menambahkan Admin ke Planner routes agar Admin bisa akses master data juga jika perlu */}
          <Route path="master/customers" element={<Customers />} />
          <Route path="master/items" element={<Items />} />
          <Route path="master/finishing-items" element={<FinishingItems />} />
          <Route path="master/assembly-items" element={<AssemblyItems />} />
          <Route path="master/machines" element={<Machines />} />
          <Route path="master/operations" element={<Operations />} />
          <Route path="master/item-routings" element={<ItemRoutings />} />
          <Route path="sales/sales-orders" element={<SalesOrders />} />
          <Route path="sales/sales-order-items" element={<SalesOrderItems />} />
          <Route path="demand/form" element={<FormDemand />} />
          <Route path="production/kalender" element={<Kalender />} />
          <Route path="production/kalender/:itemId" element={<Kalender />} />
          <Route path="packing" element={<PackingList />} />
          <Route path="finishing" element={<FinishingList />} />
          <Route path="assembly" element={<AssemblyList />} />
          <Route path="demand/bom-calculation" element={<BOMCalculation />} />
          <Route path="bom/entry" element={<EntryBOM />} />
        </Route>

        {/* PROFILE ACCESSIBLE BY ALL ROLES */}
        <Route element={<ProtectedRoute allowedRoles={["Planner", "Reporter", "Admin"]} />}>
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;