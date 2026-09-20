import { useNavigate } from "react-router-dom";
import GlowLogo from "../assets/GlowLogo";
import "./ForbiddenView.css";

const ForbiddenView = () => {
  const navigate = useNavigate();

  return (
    <div className="forbidden-page-root">
      <div className="forbidden-card">
        <GlowLogo width={120} />
        <div className="forbidden-badge">403 ACCESS DENIED</div>
        <h1 className="forbidden-title">Unauthorized Portal Access</h1>
        <p className="forbidden-desc">
          Your active system role does not have administrative permissions to view this section.
          Please switch roles or log in with an authorized account.
        </p>
        <div className="forbidden-actions">
          <button className="forbidden-btn-primary" onClick={() => navigate("/login")}>
            Return to Login Portal
          </button>
          <button className="forbidden-btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenView;
