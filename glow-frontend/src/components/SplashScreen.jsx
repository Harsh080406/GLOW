import { useEffect, useState } from "react";
import glowVideo from "../assets/glow-logo.mp4";
import "./SplashScreen.css";

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 500);
    const t2 = setTimeout(() => setPhase("exit"), 1400);
    const t3 = setTimeout(() => onFinish(), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`splash-root splash-${phase}`}
      aria-label="GLOW"
      role="status"
      onClick={onFinish}
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
      </div>
    </div>
  );
};

export default SplashScreen;
