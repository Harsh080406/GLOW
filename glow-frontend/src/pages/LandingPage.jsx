import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlowLogo from "../assets/GlowLogo";
import passKitImg from "../assets/glow-transit-hero-kit.jpg";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  // Simulated live telemetry in demo section
  const [simSpeed, setSimSpeed] = useState(42);
  const [simProgress, setSimProgress] = useState(58);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimSpeed((prev) => Math.floor(38 + Math.random() * 8));
      setSimProgress((prev) => (prev >= 88 ? 15 : prev + 1));
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const FAQS = [
    {
      q: "How do students access and present their Digital Transit Pass?",
      a: "Every registered student receives an encrypted, anti-counterfeit QR pass directly on their Student Dashboard under 'My Transport Pass'. Drivers scan this QR code with their mobile cockpit scanner in less than 2 seconds to log real-time attendance.",
    },
    {
      q: "How accurate is the Live GPS Fleet Tracking?",
      a: "Our buses transmit live coordinates every 3 seconds via GPS hardware and driver telemetry. Students and parents get exact ETAs, congestion warnings, and live route progression on an interactive map.",
    },
    {
      q: "Can fee payments be made through offline bank challans?",
      a: "Yes! Students can pay online via UPI, Cards, or NetBanking for instant pass activation, or submit offline bank challan receipts at the finance counter. Finance Officers verify slips within 4 hours via the Payment Verification portal.",
    },
    {
      q: "What safety protocols exist in case of an emergency or breakdown?",
      a: "Both the Driver Cockpit and Student Portal have dedicated SOS buttons. Triggering an SOS instantly alerts campus security, the Transport Manager, and dispatch coordinators with exact GPS coordinates and student manifest details.",
    },
  ];

  return (
    <div className="lp-wrapper">
      <div className="lp-frame">
        {/* ── 1. SPLIT-HERO DUAL-TONE CANVAS ───────────────── */}
        <section className="lp-split-hero">
          {/* ── LEFT DARK CANVAS ──────────────────────────── */}
          <div className="lp-hero-left">
            <div className="lp-hero-left-top">
              {/* Original GlowLogo from Assets */}
              <div className="lp-hero-brand" onClick={() => navigate("/login")}>
                <GlowLogo width={74} darkMode={true} />
              </div>

              <nav className="lp-hero-left-nav">
                <button className="lp-hero-nav-item" onClick={() => scrollToSection("features")}>Features</button>
                <button className="lp-hero-nav-item" onClick={() => scrollToSection("telemetry")}>Live Demo</button>
                <button className="lp-hero-nav-item" onClick={() => scrollToSection("faq")}>FAQ</button>
              </nav>
            </div>

            <div className="lp-hero-left-content">
              <h1 className="lp-hero-title">
                We believe<br />
                smart transit is<br />
                for everyone
              </h1>

              <p className="lp-hero-desc">
                Your campus mobility should be effortless, safe, and transparent. Experience live GPS tracking, instant digital RFID passes, and automated fleet intelligence.
              </p>

              <div className="lp-hero-actions">
                {/* Every getting started & student login button strictly navigates to /login */}
                <button
                  className="lp-pill-btn-primary"
                  onClick={() => navigate("/login")}
                >
                  <span>Student Login</span>
                  <span className="lp-arrow-circle">›</span>
                </button>

                <button
                  className="lp-play-btn"
                  onClick={() => scrollToSection("telemetry")}
                >
                  <span className="lp-play-icon-wrap">▶</span>
                  <span>Get Demo</span>
                </button>
              </div>
            </div>

            {/* Rotating Circular Stamp Badge */}
            <div
              className="lp-rotating-badge"
              onClick={() => scrollToSection("features")}
              title="Explore transit features"
            >
              <svg className="lp-rotating-text-svg" viewBox="0 0 100 100">
                <path
                  id="circlePath"
                  d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  fill="none"
                />
                <text fill="#cbd5e1" fontSize="9.5" fontWeight="800" letterSpacing="2.2">
                  <textPath href="#circlePath" startOffset="0%">
                    NOW EXPLORE · NOW EXPLORE ·
                  </textPath>
                </text>
              </svg>
              <span className="lp-stamp-arrow">↓</span>
            </div>
          </div>

          {/* ── RIGHT LAVENDER / BLUE CANVAS ──────────────── */}
          <div className="lp-hero-right">
            <div className="lp-hero-right-top">
              {/* Every getting started & student login button strictly navigates to /login */}
              <button
                className="lp-get-started-btn"
                onClick={() => navigate("/login")}
              >
                <span>Get Started</span>
                <span className="lp-arrow-circle-white">›</span>
              </button>
            </div>

            <div className="lp-hero-img-wrap">
              <img
                src={passKitImg}
                alt="GLOW Digital Pass Kit & Smartphone Pass"
                className="lp-hero-showcase-img"
              />

              {/* Floating Status Badges */}
              <div className="lp-float-badge-1">
                <span style={{ color: "#16a34a", fontSize: 14 }}>●</span>
                <span>85/85 Shuttles Active</span>
              </div>

              <div className="lp-float-badge-2">
                <span>🎫 4,250+ Verified Digital Passes</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#475569", fontWeight: 700 }}>
              <span>Volvo 9600 & Luxury Fleet</span>
              <span>99.2% Punctuality Score</span>
            </div>
          </div>
        </section>

        {/* ── 2. METRIC STRIP ──────────────────────────────── */}
        <section className="lp-metrics-strip">
          <div className="lp-metric-box">
            <div className="lp-metric-val" style={{ color: "#0066ff" }}>4,250+</div>
            <div className="lp-metric-label">Active Campus Commuters</div>
          </div>
          <div className="lp-metric-box">
            <div className="lp-metric-val" style={{ color: "#16a34a" }}>85</div>
            <div className="lp-metric-label">Smart Fleet Buses Active</div>
          </div>
          <div className="lp-metric-box">
            <div className="lp-metric-val" style={{ color: "#0f172a" }}>32</div>
            <div className="lp-metric-label">Transit Corridors Connected</div>
          </div>
          <div className="lp-metric-box">
            <div className="lp-metric-val" style={{ color: "#0066ff" }}>&lt; 2s</div>
            <div className="lp-metric-label">QR Passenger Scan Speed</div>
          </div>
        </section>

        {/* ── 3. FEATURE CAPABILITIES ──────────────────────── */}
        <section className="lp-features-section" id="features">
          <div className="lp-section-heading-wrap">
            <span className="lp-section-pill">Core Capabilities</span>
            <h2 className="lp-section-main-title">Designed for Safe, Seamless Campus Transit</h2>
            <p className="lp-section-desc">
              Experience modern student mobility with automated passes, live GPS tracking, and 24/7 security.
            </p>
          </div>

          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon">📍</div>
              <h3 className="lp-feature-title">Live 3-Second GPS Telemetry</h3>
              <p className="lp-feature-desc">
                High-precision bus tracking showing real-time location, upcoming stop ETAs, speed alerts, and congestion warnings.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">🎫</div>
              <h3 className="lp-feature-title">Encrypted Digital QR Passes</h3>
              <p className="lp-feature-desc">
                Instant digital passes with anti-counterfeit QR security and offline verification for seamless sub-2-second boarding.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">🚨</div>
              <h3 className="lp-feature-title">24/7 SOS & Safety Command</h3>
              <p className="lp-feature-desc">
                Instant emergency broadcast transmitting student vehicle status, driver coordinates, and campus security dispatch.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. LIVE TELEMETRY SIMULATOR ──────────────────── */}
        <section className="lp-simulator-section" id="telemetry">
          <div className="lp-sim-grid">
            <div className="lp-sim-hud">
              <div className="lp-sim-hud-top">
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#60a5fa", letterSpacing: 1 }}>
                    ● LIVE TELEMETRY STREAM
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>Bus BUS-104 (Volvo 9600)</h3>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>Route R-04 · North Corridor · Driver: Mahesh Patel</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#60a5fa" }}>{simSpeed}</span>
                  <span style={{ fontSize: 14, color: "#94a3b8" }}> km/h</span>
                  <p style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>● Engine Optimal</p>
                </div>
              </div>

              {/* Progress Line */}
              <div className="lp-sim-route-track">
                <div className="lp-sim-track-line" />
                <div className="lp-sim-track-progress" style={{ width: `${simProgress}%` }} />
                <div className="lp-sim-bus-marker" style={{ left: `${simProgress}%` }}>
                  🚌 BUS-104 ({simSpeed} km/h)
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                <span>● Depot (07:30 AM)</span>
                <span>● Motera Cross (ETA 7:38 AM)</span>
                <span>● University Main Gate (ETA 8:05 AM)</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 24 }}>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: 14, borderRadius: 12 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Capacity</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>31 / 38 Boarded</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: 14, borderRadius: 12 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Next Stop</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#60a5fa", marginTop: 2 }}>Motera (3 mins)</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: 14, borderRadius: 12 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>GPS Signal</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#4ade80", marginTop: 2 }}>Strong (4G LTE)</p>
                </div>
              </div>
            </div>

            {/* Right Pass Preview */}
            <div style={{ background: "#ffffff", borderRadius: 24, padding: 32, color: "#0f172a", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0066ff", paddingBottom: 14, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#0066ff", textTransform: "uppercase" }}>
                    Digital Campus Pass
                  </span>
                  <h4 style={{ fontSize: 19, fontWeight: 900, color: "#0f172a" }}>Rahul Sharma</h4>
                  <p style={{ fontSize: 12.5, color: "#64748b" }}>ID: UNI20260125 · B.Tech CSE</p>
                </div>
                <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, border: "1px solid #bbf7d0" }}>
                  ✓ VALID PASS
                </span>
              </div>

              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 68, height: 68, background: "#0f172a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28 }}>
                  📱
                </div>
                <div>
                  <strong style={{ fontSize: 13.5, color: "#0f172a" }}>Route R-04 (Zone B)</strong>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Seat Allocation: BUS-104 #14</p>
                  <p style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>Fee Verified · Paid ₹10,000</p>
                </div>
              </div>

              <button
                className="lp-pill-btn-primary"
                style={{ marginTop: 20, width: "100%", justifyContent: "center" }}
                onClick={() => navigate("/login")}
              >
                <span>Access Student Pass</span>
                <span className="lp-arrow-circle">›</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 5. FAQ SECTION ───────────────────────────────── */}
        <section className="lp-features-section" id="faq">
          <div className="lp-section-heading-wrap">
            <span className="lp-section-pill">Got Questions?</span>
            <h2 className="lp-section-main-title">Frequently Asked Questions</h2>
            <p className="lp-section-desc">
              Everything you need to know about campus transit passes, live GPS tracking, and boarding.
            </p>
          </div>

          <div className="lp-faq-container">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="lp-faq-card">
                <button
                  className="lp-faq-btn"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 14, color: "#0066ff" }}>{openFaqIndex === idx ? "▲" : "▼"}</span>
                </button>
                {openFaqIndex === idx && (
                  <div className="lp-faq-body">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. FOOTER ────────────────────────────────────── */}
        <footer className="lp-modern-footer">
          <div className="lp-footer-grid">
            <div>
              <div style={{ marginBottom: 12 }}>
                <GlowLogo width={64} darkMode={true} />
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                The official campus transit management platform delivering real-time safety, digital convenience, and reliable mobility.
              </p>
            </div>

            <div>
              <h4>Emergency & Help</h4>
              <ul>
                <li style={{ color: "#ef4444", fontWeight: 700 }}>🚨 SOS Hotline: 1800-GLOW-BUS</li>
                <li>📞 Helpdesk: +91 (0265) 224400</li>
                <li>📧 Support: transit@glowbus.edu</li>
                <li>🏢 Room 302, Campus Transit Cell</li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-legal">
            <span>© 2026 GLOW Campus Transit System. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
