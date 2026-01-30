import { Navigate, Outlet, useOutletContext } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const outlet = useOutletContext();
  const user = outlet?.user; // ✅ AMAN

  // ⛔ Belum login / context belum siap
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ⛔ Role tidak diizinkan
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Lolos
  return <Outlet />;
}
