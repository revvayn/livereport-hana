import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import logo from "../assets/logo.png";

import {
  LayoutDashboard,
  User,
  Download,
  LogOut,
  Trees,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Factory,
  Layers,
  Flame,
  ScanLine,
  TrendingDown,
  TrendingUpIcon,
  Upload,
  Calendar,
} from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

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
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${collapsed ? "w-20" : "w-64"
          } bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 shadow-2xl`}
      >
        {/* BRAND */}
        <div className="flex flex-col items-center pt-4">
          <img
            src={logo}
            alt="BBP"
            className={`transition-all duration-300 ${collapsed ? "w-20" : "w-32"
              }`}
          />
        </div>

        {/* HEADER */}
        <div className="flex items-start justify-between px-4 py-4 border-b border-slate-800">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold">Live Report</h1>
              <p className="text-xs text-slate-400">
                PT Bahana Bhumiphala Persada
              </p>
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
        <nav className="flex-1 px-3 py-6 space-y-1 text-sm">
          {/* Dashboard */}
          <MenuLink
            to="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={collapsed}
          />
          {/* Rencana Pengiriman */}
          <MenuLink
            to="/dashboard/rencana-pengiriman"
            icon={Calendar}
            label="Rencana Pengiriman"
            collapsed={collapsed}
          />
          
          {/* Entry Data */}
          <EntryDropdown collapsed={collapsed} currentPath={location.pathname} />

          {/* Reject Rate */}
          <RejectRateDropdown
            collapsed={collapsed}
            currentPath={location.pathname}
          />

          {/* Bahan Baku */}
          <BahanBakuDropdown
            collapsed={collapsed}
            currentPath={location.pathname}
          />

          {/* Export */}
          <MenuLink
            to="/dashboard/export-data"
            icon={Upload}
            label="Export Data"
            collapsed={collapsed}
          />

          {/* Profile */}
          <MenuLink
            to="/dashboard/profile"
            icon={User}
            label="Profil"
            collapsed={collapsed}
          />
        </nav>

        {/* USER INFO */}
        <div className="px-4 py-4 border-t border-slate-800">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-sm font-medium truncate">
                {user?.nama_lengkap || user?.username}
              </p>
              <p className="text-xs text-slate-400">Akun Pengguna</p>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 text-sm"
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}

/* ================= MENU LINK ================= */
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
      <Icon size={18} />
      {!collapsed && label}
    </NavLink>
  );
}

/* ================= DROPDOWNS ================= */
function EntryDropdown({ collapsed, currentPath }) {
  const paths = ["/dashboard/data-sync", "/dashboard/reject-bahanbaku"];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? "Entry Data" : ""}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
      >
        <div className="flex items-center gap-3">
          <Download size={18} />
          {!collapsed && "Entry Data"}
        </div>
        {!collapsed && (
          <span
            className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-2 space-y-1">
          <SubMenuLink
            to="/dashboard/data-sync"
            icon={TrendingDown}
            label="Data Sync Reject"
          />
          <SubMenuLink
            to="/dashboard/bahanbaku"
            icon={Trees}
            label="Data Sync Bahan Baku"
          />
        </div>
      )}
    </div>
  );
}

function RejectRateDropdown({ collapsed, currentPath }) {
  const paths = [
    "/dashboard/reject-rate/machine",
    "/dashboard/reject-rate/grading-fg",
    "/dashboard/reject-rate/grading-fi",
    "/dashboard/reject-rate/sanding",
    "/dashboard/reject-rate/hotpress",
    "/dashboard/reject-rate/blow-detector",
  ];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? "Reject Rate" : ""}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
      >
        <div className="flex items-center gap-3">
          <BarChart3 size={18} />
          {!collapsed && "Reject Rate"}
        </div>
        {!collapsed && (
          <span
            className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-2 space-y-1">
          <SubMenuLink
            to="/dashboard/reject-rate/machine"
            icon={Factory}
            label="Machine"
          />
          <SubMenuLink
            to="/dashboard/reject-rate/grading-fg"
            icon={Layers}
            label="QC FG"
          />
          <SubMenuLink
            to="/dashboard/reject-rate/grading-fi"
            icon={Layers}
            label="QC FI"
          />
          <SubMenuLink
            to="/dashboard/reject-rate/sanding"
            icon={Layers}
            label="Sanding"
          />
          <SubMenuLink
            to="/dashboard/reject-rate/hotpress"
            icon={Flame}
            label="Hotpress"
          />
          <SubMenuLink
            to="/dashboard/reject-rate/blow-detector"
            icon={ScanLine}
            label="Blow Detector"
          />
        </div>
      )}
    </div>
  );
}

function BahanBakuDropdown({ collapsed, currentPath }) {
  const paths = [
    "/dashboard/bahan-baku/performa",
    "/dashboard/bahan-baku/asal-log",
  ];
  const isActive = paths.some((path) => currentPath.startsWith(path));
  const [open, setOpen] = useState(isActive);
  useEffect(() => setOpen(isActive), [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? "Bahan Baku" : ""}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition font-medium
          ${isActive
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
      >
        <div className="flex items-center gap-3">
          <Trees size={18} />
          {!collapsed && "Bahan Baku"}
        </div>
        {!collapsed && (
          <span
            className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-2 space-y-1">
          <SubMenuLink
            to="/dashboard/bahan-baku/performa"
            icon={TrendingUpIcon}
            label="Performa"
          />
          <SubMenuLink
            to="/dashboard/bahan-baku/asal-log"
            icon={Upload}
            label="Asal LOG"
          />
        </div>
      )}
    </div>
  );
}

/* ================= SUB MENU ================= */
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
      <Icon size={16} />
      {label}
    </NavLink>
  );
}
