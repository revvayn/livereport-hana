import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/api";
import logo from "../../assets/logo.png";

import {
  LayoutDashboard,
  User,
  User2,
  Download,
  LogOut,
  Trees,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Factory,
  CheckSquare,
  ClipboardCheck,
  Brush,
  Radar,
  Flame,
  TrendingDown,
  TrendingUpIcon,
  Upload,
  Calendar,
  FormInput,
  ListTodo,
  Users,
  Box,
  Layers,
  LayoutGrid,
  Cpu,
  Settings,
  Route,
  ChevronDown,
  ShoppingCart,
  FileText,
  Package,
  GanttChart,
  ClipboardList,
  Activity,
  Container,
  Warehouse,
  List
} from "lucide-react";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === "Admin";
  const isPlanner = user?.role === "Planner";
  const isReporter = user?.role === "Reporter";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleString("id-ID", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const logout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    await api.post("/auth/logout");
    navigate("/");
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-medium text-slate-500 text-sm italic">Memuat data...</div>;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${collapsed ? "w-20" : "w-64"} bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 shadow-2xl`}>
        <div className="flex flex-col items-center pt-6 pb-2">
          <img src={logo} alt="Logo" className={`transition-all duration-300 ${collapsed ? "w-10" : "w-28"}`} />
        </div>

        <div className="flex items-start justify-between px-4 py-4 border-b border-slate-800">
          {!collapsed && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-sm font-bold tracking-wider text-blue-400 uppercase">Live Report</h1>
              <p className="text-[10px] text-slate-400 leading-tight">PT Bahana Bhumiphala Persada</p>
              <p className="text-[10px] text-gray-500 mt-2">{time}</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto custom-scrollbar">
          <MenuLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />

          {isPlanner && (
            <>
              <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{!collapsed && "Planning & Master"}</div>
              <MasterDropdown collapsed={collapsed} currentPath={location.pathname} />
              <SalesDropdown collapsed={collapsed} currentPath={location.pathname} />
              <DemandDropdown collapsed={collapsed} currentPath={location.pathname} />
              <EntryMRPDropdown collapsed={collapsed} currentPath={location.pathname} />
            </>
          )}

          {isReporter && (
            <>
              <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{!collapsed && "Reporting Area"}</div>
              <MenuLink to="/dashboard/rencana-pengiriman" icon={Calendar} label="Rencana Kirim" collapsed={collapsed} />
              <EntryDropdown collapsed={collapsed} currentPath={location.pathname} />
              <RejectRateDropdown collapsed={collapsed} currentPath={location.pathname} />
              <BahanBakuDropdown collapsed={collapsed} currentPath={location.pathname} />
              <MenuLink to="/dashboard/export-data" icon={Upload} label="Export Report" collapsed={collapsed} />
            </>
          )}

          {isAdmin && (
            <MenuLink to="/dashboard/user" icon={User2} label="User Control" collapsed={collapsed} />
          )}

          <div className="pt-4 border-t border-slate-800/50 mt-4">
            {(isReporter || isPlanner) && (
              <MenuLink to="/dashboard/profile" icon={User} label="My Profile" collapsed={collapsed} />
            )}
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 bg-slate-950/30">
          {!collapsed && (
            <div className="mb-3 px-1">
              <p className="text-xs font-semibold text-white truncate">{user?.nama_lengkap || user?.username}</p>
              <p className="text-[10px] text-blue-400 uppercase tracking-tighter font-bold">{user?.role}</p>
            </div>
          )}
          <button onClick={logout} className={`w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-red-500/20`}>
            <LogOut size={16} />
            {!collapsed && <span className="font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg bg-slate-800">☰</button>
          <h1 className="text-sm font-bold tracking-tighter">BBP LIVE</h1>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}

/* ================= HELPERS & SUBCOMPONENTS ================= */

function MenuLink({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink to={to} end title={collapsed ? label : ""} className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium group
      ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
    }>
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function SubMenuLink({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all duration-200
      ${isActive ? "text-blue-400 font-bold translate-x-1" : "text-slate-500 hover:text-slate-200 hover:translate-x-1"}`
    }>
      <Icon size={14} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function DropdownWrapper({ icon: Icon, label, collapsed, isActive, open, setOpen, children }) {
  return (
    <div>
      <button onClick={() => setOpen(!open)} title={collapsed ? label : ""} className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 font-medium
        ${isActive ? "text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
        <div className="flex items-center gap-3">
          <Icon size={18} className={isActive ? "text-blue-400" : ""} />
          {!collapsed && <span>{label}</span>}
        </div>
        {!collapsed && <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />}
      </button>
      {!collapsed && open && (
        <div className="mt-1 ml-6 border-l border-slate-800 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

/* ================= REFINED DROPDOWNS ================= */

function MasterDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/master"];
  const isActive = currentPath.includes("/master");
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <DropdownWrapper icon={Warehouse} label="Master Data" collapsed={collapsed} isActive={isActive} open={open} setOpen={setOpen}>
      <SubMenuLink to="/dashboard/master/customers" icon={Users} label="Customers" />
      <SubMenuLink to="/dashboard/master/items" icon={Box} label="Items" />
      <SubMenuLink to="/dashboard/master/finishing-items" icon={Layers} label="Finishing Items" />
      <SubMenuLink to="/dashboard/master/assembly/pannel" icon={LayoutGrid} label="Assembly Pannel" />
      <SubMenuLink to="/dashboard/master/assembly/core" icon={Cpu} label="Assembly Core" />
      {/*<SubMenuLink to="/dashboard/master/machines" icon={Settings} label="Machines" />*/}
      {/*<SubMenuLink to="/dashboard/master/operations" icon={Activity} label="Operations" />*/}
      <SubMenuLink to="/dashboard/master/item-routings" icon={Route} label="Item Routing" />
    </DropdownWrapper>
  );
}

function SalesDropdown({ collapsed, currentPath }) {
  const isActive = currentPath.includes("/sales");
  const [open, setOpen] = useState(isActive);
  return (
    <DropdownWrapper icon={ShoppingCart} label="Sales Marketing" collapsed={collapsed} isActive={isActive} open={open} setOpen={setOpen}>
      <SubMenuLink to="/dashboard/sales/sales-orders" icon={FileText} label="Sales Orders" />
      <SubMenuLink to="/dashboard/sales/sales-order-items" icon={ClipboardList} label="Order Items" />
    </DropdownWrapper>
  );
}

function DemandDropdown({ collapsed, currentPath }) {
  const isActive = ["demand", "production", "packing", "finishing", "assembly"].some(p => currentPath.includes(p)) && !currentPath.includes("master");
  const [open, setOpen] = useState(isActive);
  return (
    <DropdownWrapper icon={GanttChart} label="Production Plan" collapsed={collapsed} isActive={isActive} open={open} setOpen={setOpen}>
      <SubMenuLink to="/dashboard/demand/form" icon={FormInput} label="Entry Demand" />
      <SubMenuLink to="/dashboard/production/kalender" icon={Calendar} label="Prod. Calendar" />
      <SubMenuLink to="/dashboard/production/list" icon={ListTodo} label="Prod. List" />
      <SubMenuLink to="/dashboard/packing" icon={Package} label="List Packing" />
      <SubMenuLink to="/dashboard/finishing" icon={Layers} label="List Finishing" />
      <SubMenuLink to="/dashboard/assembly" icon={LayoutGrid} label="List Assembly" />
    </DropdownWrapper>
  );
}

function EntryMRPDropdown({ collapsed, currentPath }) {
  const isActive = currentPath.includes("/bom");
  const [open, setOpen] = useState(isActive);
  return (
    <DropdownWrapper icon={Cpu} label="BOM" collapsed={collapsed} isActive={isActive} open={open} setOpen={setOpen}>
      <SubMenuLink to="/dashboard/bom/entry" icon={Download} label="Bill of Materials" />
    </DropdownWrapper>
  );
}

function EntryDropdown({ collapsed, currentPath }) {
  const isActive = currentPath.includes("data-sync") || currentPath.includes("bahanbaku");
  const [open, setOpen] = useState(isActive);
  return (
    <DropdownWrapper icon={Download} label="Data Sync" collapsed={collapsed} isActive={isActive} open={open} setOpen={setOpen}>
      <SubMenuLink to="/dashboard/data-sync" icon={TrendingDown} label="Sync Reject" />
      <SubMenuLink to="/dashboard/bahanbaku" icon={Trees} label="Sync Bahan Baku" />
    </DropdownWrapper>
  );
}

function RejectRateDropdown({ collapsed, currentPath }) {
  const isActive = currentPath.includes("reject-rate");
  const [open, setOpen] = useState(isActive);
  return (
    <DropdownWrapper icon={BarChart3} label="Quality Control" collapsed={collapsed} isActive={isActive} open={open} setOpen={setOpen}>
      <SubMenuLink to="/dashboard/reject-rate/machine" icon={Factory} label="Machine Analysis" />
      <SubMenuLink to="/dashboard/reject-rate/grading-fg" icon={CheckSquare} label="QC Finish Good" />
      <SubMenuLink to="/dashboard/reject-rate/grading-fi" icon={ClipboardCheck} label="QC Finish Item" />
      <SubMenuLink to="/dashboard/reject-rate/sanding" icon={Brush} label="Sanding Report" />
      <SubMenuLink to="/dashboard/reject-rate/hotpress" icon={Flame} label="Hotpress Report" />
      <SubMenuLink to="/dashboard/reject-rate/blow-detector" icon={Radar} label="Blow Detector" />
    </DropdownWrapper>
  );
}

function BahanBakuDropdown({ collapsed, currentPath }) {
  const isActive = currentPath.includes("bahan-baku");
  const [open, setOpen] = useState(isActive);
  return (
    <DropdownWrapper icon={Trees} label="Raw Material" collapsed={collapsed} isActive={isActive} open={open} setOpen={setOpen}>
      <SubMenuLink to="/dashboard/bahan-baku/performa" icon={TrendingUpIcon} label="Performance" />
      <SubMenuLink to="/dashboard/bahan-baku/asal-log" icon={Container} label="Log Origins" />
    </DropdownWrapper>
  );
}