import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";

const getRoleDashboardPath = (role) => {
  switch (role) {
    case "driver":
      return "/driver/dashboard";
    case "super_admin":
      return "/admin/dashboard";
    case "transport_manager":
      return "/transport/dashboard";
    case "finance_admin":
      return "/finance/dashboard";
    case "student":
    default:
      return "/student/dashboard";
  }
};

const OAuthCallbackView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, setIsAuthenticated, setActiveRole } = useTransit();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role") || "student";
    const error = searchParams.get("error");

    if (error) {
      setErrorMsg(error);
      const timer = setTimeout(() => {
        navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (token) {
      try {
        localStorage.setItem("glow_access_token", token);
        localStorage.setItem("glow_token", token);
        localStorage.setItem("glow_active_role", role);

        if (setAccessToken) setAccessToken(token);
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setActiveRole) setActiveRole(role);

        const targetPath = getRoleDashboardPath(role);
        navigate(targetPath, { replace: true });
      } catch (err) {
        console.error("OAuth session initialization failed:", err);
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setAccessToken, setIsAuthenticated, setActiveRole]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(16px)",
          borderRadius: 16,
          padding: "36px 32px",
          textAlign: "center",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        {errorMsg ? (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#f87171" }}>
              Authentication Failed
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8" }}>{errorMsg}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 14 }}>Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                border: "3px solid rgba(59, 130, 246, 0.2)",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Signing you into GLOW...</h2>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Finalizing secure OAuth authentication credentials.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackView;
