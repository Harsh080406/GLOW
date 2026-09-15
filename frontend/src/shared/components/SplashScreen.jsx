import { useEffect, useState } from "react";
import glowVideo from "../assets/glow-logo.mp4";
import "./SplashScreen.css";

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 500);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash-root splash-${phase}`}
      aria-label="GLOW Bus Management System"
      role="status"
      onClick={() => onFinish && onFinish()}
      style={{ cursor: "pointer" }}
    >
      <div className="splash-logo-wrap">
        <video
          className="splash-logo-video"
          src={glowVideo}
          autoPlay
          muted
          playsInline
          loop
          draggable={false}
        />

        <div className="splash-tagline">
          BUS MANAGEMENT SYSTEM
        </div>

        <div className="splash-bar-track">
          <div className="splash-bar-fill" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
