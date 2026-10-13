import React from "react";
import { Outlet } from "react-router-dom";

const FinanceLayout = ({ children }) => {
  return children || <Outlet />;
};

export default FinanceLayout;
