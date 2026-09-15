import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const GOOGLE_ACCOUNTS = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@university.edu",
    role: "Student (B.Tech CSE)",
    roleId: "student",
    path: "/student/dashboard",
    avatar: "RS",
    bgColor: "#2563eb",
  },
  {
    name: "Dr. Arvind Patel",
    email: "admin@glowbus.edu",
    role: "Super Administrator",
    roleId: "super_admin",
    path: "/admin/dashboard",
    avatar: "AP",
    bgColor: "#7c3aed",
  },
  {
    name: "CMA Rajesh Dave",
    email: "finance@glowbus.edu",
    role: "Chief Finance Officer",
    roleId: "finance_admin",
    path: "/finance/dashboard",
    avatar: "RD",
    bgColor: "#16a34a",
  },
  {
    name: "Mahesh Patel",
    email: "driver@glowbus.edu",
    role: "Senior Transit Driver",
    roleId: "driver",
    path: "/driver/dashboard",
    avatar: "MP",
    bgColor: "#ea580c",
  },
];

const LoginPageView = () => {
  const navigate = useNavigate();
  const { setActiveRole } = useTransit();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your email address or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const lower = username.toLowerCase().trim();

      let targetRole = "student";
      let targetPath = "/student/dashboard";

      if (lower.includes("driver") || lower.includes("mahesh") || lower.includes("drv")) {
        targetRole = "driver";
        targetPath = "/driver/dashboard";
      } else if (lower.includes("transport") || lower.includes("manager") || lower.includes("mgr") || lower.includes("ops")) {
        targetRole = "transport_manager";
        targetPath = "/transport/dashboard";
      } else if (lower.includes("finance") || lower.includes("account") || lower.includes("fee") || lower.includes("bill") || lower.includes("rajesh")) {
        targetRole = "finance_admin";
        targetPath = "/finance/dashboard";
      } else if (lower.includes("admin") || lower.includes("super") || lower.includes("arvind") || lower.includes("root")) {
        targetRole = "super_admin";
        targetPath = "/admin/dashboard";
      } else {
        targetRole = "student";
        targetPath = "/student/dashboard";
      }

      setActiveRole(targetRole);
      navigate(targetPath);
    }, 400);
  };

  const handleGoogleSelect = (account) => {
    setIsLoading(true);
    setShowGoogleModal(false);
    setTimeout(() => {
      setIsLoading(false);
      setActiveRole(account.roleId);
      navigate(account.path);
    }, 450);
  };

  return (
    <div className="login-page-root">
      <div className="login-modal-card">
        {/* ── LEFT HERO BANNER ─────────────────────────────────────── */}
        <div className="login-left-banner">
          <div className="login-banner-text-wrap">
            <h1 className="login-banner-headline">
              Simplify<br />
              management With<br />
              Our dashboard.
            </h1>
            <p className="login-banner-subtext">
              Simplify your university transit management with our smart, real-time campus mobility system.
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
          {/* Brand Logo at top of form */}
          <div className="login-form-brand-row">
            <GlowLogo width={110} darkMode={false} />
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Welcome Back</h2>
            <p className="login-form-sub">Please login to your account</p>
          </div>

          {error && (
            <div className="login-error-badge" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-input-form">
            <div className="login-form-field">
              <input
                type="text"
                className="login-text-input"
                placeholder="Email address (e.g., admin@glowbus.edu)"
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
            onClick={() => setShowGoogleModal(true)}
            disabled={isLoading}
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>

      {/* ── GOOGLE ACCOUNT CHOOSER MODAL ─────────────────────────── */}
      {showGoogleModal && (
        <div className="google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <GoogleIcon />
              <div>
                <h3 className="google-modal-title">Sign in with Google</h3>
                <p className="google-modal-sub">Choose an account to continue to GLOW Transit</p>
              </div>
            </div>

            <div className="google-accounts-list">
              {GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className="google-account-item"
                  onClick={() => handleGoogleSelect(acc)}
                >
                  <div className="google-acc-avatar" style={{ backgroundColor: acc.bgColor }}>
                    {acc.avatar}
                  </div>
                  <div className="google-acc-info">
                    <div className="google-acc-name">{acc.name}</div>
                    <div className="google-acc-email">{acc.email}</div>
                    <span className="google-acc-role-badge">{acc.role}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="google-modal-footer">
              <button
                type="button"
                className="google-modal-cancel-btn"
                onClick={() => setShowGoogleModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPageView;
