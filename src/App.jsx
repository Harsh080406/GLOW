import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TransitProvider } from "./shared/context/TransitContext";

// Shared Core Components
import SplashScreen from "./shared/components/SplashScreen";
import ErrorBoundary from "./shared/components/ErrorBoundary";

// ── 1. Public & Auth Module ────────────────────────────────
import {
  LandingPageView,
  LoginPageView,
} from "./modules/public";

// ── 2. Student Mobility Module ─────────────────────────────
import {
  StudentLayout,
  StudentDashboardView,
  StudentMyBusView,
  StudentMyRouteView,
  StudentScheduleView,
  LiveTrackingView,
  StudentTransportPassView,
  StudentFeesView,
  NotificationsView,
  StudentComplaintsView,
  StudentEmergencyView,
  StudentProfileView,
} from "./modules/student";

// ── 3. Driver Mobile Cockpit Module ────────────────────────
import {
  DriverLayout,
  DriverDashboardView,
} from "./modules/driver";

// ── 4. Super Admin Module ──────────────────────────────────
import {
  AdminLayout,
  AdminDashboardView,
  AdminUserManagementView,
  ManageStudentsView,
  ManageFleetView,
  ManageDriversView,
  ManageRoutesView,
  AdminSchedulesView,
  AdminTrackingView,
  AdminFinanceOverviewView,
  AdminMaintenanceView,
  AdminComplaintsView,
  AdminEmergenciesView,
  AdminReportsView,
  AdminSettingsView,
  AdminProfileView,
} from "./modules/admin";

// ── 5. Transport Operations Module ─────────────────────────
import {
  TransportLayout,
  TransportDashboardView,
  StudentTransportView,
  TransportReportsView,
} from "./modules/transport";

// ── 6. Finance & Billing Module ────────────────────────────
import {
  FinanceLayout,
  FinanceDashboardView,
  FinanceStudentsFeesView,
  FeeStructureView,
  FinancePaymentsView,
  PendingFeesView,
  PaymentVerificationView,
  FinanceRefundsView,
  DiscountsScholarshipsView,
  ReceiptsInvoicesView,
  FinancialReportsView,
  FinanceAuditLogsView,
  FinanceProfileView,
} from "./modules/finance";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <TransitProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* ── Public & Authentication ──────────────────── */}
            <Route path="/" element={<LandingPageView />} />
            <Route path="/landing" element={<LandingPageView />} />
            <Route path="/login" element={<LoginPageView />} />
            <Route path="/login/admin" element={<LoginPageView />} />
            <Route path="/login/student" element={<LoginPageView />} />
            <Route path="/login/driver" element={<LoginPageView />} />

            {/* ── 1. Student Mobility Portal ───────────────── */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboardView />} />
              <Route path="my-bus" element={<StudentMyBusView />} />
              <Route path="my-route" element={<StudentMyRouteView />} />
              <Route path="schedule" element={<StudentScheduleView />} />
              <Route path="timetable" element={<StudentScheduleView />} />
              <Route path="tracking" element={<LiveTrackingView />} />
              <Route path="pass" element={<StudentTransportPassView />} />
              <Route path="fees" element={<StudentFeesView />} />
              <Route path="notifications" element={<NotificationsView />} />
              <Route path="complaints" element={<StudentComplaintsView />} />
              <Route path="emergency" element={<StudentEmergencyView />} />
              <Route path="profile" element={<StudentProfileView />} />
            </Route>

            {/* ── 2. Driver Mobile Cockpit ─────────────────── */}
            <Route path="/driver" element={<DriverLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboardView />} />
            </Route>

            {/* ── 3. Super Admin Command Center ────────────── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardView />} />
              <Route path="users" element={<AdminUserManagementView />} />
              <Route path="students" element={<ManageStudentsView />} />
              <Route path="fleet" element={<ManageFleetView />} />
              <Route path="drivers" element={<ManageDriversView />} />
              <Route path="routes" element={<ManageRoutesView />} />
              <Route path="schedules" element={<AdminSchedulesView />} />
              <Route path="tracking" element={<AdminTrackingView />} />
              <Route path="finance" element={<AdminFinanceOverviewView />} />
              <Route path="maintenance" element={<AdminMaintenanceView />} />
              <Route path="complaints" element={<AdminComplaintsView />} />
              <Route path="emergencies" element={<AdminEmergenciesView />} />
              <Route path="reports" element={<AdminReportsView />} />
              <Route path="settings" element={<AdminSettingsView />} />
              <Route path="profile" element={<AdminProfileView />} />
            </Route>
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

            {/* ── 4. Transport Operations Hub ──────────────── */}
            <Route path="/transport" element={<TransportLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TransportDashboardView />} />
              <Route path="fleet" element={<ManageFleetView />} />
              <Route path="drivers" element={<ManageDriversView />} />
              <Route path="routes" element={<ManageRoutesView />} />
              <Route path="schedules" element={<AdminSchedulesView />} />
              <Route path="tracking" element={<AdminTrackingView />} />
              <Route path="students" element={<StudentTransportView />} />
              <Route path="maintenance" element={<AdminMaintenanceView />} />
              <Route path="complaints" element={<AdminComplaintsView />} />
              <Route path="emergencies" element={<AdminEmergenciesView />} />
              <Route path="reports" element={<TransportReportsView />} />
            </Route>

            {/* ── 5. Finance & Billing Division ────────────── */}
            <Route path="/finance" element={<FinanceLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FinanceDashboardView />} />
              <Route path="students" element={<FinanceStudentsFeesView />} />
              <Route path="fee-structure" element={<FeeStructureView />} />
              <Route path="payments" element={<FinancePaymentsView />} />
              <Route path="pending" element={<PendingFeesView />} />
              <Route path="verification" element={<PaymentVerificationView />} />
              <Route path="refunds" element={<FinanceRefundsView />} />
              <Route path="discounts" element={<DiscountsScholarshipsView />} />
              <Route path="receipts" element={<ReceiptsInvoicesView />} />
              <Route path="reports" element={<FinancialReportsView />} />
              <Route path="audit" element={<FinanceAuditLogsView />} />
              <Route path="profile" element={<FinanceProfileView />} />
            </Route>

            {/* ── Catch-all ────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TransitProvider>
  );
}

export default App;
