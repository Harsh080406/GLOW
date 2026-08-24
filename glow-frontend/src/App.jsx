import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TransitProvider } from "./context/TransitContext";

// Core
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";

// Landing & Universal Login
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";

// ── Student pages ──────────────────────────────────────────
import StudentDashboard from "./pages/StudentDashboard";
import StudentMyBus from "./pages/StudentMyBus";
import StudentMyRoute from "./pages/StudentMyRoute";
import StudentSchedule from "./pages/StudentSchedule";
import StudentTransportPass from "./pages/StudentTransportPass";
import StudentFees from "./pages/StudentFees";
import StudentComplaints from "./pages/StudentComplaints";
import StudentEmergency from "./pages/StudentEmergency";
import StudentProfile from "./pages/StudentProfile";
import Notifications from "./pages/Notifications";
import LiveTracking from "./pages/LiveTracking";

// ── Driver pages ───────────────────────────────────────────
import DriverDashboard from "./pages/DriverDashboard";

// ── Super Admin pages ──────────────────────────────────────
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import ManageFleet from "./pages/ManageFleet";
import ManageRoutes from "./pages/ManageRoutes";
import ManageDrivers from "./pages/ManageDrivers";
import ManageStudents from "./pages/ManageStudents";
import AdminSchedules from "./pages/AdminSchedules";
import AdminTracking from "./pages/AdminTracking";
import AdminFinanceOverview from "./pages/AdminFinanceOverview";
import AdminMaintenance from "./pages/AdminMaintenance";
import AdminComplaints from "./pages/AdminComplaints";
import AdminEmergencies from "./pages/AdminEmergencies";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminProfile from "./pages/AdminProfile";

// ── Transport Manager pages ────────────────────────────────
import TransportDashboard from "./pages/TransportDashboard";
import StudentTransport from "./pages/StudentTransport";
import TransportReports from "./pages/TransportReports";

// ── Finance Admin pages ────────────────────────────────────
import FinanceDashboard from "./pages/FinanceDashboard";
import FinanceStudentsFees from "./pages/FinanceStudentsFees";
import FeeStructure from "./pages/FeeStructure";
import FinancePayments from "./pages/FinancePayments";
import PendingFees from "./pages/PendingFees";
import PaymentVerification from "./pages/PaymentVerification";
import FinanceRefunds from "./pages/FinanceRefunds";
import DiscountsScholarships from "./pages/DiscountsScholarships";
import ReceiptsInvoices from "./pages/ReceiptsInvoices";
import FinancialReports from "./pages/FinancialReports";
import FinanceAuditLogs from "./pages/FinanceAuditLogs";
import FinanceProfile from "./pages/FinanceProfile";

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
            {/* ── Public Landing Page & Login ─────────────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/admin" element={<LoginPage />} />
            <Route path="/login/student" element={<LoginPage />} />
            <Route path="/login/driver" element={<LoginPage />} />

            {/* ── 1. Student Portal Routes ─────────────────── */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/my-bus" element={<StudentMyBus />} />
            <Route path="/student/my-route" element={<StudentMyRoute />} />
            <Route path="/student/schedule" element={<StudentSchedule />} />
            <Route path="/student/timetable" element={<StudentSchedule />} />
            <Route path="/student/tracking" element={<LiveTracking />} />
            <Route path="/student/pass" element={<StudentTransportPass />} />
            <Route path="/student/fees" element={<StudentFees />} />
            <Route path="/student/notifications" element={<Notifications />} />
            <Route path="/student/complaints" element={<StudentComplaints />} />
            <Route path="/student/emergency" element={<StudentEmergency />} />
            <Route path="/student/profile" element={<StudentProfile />} />

            {/* ── 2. Driver Portal Routes ──────────────────── */}
            <Route path="/driver/dashboard" element={<DriverDashboard />} />

            {/* ── 3. Super Admin Routes ────────────────────── */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/fleet" element={<ManageFleet />} />
            <Route path="/admin/drivers" element={<ManageDrivers />} />
            <Route path="/admin/routes" element={<ManageRoutes />} />
            <Route path="/admin/schedules" element={<AdminSchedules />} />
            <Route path="/admin/tracking" element={<AdminTracking />} />
            <Route path="/admin/finance" element={<AdminFinanceOverview />} />
            <Route path="/admin/maintenance" element={<AdminMaintenance />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/emergencies" element={<AdminEmergencies />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/dashboard" element={<AdminDashboard />} />

            {/* ── 4. Transport Manager Routes ──────────────── */}
            <Route path="/transport/dashboard" element={<TransportDashboard />} />
            <Route path="/transport/fleet" element={<ManageFleet />} />
            <Route path="/transport/drivers" element={<ManageDrivers />} />
            <Route path="/transport/routes" element={<ManageRoutes />} />
            <Route path="/transport/schedules" element={<AdminSchedules />} />
            <Route path="/transport/tracking" element={<AdminTracking />} />
            <Route path="/transport/students" element={<StudentTransport />} />
            <Route path="/transport/maintenance" element={<AdminMaintenance />} />
            <Route path="/transport/complaints" element={<AdminComplaints />} />
            <Route path="/transport/emergencies" element={<AdminEmergencies />} />
            <Route path="/transport/reports" element={<TransportReports />} />

            {/* ── 5. Finance Admin Routes ──────────────────── */}
            <Route path="/finance/dashboard" element={<FinanceDashboard />} />
            <Route path="/finance/students" element={<FinanceStudentsFees />} />
            <Route path="/finance/fee-structure" element={<FeeStructure />} />
            <Route path="/finance/payments" element={<FinancePayments />} />
            <Route path="/finance/pending" element={<PendingFees />} />
            <Route path="/finance/verification" element={<PaymentVerification />} />
            <Route path="/finance/refunds" element={<FinanceRefunds />} />
            <Route path="/finance/discounts" element={<DiscountsScholarships />} />
            <Route path="/finance/receipts" element={<ReceiptsInvoices />} />
            <Route path="/finance/reports" element={<FinancialReports />} />
            <Route path="/finance/audit" element={<FinanceAuditLogs />} />
            <Route path="/finance/profile" element={<FinanceProfile />} />

            {/* ── Catch-all ────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TransitProvider>
  );
}

export default App;
