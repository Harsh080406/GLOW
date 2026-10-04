import React from "react";
import { Outlet } from "react-router-dom";

/**
 * DriverLayout — Clean pass-through container for Driver Cockpit.
 * Prevents duplicate topbars and allows DriverDashboardView to control full-screen layout.
 */
const DriverLayout = ({ children }) => {
  return children || <Outlet />;
};

export default DriverLayout;
