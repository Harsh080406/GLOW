import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GlowLogo from "../../../shared/assets/GlowLogo";
import "./LogoutTransitionView.css";

const TOTAL_SECONDS = 5; // 5 seconds redirect as requested

const LogoutTransitionView = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const redirectedRef = useRef(false);

  useEffect(() => {
    // 1. Clean up stored authentication credentials
    try {
      localStorage.removeItem("glow_token");
      localStorage.removeItem("glow_access_token");
      localStorage.removeItem("glow_active_role");
      sessionStorage.clear();

      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      fetch(`${apiBase}/auth/logout`, { credentials: "include" }).catch(() => {});
    } catch (err) {
      console.warn("Logout session cleanup note:", err);
    }

    // 2. 5-Second countdown timer
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            navigate("/", { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleManualRedirect = () => {
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="logout-screen-root">
      <div className="logout-card-container">
        <div className="logout-card-glow-bg" />

        <div className="logout-card-body">
          {/* GLOW Logo */}
          <div className="logout-logo-wrap">
            <GlowLogo width={160} darkMode={false} />
          </div>

          {/* Core Message */}
          <div className="logout-message-section">
            <h1 className="logout-main-title">Thankyou for time</h1>
            <div className="logout-team-badge">
              <span className="logout-sparkle">✦</span>
              <span>Team GLOW</span>
              <span className="logout-sparkle">✦</span>
            </div>
          </div>

          {/* Centered Ticking Number Box (No Progress Bar) */}
          <div className="logout-countdown-center-box">
            <div className="logout-ticking-number-circle" key={secondsLeft}>
              <span className="logout-ticking-number">{secondsLeft}</span>
            </div>
            <p className="logout-countdown-label">
              Redirecting to homepage in <strong>{secondsLeft} second{secondsLeft !== 1 ? "s" : ""}</strong>
            </p>
          </div>

          {/* Instant Return Button */}
          <button
            type="button"
            className="logout-direct-btn"
            onClick={handleManualRedirect}
            id="logout-return-now-btn"
          >
            <span>Go to Homepage Now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutTransitionView;
