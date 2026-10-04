import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const TransitContext = createContext(null);

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error("useTransit must be used within a TransitProvider");
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:5000";

export const TransitProvider = ({ children }) => {
  // Authentication & Role State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("glow_access_token") || null);
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem("glow_active_role") || "student");

  // Loading, Error, and WebSocket Connection State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  // User Profile States
  const [currentStudent, setCurrentStudent] = useState({
    id: "GSFC20260125",
    name: "Rahul Sharma",
    avatar: "RS",
    department: "Computer Science",
    email: "student@glowbus.edu",
    phone: "+91 98765 43210",
    busId: "BUS-104",
    routeName: "GSFC University ↔ Fatehgunj",
    pickupStop: "Fatehgunj Bus Stop",
    pickupTime: "07:45 AM",
    passStatus: "ACTIVE",
    feeStatus: "PARTIAL",
    pendingFee: 5000,
  });

  const [currentDriver, setCurrentDriver] = useState({
    id: "DRV-102",
    name: "Mahesh Patel",
    avatar: "MP",
    phone: "+91 98765 11111",
    email: "driver@glowbus.edu",
    assignedBus: "BUS-104",
    routeName: "GSFC University ↔ Fatehgunj",
    licenseNo: "GJ-06-2018-9842",
    rating: 4.9,
  });

  const [currentAdmin, setCurrentAdmin] = useState({
    id: "ADM-2026-001",
    name: "Dr. Arvind Patel",
    avatar: "AP",
    role: "Super Admin",
    email: "admin@glowbus.edu",
  });

  const [currentFinanceAdmin, setCurrentFinanceAdmin] = useState({
    id: "FIN-2026-001",
    name: "CMA Rajesh Dave",
    avatar: "RD",
    role: "Chief Finance Officer",
    email: "finance@glowbus.edu",
  });

  // Master Data & Live State Collections
  const [activeTrip, setActiveTrip] = useState({
    isActive: true,
    tripId: "TRIP-2026-0822-01",
    busId: "BUS-104",
    routeId: "R-04",
    driverName: "Mahesh Patel",
    status: "ON_ROUTE",
    currentSpeed: 42,
    etaMinutes: 6,
    coordinates: { lat: 22.3412, lng: 73.1710 },
    progressPercent: 46,
  });

  const [liveBusTelemetry, setLiveBusTelemetry] = useState({});
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);

  // Finance & Accounts Master States
  const [searchQuery, setSearchQuery] = useState("");
  
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-2026-081",
      receiptId: "REC-2026-0001",
      studentName: "Rahul Sharma",
      studentId: "UNI20260125",
      dept: "Computer Science",
      route: "R-04 Fatehgunj - GSFC",
      amount: 9500,
      date: "2026-08-15",
      method: "UPI (Google Pay)",
      refNo: "UPI-9842109842",
      status: "SUCCESS",
    },
    {
      id: "TXN-2026-082",
      receiptId: "REC-2026-0002",
      studentName: "Priya Patel",
      studentId: "UNI20260142",
      dept: "Information Technology",
      route: "R-03 Manjalpur",
      amount: 9500,
      date: "2026-08-16",
      method: "Bank Challan (SBI)",
      refNo: "CHL-SBI-884920",
      status: "SUCCESS",
    },
    {
      id: "TXN-2026-083",
      receiptId: "REC-2026-0003",
      studentName: "Ananya Desai",
      studentId: "UNI20260188",
      dept: "Mechanical Engineering",
      route: "R-01 Alkapuri",
      amount: 6000,
      date: "2026-08-18",
      method: "Net Banking (HDFC)",
      refNo: "HDFC-44910283",
      status: "SUCCESS",
    },
    {
      id: "TXN-2026-084",
      receiptId: "REC-2026-0004",
      studentName: "Siddharth Joshi",
      studentId: "UNI20260210",
      dept: "Civil Engineering",
      route: "R-06 Gotri",
      amount: 14000,
      date: "2026-08-19",
      method: "Debit Card (ICICI)",
      refNo: "POS-99382104",
      status: "SUCCESS",
    },
    {
      id: "TXN-2026-085",
      receiptId: "REC-2026-0005",
      studentName: "Kavita Shah",
      studentId: "UNI20260235",
      dept: "Electronics & Comm",
      route: "R-04 Fatehgunj - GSFC",
      amount: 9500,
      date: "2026-08-20",
      method: "UPI (PhonePe)",
      refNo: "UPI-771928401",
      status: "SUCCESS",
    },
  ]);

  const [offlinePayments, setOfflinePayments] = useState([
    {
      id: "VER-2026-001",
      studentName: "Priya Patel",
      studentId: "UNI20260142",
      dept: "Information Technology",
      amount: 9500,
      method: "Bank Challan (SBI)",
      refNo: "CHL-SBI-884920",
      date: "2026-08-20",
      status: "PENDING",
      slipUrl: "challan_slip_sample.pdf",
    },
    {
      id: "VER-2026-002",
      studentName: "Devang Mehta",
      studentId: "UNI20260199",
      dept: "Chemical Engineering",
      amount: 6000,
      method: "Cash Counter (Receipt #104)",
      refNo: "CTR-2026-104",
      date: "2026-08-21",
      status: "PENDING",
      slipUrl: "cash_counter_slip.pdf",
    },
    {
      id: "VER-2026-003",
      studentName: "Manish Solanki",
      studentId: "UNI20260177",
      dept: "Mechanical Engineering",
      amount: 9500,
      method: "Demand Draft (PNB)",
      refNo: "DD-PNB-004918",
      date: "2026-08-14",
      status: "VERIFIED",
      slipUrl: "dd_slip.pdf",
    },
  ]);

  const [refundRequests, setRefundRequests] = useState([
    {
      id: "REF-2026-001",
      studentName: "Ananya Desai",
      studentId: "UNI20260188",
      originalPaid: 15000,
      originalAmount: 15000,
      claimedAmount: 7500,
      refundAmount: 7500,
      reason: "Semester Exchange Program Transfer to Germany",
      date: "2026-08-18",
      status: "Pending",
    },
    {
      id: "REF-2026-002",
      studentName: "Chirag Verma",
      studentId: "UNI20260302",
      originalPaid: 9500,
      originalAmount: 9500,
      claimedAmount: 4750,
      refundAmount: 4750,
      reason: "Residential hostel room allocation on campus",
      date: "2026-08-12",
      status: "Approved",
    },
  ]);

  const [feeStructures, setFeeStructures] = useState([
    {
      id: "FEE-2026-001",
      name: "Annual Campus Transit — Zone A (Local Intra-City)",
      type: "Annual",
      zone: "Zone A",
      amount: 6000,
      dueDate: "15 Sep 2026",
      status: "Active",
    },
    {
      id: "FEE-2026-002",
      name: "Annual Campus Transit — Zone B (Suburban Corridor)",
      type: "Annual",
      zone: "Zone B",
      amount: 9500,
      dueDate: "15 Sep 2026",
      status: "Active",
    },
    {
      id: "FEE-2026-003",
      name: "Annual Campus Transit — Zone C (Express Outskirts)",
      type: "Annual",
      zone: "Zone C",
      amount: 14000,
      dueDate: "15 Sep 2026",
      status: "Active",
    },
    {
      id: "FEE-2026-004",
      name: "Semester-1 Transit Installment (Zone B)",
      type: "Semester",
      zone: "Zone B",
      amount: 5000,
      dueDate: "15 Sep 2026",
      status: "Active",
    },
  ]);

  const [discounts, setDiscounts] = useState([
    {
      id: "DSC-01",
      name: "Staff & Faculty Ward Concession",
      discountType: "Percentage",
      value: 25,
      studentsApplied: 18,
      status: "Active",
    },
    {
      id: "DSC-02",
      name: "University Sports Quota Scholarship",
      discountType: "Percentage",
      value: 50,
      studentsApplied: 12,
      status: "Active",
    },
    {
      id: "DSC-03",
      name: "Merit Academic Excellence Waiver",
      discountType: "Fixed Amount",
      value: 3000,
      studentsApplied: 24,
      status: "Active",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "AUD-2026-001",
      timestamp: "2026-08-22 10:15 AM",
      user: "CMA Rajesh Dave (Finance)",
      action: "Bank Challan Verification",
      details: "Approved ₹9,500 challan CHL-SBI-884920 for student PRIYA PATEL (UNI20260142)",
    },
    {
      id: "AUD-2026-002",
      timestamp: "2026-08-21 03:40 PM",
      user: "Accounts Desk Window #2",
      action: "Offline Cash Receipt Recorded",
      details: "Issued cash receipt REC-2026-0005 for ₹9,500 to KAVITA SHAH",
    },
    {
      id: "AUD-2026-003",
      timestamp: "2026-08-19 11:20 AM",
      user: "CMA Rajesh Dave (Finance)",
      action: "Refund Approval",
      details: "Approved prorated refund of ₹4,750 for CHIRAG VERMA (Hostel Relocation)",
    },
  ]);

  // WebSocket Ref & Backoff Attempts
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptRef = useRef(0);

  // Helper: Auth Fetch Wrapper
  const authFetch = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      };

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (!response.ok) {
          throw new Error(`API Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        console.warn(`[TransitContext] AuthFetch failed for ${endpoint}:`, err.message);
        throw err;
      }
    },
    [accessToken]
  );

  // 1. Fetch Role-Scoped Dataset from Backend on Mount or Role Change
  const fetchRoleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeRole === "student") {
        const data = await authFetch("/student/dashboard");
        if (data?.data?.student) {
          setCurrentStudent((prev) => ({ ...prev, ...data.data.student }));
        }
        if (data?.data?.telemetry) {
          setLiveBusTelemetry((prev) => ({
            ...prev,
            [data.data.telemetry.busId]: data.data.telemetry,
          }));
        }
      } else if (activeRole === "driver") {
        const data = await authFetch("/driver/dashboard");
        if (data?.data?.driver) {
          setCurrentDriver((prev) => ({ ...prev, ...data.data.driver }));
        }
      } else if (activeRole === "super_admin" || activeRole === "transport_manager") {
        const [dash, fleetRes, routeRes] = await Promise.allSettled([
          authFetch("/admin/dashboard"),
          authFetch("/admin/fleet"),
          authFetch("/admin/routes"),
        ]);

        if (fleetRes.status === "fulfilled" && fleetRes.value?.buses) {
          setBuses(fleetRes.value.buses);
        }
        if (routeRes.status === "fulfilled" && routeRes.value?.routes) {
          setRoutes(routeRes.value.routes);
        }
      } else if (activeRole === "finance_admin") {
        const data = await authFetch("/finance/dashboard");
      }
    } catch (err) {
      setError("Backend API offline or unreachable. Using synchronized live telemetry.");
    } finally {
      setIsLoading(false);
    }
  }, [activeRole, authFetch]);

  useEffect(() => {
    fetchRoleData();
  }, [fetchRoleData]);

  // 2. Single WebSocket Connection with Channel Subscriptions & Exponential Backoff
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = `${WS_BASE_URL}?token=${accessToken || ""}`;
    console.log(`📡 Connecting WebSocket to ${WS_BASE_URL}...`);
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WebSocket Connected to GLOW Live Telemetry Engine.");
      setIsWsConnected(true);
      reconnectAttemptRef.current = 0;

      // Subscribe to telemetry and alert channels
      socket.send(JSON.stringify({ action: "SUBSCRIBE", channel: "bus:*:telemetry" }));
      socket.send(JSON.stringify({ action: "SUBSCRIBE", channel: "sos:alerts" }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { channel, data } = message;

        // Handle live telemetry frames
        if (channel === "bus:*:telemetry" || (channel && channel.startsWith("bus:"))) {
          if (data && data.busId) {
            setLiveBusTelemetry((prev) => ({
              ...prev,
              [data.busId]: data,
            }));

            // Sync student's assigned bus telemetry if matching
            if (data.busId === currentStudent.busId) {
              setActiveTrip((prev) => ({
                ...prev,
                currentSpeed: data.speed,
                etaMinutes: data.etaMinutes,
                coordinates: { lat: data.lat, lng: data.lng },
                progressPercent: data.progressPercent,
              }));
            }
          }
        } else if (channel === "sos:alerts") {
          if (data) {
            setSosAlerts((prev) => [data.payload || data, ...prev]);
          }
        }
      } catch (err) {
        console.error("Error parsing WS message:", err.message);
      }
    };

    socket.onerror = () => {
      console.warn("⚠️ WebSocket connection error.");
      setIsWsConnected(false);
    };

    socket.onclose = () => {
      console.warn("🔌 WebSocket disconnected. Initiating exponential backoff reconnect...");
      setIsWsConnected(false);

      // Exponential backoff delay (1s, 2s, 4s, 8s, 16s... max 30s)
      const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttemptRef.current));
      reconnectAttemptRef.current += 1;

      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, delay);
    };
  }, [accessToken, currentStudent.busId]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket]);

  // Reconnect Handler for OfflineBanner button
  const reconnectWs = useCallback(() => {
    reconnectAttemptRef.current = 0;
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  }, [connectWebSocket]);

  // Action Methods
  const startTrip = async () => {
    try {
      const res = await authFetch("/driver/me/trip/start", { method: "POST" });
      if (res?.trip) {
        setActiveTrip((prev) => ({
          ...prev,
          ...res.trip,
          id: res.trip._id || res.trip.tripId,
          _id: res.trip._id,
          isActive: true,
          status: "ON_ROUTE",
        }));
      } else {
        setActiveTrip((prev) => ({ ...prev, status: "ON_ROUTE", isActive: true }));
      }
      return res;
    } catch (err) {
      setActiveTrip((prev) => ({ ...prev, status: "ON_ROUTE", isActive: true }));
    }
  };

  const pauseTrip = async (tripId) => {
    try {
      const path = tripId ? `/driver/me/trip/${tripId}/pause` : "/driver/me/trip/pause";
      const res = await authFetch(path, { method: "PATCH" });
      setActiveTrip((prev) => ({ ...prev, status: prev.status === "PAUSED" ? "ON_ROUTE" : "PAUSED" }));
      return res;
    } catch (err) {
      setActiveTrip((prev) => ({ ...prev, status: prev.status === "PAUSED" ? "ON_ROUTE" : "PAUSED" }));
    }
  };

  const completeTrip = async (tripId) => {
    try {
      const path = tripId ? `/driver/me/trip/${tripId}/complete` : "/driver/me/trip/complete";
      const res = await authFetch(path, { method: "PATCH" });
      setActiveTrip((prev) => ({ ...prev, status: "COMPLETED", isActive: false }));
      return res;
    } catch (err) {
      setActiveTrip((prev) => ({ ...prev, status: "COMPLETED", isActive: false }));
    }
  };

  const broadcastDelay = async (delayMinutes, reason, tripId) => {
    try {
      const path = tripId ? `/driver/me/trip/${tripId}/delay` : "/driver/me/trip/delay";
      return await authFetch(path, {
        method: "POST",
        body: JSON.stringify({ minutes: Number(delayMinutes), delayMinutes: Number(delayMinutes), reason }),
      });
    } catch (err) {
      console.warn("Delay broadcast fallback active:", err);
    }
  };

  const triggerSosAlert = async (details) => {
    try {
      await authFetch("/emergencies/sos", {
        method: "POST",
        body: JSON.stringify(details),
      });
    } catch (err) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "TRIGGER_SOS", payload: details }));
      }
    }
  };

  const triggerDriverSos = async (coords = {}) => {
    try {
      return await authFetch("/driver/me/sos", {
        method: "POST",
        body: JSON.stringify(coords),
      });
    } catch (err) {
      console.warn("Driver SOS fallback:", err);
    }
  };

  const validatePass = async (payload) => {
    return await authFetch("/driver/me/validate-pass", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const boardStudent = (studentId) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId || s.enrollmentId === studentId ? { ...s, boardedToday: true } : s))
    );
  };

  // Finance Action Methods
  const payStudentFee = (amount, method = "UPI", refNo = null) => {
    const reference = refNo || `UPI-${Date.now().toString().slice(-8)}`;
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      receiptId: `REC-${Date.now().toString().slice(-6)}`,
      studentName: currentStudent?.name || "Rahul Sharma",
      studentId: currentStudent?.id || "UNI20260125",
      dept: currentStudent?.department || "Computer Science",
      route: currentStudent?.routeName || "R-04 Fatehgunj - GSFC",
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
      method: method || "UPI",
      refNo: reference,
      status: "SUCCESS",
    };

    setTransactions((prev) => [newTxn, ...prev]);

    setCurrentStudent((prev) => {
      const prevPending = prev.pendingFee !== undefined ? prev.pendingFee : 5000;
      const prevPaid = prev.paidFee || 10000;
      const newPending = Math.max(0, prevPending - Number(amount));
      const newPaid = prevPaid + Number(amount);
      return {
        ...prev,
        pendingFee: newPending,
        paidFee: newPaid,
        feeStatus: newPending === 0 ? "PAID" : "PARTIAL",
      };
    });

    return newTxn;
  };

  const verifyOfflinePayment = (id, isApproved) => {
    setOfflinePayments((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, status: isApproved ? "VERIFIED" : "REJECTED" };
        }
        return p;
      })
    );

    if (isApproved) {
      const payment = offlinePayments.find((p) => p.id === id);
      if (payment) {
        const approvedTxn = {
          id: `TXN-${Date.now().toString().slice(-6)}`,
          receiptId: `REC-${Date.now().toString().slice(-6)}`,
          studentName: payment.studentName,
          studentId: payment.studentId,
          dept: payment.dept,
          route: payment.route || "R-04 Fatehgunj - GSFC",
          amount: payment.amount,
          date: new Date().toISOString().slice(0, 10),
          method: payment.method,
          refNo: payment.refNo,
          status: "SUCCESS",
        };
        setTransactions((prev) => [approvedTxn, ...prev]);
      }
    }
  };

  const addFeeStructure = (feeObj) => {
    setFeeStructures((prev) => [
      ...prev,
      {
        id: `FEE-${Date.now().toString().slice(-4)}`,
        ...feeObj,
      },
    ]);
  };

  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    accessToken,
    setAccessToken,
    authFetch,
    activeRole,
    setActiveRole,
    isLoading,
    error,
    isWsConnected,
    reconnectWs,
    currentStudent,
    setCurrentStudent,
    currentDriver,
    setCurrentDriver,
    currentAdmin,
    setCurrentAdmin,
    currentFinanceAdmin,
    setCurrentFinanceAdmin,
    activeTrip,
    setActiveTrip,
    liveBusTelemetry,
    buses,
    setBuses,
    routes,
    setRoutes,
    students,
    setStudents,
    notifications,
    sosAlerts,
    startTrip,
    pauseTrip,
    completeTrip,
    broadcastDelay,
    triggerSosAlert,
    triggerDriverSos,
    validatePass,
    boardStudent,
    // Finance Suite Exports
    searchQuery,
    setSearchQuery,
    transactions,
    setTransactions,
    offlinePayments,
    setOfflinePayments,
    verifyOfflinePayment,
    refundRequests,
    setRefundRequests,
    feeStructures,
    setFeeStructures,
    addFeeStructure,
    discounts,
    setDiscounts,
    auditLogs,
    setAuditLogs,
    payStudentFee,
  };

  return <TransitContext.Provider value={contextValue}>{children}</TransitContext.Provider>;
};
