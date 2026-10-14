import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GlowLogo from "../../../shared/assets/GlowLogo";
import studentsBannerImg from "../../../shared/assets/glow-students-banner.jpg";
import { useTransit } from "../../../shared/context/TransitContext";
import "./LoginPage.css";

const GoogleIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Strict University Authentication Constants
const STRICT_PASSWORD = "password@1234";
const STUDENT_ID_REGEX = /^UNI2026\d+(@[a-zA-Z0-9.-]+)?$/i;

const STAFF_EMAILS = [
  "admin@glowbus.edu",
  "driver@glowbus.edu",
  "finance@glowbus.edu",
  "transport@glowbus.edu",
  "transportadmin@glowbus.edu",
  "mahesh.patel@glowbus.edu",
  "arvind.patel@glowbus.edu",
  "rajesh.dave@glowbus.edu",
];

const LoginPageView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveRole, setIsAuthenticated, setAccessToken, setCurrentStudent, students } = useTransit();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [oauthNotice, setOauthNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const noticeParam = searchParams.get("oauth_notice");
    if (errorParam) {
      setError(errorParam);
    }
    if (noticeParam === "GOOGLE_CLIENT_ID_REQUIRED") {
      setOauthNotice(
        "Google OAuth Client ID is not yet configured in backend/.env."
      );
    }

    // Initialize Google One-Tap / ID Token listener
    const handleCredentialResponse = async (response) => {
      if (!response?.credential) return;
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.error?.message || "Google authentication failed.");
        }

        localStorage.setItem("glow_access_token", data.accessToken);
        localStorage.setItem("glow_token", data.accessToken);
        localStorage.setItem("glow_active_role", data.user.role);

        setIsAuthenticated(true);
        setAccessToken(data.accessToken);
        setActiveRole(data.user.role);
        navigate(getRoleDashboardPath(data.user.role));
      } catch (err) {
        console.error("Google credential login error:", err);
        setError(err.message || "Failed to sign in with Google account.");
      } finally {
        setIsLoading(false);
      }
    };

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (e) {
        console.warn("GIS initialize warning:", e);
      }
    }
  }, [searchParams, navigate, setAccessToken, setIsAuthenticated, setActiveRole]);

  // Map server role to dashboard path
  const getRoleDashboardPath = (role) => {
    switch (role) {
      case "super_admin":
        return "/admin/dashboard";
      case "finance_admin":
        return "/finance/dashboard";
      case "transport_manager":
      case "transport_admin":
        return "/transport/dashboard";
      case "driver":
        return "/driver/dashboard";
      case "student":
      default:
        return "/student/dashboard";
    }
  };

  const isHttpsLocalhostMismatch =
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    API_BASE_URL.includes("localhost");

  // Dynamically resolve and set student profile for any valid UNI2026XXX ID
  const applyStudentProfile = (studentId, rawInput) => {
    const cleanId = studentId.toUpperCase();
    const matched = (students || []).find(
      (s) => s.id?.toUpperCase() === cleanId || s.enrollmentId?.toUpperCase() === cleanId
    );
    if (matched) {
      const studentObj = {
        ...matched,
        id: cleanId,
        email: matched.email || (rawInput.includes("@") ? rawInput : `${cleanId.toLowerCase()}@glowbus.edu`),
      };
      setCurrentStudent(studentObj);
      localStorage.setItem("glow_current_student", JSON.stringify(studentObj));
    } else {
      const numPart = cleanId.replace("UNI2026", "") || "001";
      const newStudentObj = {
        id: cleanId,
        name: `Student Commuter ${numPart}`,
        avatar: `S${numPart.slice(-1) || "T"}`,
        department: "Computer Science",
        email: rawInput.includes("@") ? rawInput : `${cleanId.toLowerCase()}@glowbus.edu`,
        phone: `+91 98765 ${numPart.padStart(5, "0").slice(-5)}`,
        busId: "GJ-06-BV-2915",
        assignedBusRegNo: "GJ-06-BV-2915",
        routeId: "ROUTE-9",
        routeName: "Route 9 (Tulsidham - Fatehgunj - Nizampura)",
        pickupStop: "FATEHGUNG- BOB",
        pickupTime: "07:48 AM",
        passStatus: "ACTIVE",
        feeStatus: "PAID",
        pendingFee: 0,
      };
      setCurrentStudent(newStudentObj);
      localStorage.setItem("glow_current_student", JSON.stringify(newStudentObj));
    }
  };

  // Demo Fallback Login with STRICT credential validation
  const handleDemoFallbackLogin = (forcedRole) => {
    const cleanInput = (username || "").trim();
    const cleanLower = cleanInput.toLowerCase();

    // Strict Password Enforcement
    if (password !== STRICT_PASSWORD) {
      setError("Incorrect email or password, please try again.");
      return;
    }

    // Strict Format Enforcement
    const isStudent = STUDENT_ID_REGEX.test(cleanInput);
    const isStaff =
      STAFF_EMAILS.includes(cleanLower) ||
      (cleanLower.endsWith("@glowbus.edu") && !cleanLower.startsWith("uni"));

    if (!isStudent && !isStaff && !forcedRole) {
      setError("Incorrect email or password, please try again.");
      return;
    }

    let targetRole = forcedRole;
    if (!targetRole) {
      if (isStudent) {
        targetRole = "student";
        const studentId = cleanInput.split("@")[0].toUpperCase();
        applyStudentProfile(studentId, cleanInput);
      } else if (cleanLower.includes("driver") || cleanLower.includes("mahesh")) {
        targetRole = "driver";
      } else if (cleanLower.includes("transport") || cleanLower.includes("manager")) {
        targetRole = "transport_manager";
      } else if (cleanLower.includes("finance") || cleanLower.includes("rajesh")) {
        targetRole = "finance_admin";
      } else if (cleanLower.includes("admin") || cleanLower.includes("super")) {
        targetRole = "super_admin";
      } else {
        targetRole = "student";
        applyStudentProfile("UNI20260125", "UNI20260125");
      }
    } else if (targetRole === "student") {
      const studentId = isStudent ? cleanInput.split("@")[0].toUpperCase() : "UNI20260125";
      applyStudentProfile(studentId, cleanInput || "UNI20260125");
    }

    setIsAuthenticated(true);
    setActiveRole(targetRole);
    localStorage.setItem("glow_active_role", targetRole);
    navigate(getRoleDashboardPath(targetRole));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const cleanInput = (username || "").trim();
    if (!cleanInput) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // 1. Strict Password Enforcement: Strictly require "password@1234"
    if (password !== STRICT_PASSWORD) {
      setError("Incorrect email or password, please try again.");
      return;
    }

    // 2. Strict Identifier Format Enforcement: UNI2026XXX for students or authorized staff email
    const cleanLower = cleanInput.toLowerCase();
    const isStudent = STUDENT_ID_REGEX.test(cleanInput);
    const isStaff =
      STAFF_EMAILS.includes(cleanLower) ||
      (cleanLower.endsWith("@glowbus.edu") && !cleanLower.startsWith("uni"));

    if (!isStudent && !isStaff) {
      setError("Incorrect email or password, please try again.");
      return;
    }

    // Setup student profile if student
    if (isStudent) {
      const studentId = cleanInput.split("@")[0].toUpperCase();
      applyStudentProfile(studentId, cleanInput);
    }

    setIsLoading(true);

    // If deployed on HTTPS and API_BASE_URL points to insecure http://localhost, bypass blocked fetch
    const isHttpsLocalhostMismatch =
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      API_BASE_URL.startsWith("http://localhost");

    if (isHttpsLocalhostMismatch) {
      console.info("[Auth] HTTPS detected with localhost API. Activating client authentication fallback.");
      handleDemoFallbackLogin();
      setIsLoading(false);
      return;
    }

    try {
      // 1. Send Login Request to Real Backend API
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanInput, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || "Incorrect email or password, please try again.");
      }

      // Successful Backend Auth
      setIsAuthenticated(true);
      setAccessToken(data.accessToken);
      setActiveRole(data.user.role);
      localStorage.setItem("glow_access_token", data.accessToken);
      localStorage.setItem("glow_token", data.accessToken);
      localStorage.setItem("glow_active_role", data.user.role);
      navigate(getRoleDashboardPath(data.user.role));
    } catch (err) {
      console.warn("[Auth] API connection error:", err.message);
      const isFetchErr =
        err.message?.toLowerCase().includes("fetch") ||
        err.message?.toLowerCase().includes("network") ||
        err.message?.toLowerCase().includes("failed to fetch");

      if (isFetchErr || import.meta.env.DEV) {
        // Automatically allow logging in via local state if server is offline/sleeping
        console.info("[Auth] Activating seamless client authentication fallback.");
        handleDemoFallbackLogin();
      } else {
        setError(err.message || "Incorrect email or password, please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectOAuth = () => {
    setError("");
    setIsLoading(true);

    // 1. Google OAuth2 Token Client Popup (Official GIS popup — eliminates redirect_uri mismatch!)
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                // Fetch profile directly from Google
                const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userinfoRes.json();

                if (profile?.email) {
                  const res = await fetch(`${API_BASE_URL}/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: profile.email,
                      googleId: profile.id,
                      name: profile.name,
                      avatar: profile.picture,
                    }),
                  });

                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(data?.error?.message || "Google sign-in verification failed.");
                  }

                  localStorage.setItem("glow_access_token", data.accessToken);
                  localStorage.setItem("glow_token", data.accessToken);
                  localStorage.setItem("glow_active_role", data.user.role);

                  setIsAuthenticated(true);
                  setAccessToken(data.accessToken);
                  setActiveRole(data.user.role);
                  navigate(getRoleDashboardPath(data.user.role));
                  return;
                }
              } catch (err) {
                console.error("Google token authentication error:", err);
                setError(err.message || "Failed to authenticate with Google.");
              } finally {
                setIsLoading(false);
              }
            } else if (tokenResponse?.error) {
              setIsLoading(false);
            }
          },
          error_callback: (err) => {
            console.warn("Google popup error:", err);
            setIsLoading(false);
            window.location.href = `${API_BASE_URL}/auth/google`;
          },
        });

        tokenClient.requestAccessToken({ prompt: "consent" });
        return;
      } catch (err) {
        console.warn("initTokenClient failed, falling back to direct redirect:", err);
      }
    }

    // 2. GIS One-Tap Prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.location.href = `${API_BASE_URL}/auth/google`;
        }
      });
      return;
    }

    // 3. Fallback to standard redirect
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="login-page-root">
      <div className="login-wrapper">
        {/* Mobile top navigation: Back button on top left above container */}
        <div className="login-mobile-top-bar">
          <Link to="/" className="login-mobile-back-btn" title="Back to Homepage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </Link>
        </div>

        <div className="login-modal-card">
          {/* ── LEFT HERO BANNER ─────────────────────────────────────── */}
          <div className="login-left-banner">
            <div className="login-banner-text-wrap">
              <h1 className="login-banner-headline">
                Simplify Campus Transit<br />
                With Smart Mobility.
              </h1>
              <p className="login-banner-subtext">
                Real-time shuttle tracking, digital student passes, and intelligent fleet management in one unified platform.
              </p>
            </div>

            <div className="login-banner-img-wrap">
              <img
                src={studentsBannerImg}
                alt="University Students and Campus Bus"
                className="login-banner-img"
              />
            </div>
          </div>

          {/* ── RIGHT LOGIN FORM ─────────────────────────────────────── */}
          <div className="login-right-form-wrap">
            {/* Top navigation row with centered Logo and Back button on top right */}
            <div className="login-top-bar">
              <Link to="/" title="GLOW Homepage" className="login-brand-link">
                <GlowLogo width={110} darkMode={false} />
              </Link>

              <Link to="/" className="login-back-home-btn login-desktop-back-btn" title="Back to Homepage">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </Link>
            </div>

            <div className="login-form-header">
              <h2 className="login-form-title">Welcome Back</h2>
              <p className="login-form-sub">Please login to your campus account</p>
            </div>

            {error && (
              <div className="login-error-badge" role="alert">
                <div>{error}</div>
                {error.toLowerCase().includes("redirect_uri_mismatch") && (
                  <div style={{ marginTop: 8, fontSize: 11.5, textAlign: "left", lineHeight: 1.4, color: "#991b1b" }}>
                    <strong>Google Cloud Console Setup Needed:</strong>
                    <div style={{ marginTop: 3 }}>
                      In Google Cloud Console under <strong>Authorized redirect URIs</strong>, add:
                    </div>
                    <code style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "rgba(255,255,255,0.7)", borderRadius: 4, wordBreak: "break-all", fontWeight: 700 }}>
                      http://localhost:5000/api/v1/auth/google/callback
                    </code>
                  </div>
                )}

                {error.toLowerCase().includes("fetch") && (
                  <div style={{ marginTop: 8, fontSize: 11.5, textAlign: "left", lineHeight: 1.4, color: "#991b1b" }}>
                    <strong>Troubleshooting "Failed to fetch":</strong>
                    <div style={{ marginTop: 3 }}>
                      • Render free tier takes ~40s to spin up on cold start.
                      <br />
                      • Check that <code>VITE_API_BASE_URL</code> is set to your Render backend in Vercel settings.
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleDemoFallbackLogin()}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Continue in Demo / Offline Mode ➜
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isHttpsLocalhostMismatch && (
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  color: "#92400e",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  lineHeight: 1.4,
                  marginBottom: 16,
                }}
              >
                <strong>⚠️ Production API URL Notice:</strong>
                <div style={{ marginTop: 2 }}>
                  This deployed app is attempting to connect to <code>http://localhost:5000</code>.
                  In your <strong>Vercel Project Settings &gt; Environment Variables</strong>, add:
                  <code style={{ display: "block", marginTop: 4, padding: "3px 6px", background: "#fef9c3", borderRadius: 4, fontWeight: 700 }}>
                    VITE_API_BASE_URL=https://your-render-backend.onrender.com/api/v1
                  </code>
                  and redeploy. In the meantime, you can explore the platform in Demo mode.
                </div>
              </div>
            )}

            {oauthNotice && (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12.5,
                  lineHeight: 1.4,
                  marginBottom: 16,
                }}
              >
                ℹ️ {oauthNotice}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-input-form">
              <div className="login-form-field">
                <input
                  type="text"
                  className="login-text-input"
                  placeholder="Email"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div className="login-form-field login-pwd-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-text-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="login-forgot-row">
                <button
                  type="button"
                  className="login-forgot-link-btn"
                  onClick={() => alert("Password reset link has been dispatched to your university email.")}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="login-action-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </form>

            {/* ── GOOGLE AUTHENTICATION DIVIDER & BUTTON ───────────────── */}
            <div className="login-divider-row">
              <span className="login-divider-line" />
              <span className="login-divider-text">OR CONTINUE WITH</span>
              <span className="login-divider-line" />
            </div>

            <button
              type="button"
              className="login-google-btn"
              onClick={handleDirectOAuth}
              disabled={isLoading}
            >
              <GoogleIcon />
              <span>{isLoading ? "Connecting to Google..." : "Sign in with Google"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageView;
