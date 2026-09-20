import { Navigate, Outlet } from "react-router-dom";
import { useTransit } from "../context/TransitContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, activeRole } = useTransit();

  // 1. Check Authentication Status
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Map Active Role Alias to Standard Role String
  const normalizedRole =
    activeRole === "super_admin" || activeRole === "admin"
      ? "super_admin"
      : activeRole === "finance_admin" || activeRole === "finance"
      ? "finance_admin"
      : activeRole === "transport_manager" || activeRole === "transport"
      ? "transport_manager"
      : activeRole;

  // 3. Check Role Authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
