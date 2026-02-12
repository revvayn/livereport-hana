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
  Form,
  ListTodo,
} from "lucide-react";
import { is } from "date-fns/locale";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  /* ================= ROLE HELPER ================= */
  const isAdmin = user?.role === "Admin";
  const isPlanner = user?.role === "Planner";
  const isReporter = user?.role === "Reporter";

  /* ================= CLOCK ================= */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= FETCH USER ================= */
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

  /* ================= LOGOUT ================= */
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* OVERLAY MOBILE */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "w-20" : "w-64"}
          bg-slate-900 text-slate-100
          flex flex-col transition-all duration-300 shadow-2xl
        `}
      >
        {/* BRAND */}
        <div className="flex flex-col items-center pt-4">
          <img
            src={logo}
            alt="BBP"
            className={`transition-all duration-300 ${collapsed ? "w-10" : "w-32"}`}
          />
        </div>

        {/* HEADER */}
        <div className="flex items-start justify-between px-4 py-4 border-b border-slate-800">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold">Live Report</h1>
              <p className="text-xs text-slate-400">PT Bahana Bhumiphala Persada</p>
              <p className="text-xs text-gray-400 mt-2">{time}</p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-6 space-y-1 text-sm overflow-y-auto overflow-x-hidden">
          {/* ALL USER */}
          <MenuLink
            to="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={collapsed}
          />

          {/* PLANNING (Planner Only) */}
          {isPlanner && (
            <>
              <MasterDropdown collapsed={collapsed} currentPath={location.pathname} />
              <SalesDropdown collapsed={collapsed} currentPath={location.pathname} />
              <DemandDropdown collapsed={collapsed} currentPath={location.pathname} />
              <ProductionDropdown collapsed={collapsed} currentPath={location.pathname} />
              <EntryMRPDropdown collapsed={collapsed} currentPath={location.pathname} />
            </>
          )}

          {/* REPORTER ONLY */}
          {isReporter && (
            <>
              <MenuLink
                to="/dashboard/rencana-pengiriman"
                icon={Calendar}
                label="Rencana Pengiriman"
                collapsed={collapsed}
              />
              <EntryDropdown collapsed={collapsed} currentPath={location.pathname} />
              <RejectRateDropdown collapsed={collapsed} currentPath={location.pathname} />
              <BahanBakuDropdown collapsed={collapsed} currentPath={location.pathname} />
              <MenuLink
                to="/dashboard/export-data"
                icon={Upload}
                label="Export Data"
                collapsed={collapsed}
              />
            </>
          )}

          {/* ADMIN ONLY */}
          {isAdmin && (
            <MenuLink
              to="/dashboard/user"
              icon={User2}
              label="User Management"
              collapsed={collapsed}
            />
          )}

          {/* Profile */}
          {(isReporter || isPlanner) && (
            <MenuLink
              to="/dashboard/profile"
              icon={User}
              label="Profil"
              collapsed={collapsed}
            />
          )}
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="px-4 py-4 border-t border-slate-800">
          {!collapsed && (
            <div className="mb-3 px-1">
              <p className="text-sm font-medium truncate">
                {user?.nama_lengkap || user?.username}
              </p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 text-sm transition"
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-slate-800"
          >
            ☰
          </button>
          <h1 className="text-sm font-semibold">Live Report</h1>
          <div className="w-8"></div>
        </div>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENT: MENU LINK ================= */
function MenuLink({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      title={collapsed ? label : ""}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium
          ${isActive
          ? "bg-slate-800 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

/* ================= COMPONENT: SUB MENU LINK ================= */
function SubMenuLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 ml-6 px-3 py-2 rounded-lg text-sm transition
          ${isActive
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

/* ================= DROPDOWN COMPONENTS ================= */

function EntryDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/data-sync", "/dashboard/bahanbaku"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? "Entry Data" : ""}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <Download size={18} />
          {!collapsed && "Entry Data"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/data-sync" icon={TrendingDown} label="Data Sync Reject" />
          <SubMenuLink to="/dashboard/bahanbaku" icon={Trees} label="Data Sync Bahan Baku" />
        </div>
      )}
    </div>
  );
}

function MasterDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/master/customers", "/dashboard/master/items", "/dashboard/master/machines", "/dashboard/master/operations", "/dashboard/master/item-routings"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <ListTodo size={18} />
          {!collapsed && "Master Data"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/master/customers" icon={Form} label="Customers" />
          <SubMenuLink to="/dashboard/master/items" icon={Form} label="Items" />
          <SubMenuLink to="/dashboard/master/machines" icon={Form} label="Machines" />
          <SubMenuLink to="/dashboard/master/operations" icon={Form} label="Operations" />
          <SubMenuLink to="/dashboard/master/item-routings" icon={Form} label="Item Routing" />
        </div>
      )}
    </div>
  );
}

function SalesDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/sales/sales-orders", "/dashboard/sales/sales-order-items"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <ListTodo size={18} />
          {!collapsed && "Sales"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/sales/sales-orders" icon={Form} label="Sales Orders" />
          <SubMenuLink to="/dashboard/sales/sales-order-items" icon={Form} label="Sales Order Items" />
        </div>
      )}
    </div>
  );
}

function DemandDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/demand/form", "/dashboard/demand/list"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <ListTodo size={18} />
          {!collapsed && "Demand"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/demand/form" icon={Form} label="Form Demand" />
          <SubMenuLink to="/dashboard/demand/list" icon={Form} label="List Demand" />
        </div>
      )}
    </div>
  );
}

function ProductionDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/production/order"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <ListTodo size={18} />
          {!collapsed && "Production"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/production/order" icon={Form} label="Production Order" />
        </div>
      )}
    </div>
  );
}

function EntryMRPDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/bom/entry"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <ListTodo size={18} />
          {!collapsed && "MRP Entry"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/bom/entry" icon={Download} label="Bill of Materials" />
        </div>
      )}
    </div>
  );
}

function RejectRateDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/reject-rate/machine", "/dashboard/reject-rate/grading-fg", "/dashboard/reject-rate/grading-fi", "/dashboard/reject-rate/sanding", "/dashboard/reject-rate/hotpress", "/dashboard/reject-rate/blow-detector"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <BarChart3 size={18} />
          {!collapsed && "Reject Rate"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/reject-rate/machine" icon={Factory} label="Machine" />
          <SubMenuLink to="/dashboard/reject-rate/grading-fg" icon={CheckSquare} label="QC FG" />
          <SubMenuLink to="/dashboard/reject-rate/grading-fi" icon={ClipboardCheck} label="QC FI" />
          <SubMenuLink to="/dashboard/reject-rate/sanding" icon={Brush} label="Sanding" />
          <SubMenuLink to="/dashboard/reject-rate/hotpress" icon={Flame} label="Hotpress" />
          <SubMenuLink to="/dashboard/reject-rate/blow-detector" icon={Radar} label="Blow Detector" />
        </div>
      )}
    </div>
  );
}

function BahanBakuDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/bahan-baku/performa", "/dashboard/bahan-baku/asal-log"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <div className="flex items-center gap-3">
          <Trees size={18} />
          {!collapsed && "Bahan Baku"}
        </div>
        {!collapsed && <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/dashboard/bahan-baku/performa" icon={TrendingUpIcon} label="Performa" />
          <SubMenuLink to="/dashboard/bahan-baku/asal-log" icon={Upload} label="Asal LOG" />
        </div>
      )}
    </div>
  );
}