import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlowLogo from "../assets/GlowLogo";
import "./AuthLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!userId || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    // Replace with real API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="auth-root">
      {/* Left hero */}
      <div className="auth-hero auth-hero--admin">
        <div className="hero-overlay" />
        <div className="hero-content">
          {/* Back button */}
          <button
            className="hero-back-btn"
            onClick={() => navigate("/")}
            aria-label="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </button>

          <div className="hero-body">
            <p className="hero-tagline">BUS DEVELOPMENT SYSTEM</p>
            <h1 className="hero-headline">
              Precision in<br />Campus Mobility.
            </h1>
            <p className="hero-sub">
              Efficiency-driven fleet management for the modern university ecosystem.
            </p>
            <div className="hero-features">
              {["Fleet Monitoring", "Route Dispatch", "Driver Records", "Fuel & Maintenance"].map((f) => (
                <span className="hero-feature-tag" key={f}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo-area">
            <GlowLogo width={120} darkMode={false} />
            <span className="auth-logo-label auth-logo-label--admin">Admin</span>
          </div>

          <div className="auth-titles">
            <h2 className="auth-title">Administrative Portal</h2>
            <p className="auth-subtitle">
              Welcome back. Please enter your credentials to manage the fleet.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleLogin} noValidate>
            {/* University ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="admin-userId">
                UNIVERSITY ID
              </label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="admin-userId"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 10045628"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                  aria-label="University ID"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="label-row">
                <label className="form-label" htmlFor="admin-password">PASSWORD</label>
                <button type="button" className="forgot-link" aria-label="Forgot password">
                  FORGOT PASSWORD?
                </button>
              </div>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="remember-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom" aria-hidden="true" />
                Remember this session for 30 days
              </label>
            </div>

            {error && <p className="error-msg" role="alert">{error}</p>}

            <button
              type="submit"
              className={`auth-btn auth-btn--admin ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <>
                  Login to Admin Portal
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="switch-portal-btn"
              onClick={() => navigate("/login/student")}
            >
              Switch to Student Portal →
            </button>

            <div className="divider" />
            <p className="support-text">
              Having trouble?{" "}
              <button type="button" className="support-link">Contact Support</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
