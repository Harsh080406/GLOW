import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlowLogo from "../../../shared/assets/GlowLogo";
import passKitImg from "../../../shared/assets/glow-transit-hero-kit.jpg";
import "./LandingPage.css";

// ── UNIFIED LINE ICONS (HEROICONS/LUCIDE STYLE) ───────────────
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    radar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19.07 4.93a10 10 0 0 0-14.14 0" />
        <path d="M16.24 7.76a6 6 0 0 0-8.48 0" />
        <circle cx="12" cy="12" r="2" />
        <path d="m13.41 10.59 5.66-5.66" />
      </svg>
    ),
    pass: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
        <path d="M7 12h10M12 7v10" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    route: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="6" cy="19" r="3" />
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
        <circle cx="18" cy="5" r="3" />
      </svg>
    ),
    bus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 6v6M15 6v6M2 12h19.6" />
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.6 19.1 6 18 6H4c-1.1 0-2.1.6-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
        <circle cx="7" cy="18" r="2" />
        <path d="M9 18h5" />
        <circle cx="16" cy="18" r="2" />
      </svg>
    ),
    sos: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    help: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    arrowRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    phone: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

const LandingPageView = () => {
  const navigate = useNavigate();

  // Navigation & UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Live Telemetry Simulator State
  const [simSpeed, setSimSpeed] = useState(42);
  const [simProgress, setSimProgress] = useState(58);
  const [simPassengers, setSimPassengers] = useState(31);

  // Navbar scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsScrolled(scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Telemetry loop
  useEffect(() => {
    const timer = setInterval(() => {
      setSimSpeed((prev) => Math.floor(38 + Math.random() * 8));
      setSimProgress((prev) => (prev >= 86 ? 16 : prev + 1));
      setSimPassengers((prev) => (Math.random() > 0.6 ? 30 + Math.floor(Math.random() * 5) : prev));
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -72;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const FAQS = [
    {
      q: "How do students access their Digital Transit Pass?",
      a: "Every registered student receives an encrypted, anti-counterfeit QR pass directly on their Student Dashboard under 'Transport Pass'. Drivers scan this QR code with their mobile cockpit scanner in under 2 seconds to log attendance with zero paper slips required.",
    },
    {
      q: "How accurate is the live GPS fleet tracking?",
      a: "GLOW shuttles transmit live coordinates every 3 seconds via high-precision telemetry sensors. Students and administrators view accurate ETAs, vehicle speeds, upcoming stop alerts, and congestion re-routing across all 34 campus transit corridors.",
    },
    {
      q: "Can passengers report unsafe conditions or delays?",
      a: "Yes. Students can file prioritized grievance reports directly from the Student Portal under 'Complaints' with category tagging and photo attachments. Fleet operations and transport managers receive instant push alerts to resolve reports within 24 hours.",
    },
    {
      q: "What happens during an emergency or mechanical breakdown?",
      a: "Both the Student Portal and Driver Cockpit feature dedicated SOS triggers. Triggering an SOS instantly notifies Campus Security, the Transport Manager, and emergency medical responders with live satellite coordinates, route details, and passenger manifests.",
    },
    {
      q: "Can fee payments be verified via offline bank challans?",
      a: "Absolutely. Students can pay semester transit fees online via Cards/UPI for instant activation or upload bank challan receipts. Finance Officers review and approve uploaded receipts directly in the Finance Verification dashboard within 4 hours.",
    },
  ];

  return (
    <div className="glow-landing">
      {/* ── 1. STICKY / FLOATING NAVBAR ──────────────────────────── */}
      <header className={`gl-navbar ${isScrolled ? "gl-navbar--scrolled" : ""}`}>
        <div className="gl-navbar-container">
          {/* Brand Logo */}
          <div className="gl-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <GlowLogo width={76} darkMode={true} />
            <span className="gl-nav-badge">TransitOS</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="gl-nav-links">
            <button className="gl-nav-link" onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("demo")}>
              Live Demo
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("safety")}>
              Safety
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("faq")}>
              FAQ
            </button>
          </nav>

          {/* Right Action CTAs */}
          <div className="gl-nav-actions">
            <button className="gl-btn-ghost" onClick={() => navigate("/login")}>
              Student Login
            </button>
            <button className="gl-btn-primary" onClick={() => navigate("/login")}>
              <span>Get Started</span>
              <Icon name="arrowRight" size={14} />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className={`gl-hamburger ${mobileMenuOpen ? "is-active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <>
            <div className="gl-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
            <div className="gl-mobile-drawer">
              <div className="gl-mobile-links">
                <button className="gl-mobile-link" onClick={() => scrollToSection("features")}>
                  Features
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("demo")}>
                  Live Demo
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("how-it-works")}>
                  How It Works
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("safety")}>
                  Safety & SOS
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("faq")}>
                  Frequently Asked Questions
                </button>
              </div>
              <div className="gl-mobile-actions">
                <button
                  className="gl-btn-ghost gl-btn--full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  Student Login
                </button>
                <button
                  className="gl-btn-primary gl-btn--full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  <span>Get Started</span>
                  <Icon name="arrowRight" size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ── 2. HERO SECTION ───────────────────────────────────────── */}
      <section className="gl-hero">
        <div className="gl-hero-bg">
          <div className="gl-hero-grid" />
          <div className="gl-hero-glow" />
        </div>

        <div className="gl-hero-container">
          {/* Left Column: Core Positioning & CTAs */}
          <div className="gl-hero-content">
            <div className="gl-eyebrow">
              <span className="gl-pulse-dot" />
              <span>SMART CAMPUS MOBILITY</span>
            </div>

            <h1 className="gl-hero-title">
              Smart Transit.<br />
              <span className="gl-title-highlight">Built for Campus.</span>
            </h1>

            <p className="gl-hero-desc">
              GLOW unites students, buses, drivers, and campus administration on a single intelligent platform. Experience live GPS fleet tracking, sub-2-second digital QR passes, and 24/7 student safety monitoring.
            </p>

            <div className="gl-hero-ctas">
              <button className="gl-btn-hero-primary" onClick={() => navigate("/login")}>
                <span>Student Login</span>
                <Icon name="arrowRight" size={16} />
              </button>
              <button className="gl-btn-hero-secondary" onClick={() => scrollToSection("demo")}>
                <span className="gl-play-icon">▶</span>
                <span>Explore Live Demo</span>
              </button>
            </div>

            <div className="gl-hero-trust">
              <div className="gl-trust-item">
                <span className="gl-trust-dot" />
                <span>34 Active Corridors</span>
              </div>
              <div className="gl-trust-divider" />
              <div className="gl-trust-item">
                <Icon name="check" size={13} className="gl-trust-check" />
                <span>4,250+ Students Onboarded</span>
              </div>
              <div className="gl-trust-divider" />
              <div className="gl-trust-item">
                <span>99.2% On-Time Score</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Product Dashboard Visualization */}
          <div className="gl-hero-visual">
            <div className="gl-mock-card">
              {/* Mockup Header */}
              <div className="gl-mock-header">
                <div className="gl-mock-meta">
                  <span className="gl-live-badge">
                    <span className="gl-live-dot" />
                    LIVE TELEMETRY
                  </span>
                  <h3 className="gl-mock-title">Shuttle BUS-104 · Volvo 9600</h3>
                  <p className="gl-mock-route">Route R-04 · Fatehgunj & North Vadodara Corridor</p>
                </div>
                <div className="gl-mock-speed">
                  <span className="gl-speed-val">{simSpeed}</span>
                  <span className="gl-speed-unit">km/h</span>
                  <div className="gl-engine-status">● Engine Optimal</div>
                </div>
              </div>

              {/* Live Track Line */}
              <div className="gl-mock-track">
                <div className="gl-track-bg" />
                <div className="gl-track-fill" style={{ width: `${simProgress}%` }} />
                <div className="gl-track-bus" style={{ left: `${simProgress}%` }}>
                  <div className="gl-bus-pin">🚌 BUS-104</div>
                </div>
              </div>

              {/* Stops with Dynamic ETAs */}
              <div className="gl-mock-stops">
                <div className="gl-stop-item is-passed">
                  <span className="gl-stop-dot" />
                  <span className="gl-stop-name">Fatehgunj Stop</span>
                  <span className="gl-stop-time">07:30 AM</span>
                </div>
                <div className="gl-stop-item is-active">
                  <span className="gl-stop-dot" />
                  <span className="gl-stop-name">Nizampura Char Rasta</span>
                  <span className="gl-stop-time">ETA 2 mins</span>
                </div>
                <div className="gl-stop-item">
                  <span className="gl-stop-dot" />
                  <span className="gl-stop-name">GSFC University Gate</span>
                  <span className="gl-stop-time">08:05 AM</span>
                </div>
              </div>

              {/* HUD Stats Row */}
              <div className="gl-mock-stats">
                <div className="gl-stat-box">
                  <span className="gl-stat-label">Passenger Load</span>
                  <span className="gl-stat-val">{simPassengers} / 38 Boarded</span>
                </div>
                <div className="gl-stat-box">
                  <span className="gl-stat-label">Next Stop ETA</span>
                  <span className="gl-stat-val gl-stat-val--blue">Nizampura (2 mins)</span>
                </div>
                <div className="gl-stat-box">
                  <span className="gl-stat-label">GPS Sensor</span>
                  <span className="gl-stat-val gl-stat-val--green">Connected (4G LTE)</span>
                </div>
              </div>

              {/* Embedded Student Pass Preview */}
              <div className="gl-mock-pass-preview" onClick={() => navigate("/login")}>
                <div className="gl-pass-left">
                  <div className="gl-pass-qr-box">
                    <Icon name="pass" size={24} />
                  </div>
                  <div className="gl-pass-info">
                    <div className="gl-pass-tag">OFFICIAL DIGITAL CREDENTIAL</div>
                    <div className="gl-pass-name">Rahul Sharma · UNI20260125</div>
                    <div className="gl-pass-route">Corridor: Route R-04 · Zone B Annual</div>
                  </div>
                </div>
                <div className="gl-pass-status">
                  <span className="gl-badge-active">✓ ACTIVE PASS</span>
                  <span className="gl-pass-action">Tap to View ›</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. METRICS STRIP ─────────────────────────────────────── */}
      <section className="gl-metrics-section">
        <div className="gl-metrics-container">
          <div className="gl-metric-item">
            <div className="gl-metric-num">4,250+</div>
            <div className="gl-metric-title">Active Campus Community</div>
            <div className="gl-metric-sub">Students, staff, & faculty using GLOW daily</div>
          </div>
          <div className="gl-metric-divider" />
          <div className="gl-metric-item">
            <div className="gl-metric-num gl-metric-num--green">85</div>
            <div className="gl-metric-title">Smart Transit Routes & Fleet</div>
            <div className="gl-metric-sub">GPS-synchronized Volvo & luxury shuttles</div>
          </div>
          <div className="gl-metric-divider" />
          <div className="gl-metric-item">
            <div className="gl-metric-num">34</div>
            <div className="gl-metric-title">Connected Corridors</div>
            <div className="gl-metric-sub">Spanning all major university commuter routes</div>
          </div>
          <div className="gl-metric-divider" />
          <div className="gl-metric-item">
            <div className="gl-metric-num gl-metric-num--blue">&lt; 2s</div>
            <div className="gl-metric-title">Live Passenger Boarding Sync</div>
            <div className="gl-metric-sub">Encrypted QR scanning p95 latency</div>
          </div>
        </div>
      </section>

      {/* ── 4. PROBLEM & VALUE PROPOSITION SECTION ────────────────── */}
      <section className="gl-problem-section">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-badge-subtle">THE CAMPUS COMMUTE CHALLENGE</span>
            <h2 className="gl-section-title">Campus mobility shouldn't feel uncertain.</h2>
            <p className="gl-section-desc">
              Traditional university transit networks operate in silos—leaving students waiting blindly, drivers overwhelmed with paperwork, and safety officers disconnected.
            </p>
          </div>

          <div className="gl-problem-grid">
            <div className="gl-problem-card">
              <div className="gl-problem-icon">
                <Icon name="clock" size={24} />
              </div>
              <h3 className="gl-problem-title">"Where is my bus?"</h3>
              <p className="gl-problem-text">
                Students wait at remote stops in harsh weather without arrival estimates, risking missed morning lectures or vital lab sessions.
              </p>
            </div>

            <div className="gl-problem-card">
              <div className="gl-problem-icon">
                <Icon name="route" size={24} />
              </div>
              <h3 className="gl-problem-title">"When will it arrive?"</h3>
              <p className="gl-problem-text">
                Unforeseen city traffic bottlenecks disrupt shifts without alerting dispatch or waiting passengers along the corridor.
              </p>
            </div>

            <div className="gl-problem-card">
              <div className="gl-problem-icon">
                <Icon name="pass" size={24} />
              </div>
              <h3 className="gl-problem-title">"Is my pass valid?"</h3>
              <p className="gl-problem-text">
                Physical paper passes and plastic cards get lost, stolen, or counterfeited, causing boarding delays and verification friction.
              </p>
            </div>

            <div className="gl-problem-card">
              <div className="gl-problem-icon">
                <Icon name="sos" size={24} />
              </div>
              <h3 className="gl-problem-title">"Who responds in an emergency?"</h3>
              <p className="gl-problem-text">
                Without telemetry or real-time passenger manifests, coordinating rapid security or medical assistance during an incident is impossible.
              </p>
            </div>
          </div>

          {/* Solution Transition Banner */}
          <div className="gl-solution-banner">
            <div className="gl-solution-content">
              <div className="gl-solution-eyebrow">THE GLOW ADVANTAGE</div>
              <h3 className="gl-solution-headline">GLOW connects the entire campus transit ecosystem in real time.</h3>
              <p className="gl-solution-sub">
                Students, drivers, transport marshals, and university administrators interact through a synchronized digital network powered by continuous GPS telemetry.
              </p>
            </div>
            <button className="gl-btn-primary" onClick={() => navigate("/login")}>
              <span>Join GLOW Network</span>
              <Icon name="arrowRight" size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. CORE FEATURES BENTO GRID ──────────────────────────── */}
      <section className="gl-features-section" id="features">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-badge-subtle">INTELLIGENT TRANSIT PLATFORM</span>
            <h2 className="gl-section-title">Built with Enterprise Mobility Engineering</h2>
            <p className="gl-section-desc">
              Every tool and protocol required to manage a high-frequency campus bus system with zero friction and maximum reliability.
            </p>
          </div>

          <div className="gl-bento-grid">
            {/* Feature 1: Large Span */}
            <div className="gl-bento-card gl-bento-card--large">
              <div className="gl-bento-icon">
                <Icon name="radar" size={26} />
              </div>
              <div className="gl-bento-body">
                <div className="gl-bento-tag">REAL-TIME GPS ENGINE</div>
                <h3 className="gl-bento-title">Sub-3-Second Live Bus Telemetry</h3>
                <p className="gl-bento-desc">
                  High-frequency GPS broadcasts transmit coordinates, speed alerts, and route progression every 3 seconds. Students check exact live positions on their phones and receive automated stop notifications before the shuttle arrives.
                </p>
                <div className="gl-feature-mini-hud">
                  <div className="gl-hud-pill">
                    <span className="gl-dot-pulse-green" /> 4G LTE Active
                  </div>
                  <div className="gl-hud-pill">± 2.5m GPS Accuracy</div>
                  <div className="gl-hud-pill">Live Turn-by-Turn ETA</div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="gl-bento-card">
              <div className="gl-bento-icon">
                <Icon name="pass" size={26} />
              </div>
              <div className="gl-bento-body">
                <div className="gl-bento-tag">DIGITAL PASS CREDENTIALS</div>
                <h3 className="gl-bento-title">HMAC-Signed QR Passes</h3>
                <p className="gl-bento-desc">
                  Eliminate plastic cards with cryptographically signed QR passes. Drivers scan the pass in under 2 seconds, logging boarding attendance even in offline cellular dead zones.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="gl-bento-card">
              <div className="gl-bento-icon">
                <Icon name="shield" size={26} />
              </div>
              <div className="gl-bento-body">
                <div className="gl-bento-tag">SAFETY & INCIDENT RELAY</div>
                <h3 className="gl-bento-title">24/7 Security Command & SOS</h3>
                <p className="gl-bento-desc">
                  One-touch SOS beacons alert university marshals, transport managers, and local emergency response teams with live coordinates and vehicle manifests.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="gl-bento-card">
              <div className="gl-bento-icon">
                <Icon name="route" size={26} />
              </div>
              <div className="gl-bento-body">
                <div className="gl-bento-tag">CORRIDOR INTELLIGENCE</div>
                <h3 className="gl-bento-title">Smart Route Scheduling</h3>
                <p className="gl-bento-desc">
                  Dynamic shift timetables adapt for regular academic days and special examination schedules with downloadable PDF timetable exports.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="gl-bento-card">
              <div className="gl-bento-icon">
                <Icon name="bus" size={26} />
              </div>
              <div className="gl-bento-body">
                <div className="gl-bento-tag">DRIVER MOBILE COCKPIT</div>
                <h3 className="gl-bento-title">Driver Cockpit & Fleet Hub</h3>
                <p className="gl-bento-desc">
                  Drivers control trip status, broadcast delay alerts, and monitor onboard capacity. Fleet supervisors track vehicle fitness certificates and maintenance schedules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. REAL WORKING PRODUCT SHOWCASE ─────────────────────── */}
      <section className="gl-showcase-section">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-badge-subtle">EXPERIENCE THE PLATFORM</span>
            <h2 className="gl-section-title">A unified product built for daily campus operations</h2>
            <p className="gl-section-desc">
              Designed with clean Swiss hierarchy, high-contrast usability, and intuitive controls for students and transportation staff alike.
            </p>
          </div>

          <div className="gl-showcase-wrapper">
            <div className="gl-showcase-frame">
              {/* Product Topbar */}
              <div className="gl-showcase-topbar">
                <div className="gl-topbar-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="gl-topbar-url">
                  <span className="gl-lock-icon">🔒</span>
                  <span>glowbus.edu/student/dashboard</span>
                </div>
                <div className="gl-topbar-user">
                  <span className="gl-user-badge">STUDENT PORTAL</span>
                </div>
              </div>

              {/* Main Product Showcase View */}
              <div className="gl-showcase-inner">
                <div className="gl-showcase-left">
                  <img
                    src={passKitImg}
                    alt="GLOW Student Digital Pass Platform Mockup"
                    className="gl-showcase-img"
                  />
                  <div className="gl-annotation gl-annotation--1">
                    <span className="gl-anno-pin" />
                    <div>
                      <strong>Encrypted Digital Pass</strong>
                      <p>Sub-2-second QR scan verification</p>
                    </div>
                  </div>
                  <div className="gl-annotation gl-annotation--2">
                    <span className="gl-anno-pin" />
                    <div>
                      <strong>Live Satellite GPS</strong>
                      <p>Continuous 3s telemetry feed</p>
                    </div>
                  </div>
                </div>

                <div className="gl-showcase-right">
                  <div className="gl-showcase-panel">
                    <div className="gl-panel-header">
                      <span className="gl-badge-green">● BUS EN ROUTE</span>
                      <span className="gl-panel-eta">ETA: 08:05 AM</span>
                    </div>

                    <h4 className="gl-panel-title">Route R-04 · Fatehgunj Express</h4>
                    <p className="gl-panel-sub">Fatehgunj Bus Stop → GSFC University Campus Gate 1</p>

                    <div className="gl-panel-stops-list">
                      <div className="gl-pstop is-done">
                        <span className="gl-pstop-icon">✓</span>
                        <div className="gl-pstop-info">
                          <strong>Fatehgunj Bus Stop</strong>
                          <span>Departed at 07:30 AM · On Schedule</span>
                        </div>
                      </div>
                      <div className="gl-pstop is-current">
                        <span className="gl-pstop-icon">●</span>
                        <div className="gl-pstop-info">
                          <strong>Nizampura Char Rasta</strong>
                          <span>Arriving in 2 mins · 34 students boarding</span>
                        </div>
                      </div>
                      <div className="gl-pstop">
                        <span className="gl-pstop-icon">○</span>
                        <div className="gl-pstop-info">
                          <strong>GSFC University Campus Gate 1</strong>
                          <span>Scheduled arrival 08:05 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="gl-panel-footer">
                      <div className="gl-driver-pill">
                        <div className="gl-driver-avatar">MP</div>
                        <div>
                          <div className="gl-driver-name">Mahesh Patel</div>
                          <div className="gl-driver-role">Certified Senior Pilot · Volvo 9600</div>
                        </div>
                      </div>
                      <button className="gl-btn-primary" onClick={() => navigate("/login")}>
                        View Live Map ›
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. HOW IT WORKS TIMELINE ──────────────────────────────── */}
      <section className="gl-how-section" id="how-it-works">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-badge-subtle">SIMPLE THREE-STEP COMMUTE</span>
            <h2 className="gl-section-title">How GLOW Works for Campus Commuters</h2>
            <p className="gl-section-desc">
              From morning pickup to evening return, commuting to university is simple, predictable, and stress-free.
            </p>
          </div>

          <div className="gl-timeline">
            {/* Step 1 */}
            <div className="gl-step-card">
              <div className="gl-step-num">01</div>
              <div className="gl-step-icon">
                <Icon name="pass" size={28} />
              </div>
              <h3 className="gl-step-title">Open GLOW & Check Route</h3>
              <p className="gl-step-text">
                Log in with your university credentials. Your allocated bus, pickup stop, assigned pilot, and real-time morning ETA appear immediately on your home dashboard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="gl-step-card">
              <div className="gl-step-num">02</div>
              <div className="gl-step-icon">
                <Icon name="radar" size={28} />
              </div>
              <h3 className="gl-step-title">Track & Present Pass</h3>
              <p className="gl-step-text">
                Follow your bus in real time as it approaches your stop. As the bus arrives, pull up your dynamic digital QR pass from the portal.
              </p>
            </div>

            {/* Step 3 */}
            <div className="gl-step-card">
              <div className="gl-step-num">03</div>
              <div className="gl-step-icon">
                <Icon name="shield" size={28} />
              </div>
              <h3 className="gl-step-title">Board in Under 2 Seconds</h3>
              <p className="gl-step-text">
                The driver cockpit camera validates your HMAC pass signature instantly. Enjoy an air-conditioned, safe, and reliable commute to your lectures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SAFETY & SECURITY COMMAND ─────────────────────────── */}
      <section className="gl-safety-section" id="safety">
        <div className="gl-container">
          <div className="gl-safety-grid">
            <div className="gl-safety-content">
              <div className="gl-eyebrow gl-eyebrow--danger">
                <span className="gl-dot-pulse-red" />
                <span>24/7 STUDENT PROTECTION</span>
              </div>

              <h2 className="gl-safety-title">Built around student safety and campus trust.</h2>

              <p className="gl-safety-desc">
                Transportation safety is not an afterthought. GLOW embeds active speed geofencing, real-time vehicle diagnostics, driver identity verification, and rapid-response emergency protocols directly into every trip.
              </p>

              <div className="gl-safety-pillars">
                <div className="gl-pillar">
                  <Icon name="shield" size={20} className="gl-pillar-icon" />
                  <div>
                    <strong>Continuous GPS Telemetry</strong>
                    <p>Live satellite tracking guarantees every bus stays on its verified university route.</p>
                  </div>
                </div>
                <div className="gl-pillar">
                  <Icon name="sos" size={20} className="gl-pillar-icon" />
                  <div>
                    <strong>One-Touch SOS Emergency Relay</strong>
                    <p>Instant beacon notifies campus security, dispatch officers, and medical personnel.</p>
                  </div>
                </div>
                <div className="gl-pillar">
                  <Icon name="bus" size={20} className="gl-pillar-icon" />
                  <div>
                    <strong>Verified Driver Roster</strong>
                    <p>Every driver is background-checked, license-verified, and monitored for punctuality.</p>
                  </div>
                </div>
              </div>

              {/* Emergency Hotline CTA */}
              <div className="gl-emergency-cta-box">
                <div>
                  <span className="gl-emg-label">CAMPUS TRANSIT EMERGENCY HOTLINE</span>
                  <div className="gl-emg-phone">1800-GLOW-BUS · (1800-456-9287)</div>
                </div>
                <a href="tel:18004569287" className="gl-btn-danger">
                  <Icon name="phone" size={16} />
                  <span>Call Emergency Dispatch</span>
                </a>
              </div>
            </div>

            {/* Safety Console Card */}
            <div className="gl-safety-card">
              <div className="gl-safety-card-top">
                <div className="gl-sec-status">
                  <span className="gl-dot-pulse-green" />
                  <span>CAMPUS SECURITY DISPATCH: ONLINE</span>
                </div>
                <span className="gl-time-stamp">ALL 85 FLEET UNITS SECURE</span>
              </div>

              <div className="gl-safety-hud-grid">
                <div className="gl-shud-item">
                  <span className="gl-shud-label">Active Buses</span>
                  <span className="gl-shud-val">85 / 85 Active</span>
                </div>
                <div className="gl-shud-item">
                  <span className="gl-shud-label">Fleet Speed Compliance</span>
                  <span className="gl-shud-val gl-shud-val--green">100% Compliant (&lt;50 km/h)</span>
                </div>
                <div className="gl-shud-item">
                  <span className="gl-shud-label">SOS System Status</span>
                  <span className="gl-shud-val gl-shud-val--green">Standby · 0 Active Incidents</span>
                </div>
                <div className="gl-shud-item">
                  <span className="gl-shud-label">Average Security Response</span>
                  <span className="gl-shud-val gl-shud-val--blue">&lt; 3.5 Minutes</span>
                </div>
              </div>

              <div className="gl-safety-card-banner">
                <strong>Certified Transport Cell Oversight</strong>
                <p>Monitored continuously from Room 302, University Transportation Cell with direct campus police liaison.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. LIVE TELEMETRY SIMULATOR ──────────────────────────── */}
      <section className="gl-demo-section" id="demo">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-badge-subtle">LIVE TRANSIT SIMULATION</span>
            <h2 className="gl-section-title">See GLOW in Action</h2>
            <p className="gl-section-desc">
              Watch real-time simulated telemetry stream from an active Volvo shuttle navigating the Fatehgunj – GSFC University corridor.
            </p>
          </div>

          <div className="gl-demo-grid">
            {/* Live Telemetry Card */}
            <div className="gl-demo-card">
              <div className="gl-demo-header">
                <div>
                  <span className="gl-demo-live-pill">
                    <span className="gl-dot-pulse-blue" /> LIVE SATELLITE STREAM
                  </span>
                  <h3 className="gl-demo-bus-title">BUS GLOW-104 (Volvo 9600)</h3>
                  <p className="gl-demo-bus-sub">Corridor: Route R-04 · Fatehgunj Loop · Driver: Mahesh Patel</p>
                </div>
                <div className="gl-demo-speed-box">
                  <span className="gl-demo-speed">{simSpeed}</span>
                  <span className="gl-demo-unit">km/h</span>
                  <div className="gl-demo-eco">● Speed Compliant</div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="gl-sim-route-track">
                <div className="gl-sim-track-line" />
                <div className="gl-sim-track-progress" style={{ width: `${simProgress}%` }} />
                <div className="gl-sim-bus-marker" style={{ left: `${simProgress}%` }}>
                  🚌 BUS-104 ({simSpeed} km/h)
                </div>
              </div>

              <div className="gl-demo-stops-row">
                <span>● Fatehgunj Depot (07:30 AM)</span>
                <span>● Nizampura Cross (ETA 7:38 AM)</span>
                <span>● GSFC Uni Main Gate (ETA 8:05 AM)</span>
              </div>

              <div className="gl-demo-metrics-row">
                <div className="gl-dmetric">
                  <span className="gl-dmetric-label">Passenger Count</span>
                  <p className="gl-dmetric-val">{simPassengers} / 38 Boarded</p>
                </div>
                <div className="gl-dmetric">
                  <span className="gl-dmetric-label">Approaching Stop</span>
                  <p className="gl-dmetric-val gl-dmetric-val--blue">Nizampura Cross (2 mins)</p>
                </div>
                <div className="gl-dmetric">
                  <span className="gl-dmetric-label">Telemetry Signal</span>
                  <p className="gl-dmetric-val gl-dmetric-val--green">Strong (4G LTE)</p>
                </div>
              </div>
            </div>

            {/* Instant Pass Access Card */}
            <div className="gl-demo-pass-card">
              <div className="gl-pass-card-head">
                <div>
                  <span className="gl-dpass-badge">DIGITAL CAMPUS PASS</span>
                  <h4 className="gl-dpass-name">Rahul Sharma</h4>
                  <p className="gl-dpass-sub">ID: GSFC20260125 · B.Tech Chemical / CSE</p>
                </div>
                <span className="gl-dpass-valid">✓ VALID PASS</span>
              </div>

              <div className="gl-dpass-body">
                <div className="gl-dpass-qr-visual">
                  📱
                </div>
                <div>
                  <strong className="gl-dpass-route-text">Route R-04 (Zone B)</strong>
                  <p className="gl-dpass-seat">Assigned Bus: BUS-104 · Seat #14</p>
                  <p className="gl-dpass-fee">Fee Verified · Full Annual Access</p>
                </div>
              </div>

              <button className="gl-btn-primary gl-btn--full" onClick={() => navigate("/login")}>
                <span>Access Student Pass</span>
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ACCORDION SECTION ────────────────────────────── */}
      <section className="gl-faq-section" id="faq">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-badge-subtle">HAVE QUESTIONS?</span>
            <h2 className="gl-section-title">Frequently Asked Questions</h2>
            <p className="gl-section-desc">
              Everything you need to know about campus transit passes, live fleet GPS tracking, and safety protocols.
            </p>
          </div>

          <div className="gl-faq-accordion">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`gl-faq-item ${isOpen ? "is-open" : ""}`}>
                  <button
                    className="gl-faq-trigger"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="gl-faq-question">{faq.q}</span>
                    <span className="gl-faq-icon">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="gl-faq-content">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 11. FINAL HIGH-IMPACT CTA ────────────────────────────── */}
      <section className="gl-final-cta-section">
        <div className="gl-cta-glow" />
        <div className="gl-container">
          <div className="gl-final-cta-card">
            <h2 className="gl-final-title">Move smarter.<br />Travel safer.</h2>
            <p className="gl-final-sub">
              One connected platform for the entire campus transit experience. Available for all students, drivers, and faculty.
            </p>
            <div className="gl-final-buttons">
              <button className="gl-btn-hero-primary" onClick={() => navigate("/login")}>
                <span>Student Login</span>
                <Icon name="arrowRight" size={16} />
              </button>
              <button className="gl-btn-hero-secondary" onClick={() => navigate("/login")}>
                <span>Get Started with GLOW</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. PROFESSIONAL ENTERPRISE FOOTER ────────────────────── */}
      <footer className="gl-footer">
        <div className="gl-container">
          <div className="gl-footer-grid">
            {/* Col 1: Brand */}
            <div className="gl-footer-brand-col">
              <div className="gl-footer-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <GlowLogo width={76} darkMode={true} />
              </div>
              <p className="gl-footer-tagline">
                The smart campus bus transit operating system delivering real-time safety, digital pass convenience, and reliable mobility.
              </p>
              <div className="gl-footer-meta">
                <span>Room 302, GSFC University Transportation Cell</span>
                <span>Vigyan Bhavan, Fertilizernagar, Vadodara - 391750</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="gl-footer-col">
              <h4 className="gl-footer-heading">Platform</h4>
              <ul className="gl-footer-list">
                <li><button onClick={() => scrollToSection("features")}>Features</button></li>
                <li><button onClick={() => scrollToSection("demo")}>Live Fleet Telemetry</button></li>
                <li><button onClick={() => scrollToSection("how-it-works")}>How It Works</button></li>
                <li><button onClick={() => navigate("/login")}>Student Mobility Portal</button></li>
                <li><button onClick={() => navigate("/login")}>Driver Mobile Cockpit</button></li>
              </ul>
            </div>

            {/* Col 3: Operations & Admin */}
            <div className="gl-footer-col">
              <h4 className="gl-footer-heading">Operations</h4>
              <ul className="gl-footer-list">
                <li><button onClick={() => navigate("/login")}>Super Admin Center</button></li>
                <li><button onClick={() => navigate("/login")}>Finance & Fee Ledger</button></li>
                <li><button onClick={() => navigate("/login")}>Transport Operations</button></li>
                <li><button onClick={() => scrollToSection("safety")}>Safety & Protocol</button></li>
                <li><button onClick={() => scrollToSection("faq")}>Knowledge Base</button></li>
              </ul>
            </div>

            {/* Col 4: Support & SOS */}
            <div className="gl-footer-col">
              <h4 className="gl-footer-heading">Support & Emergency</h4>
              <ul className="gl-footer-list">
                <li className="gl-footer-sos">
                  <a href="tel:18004569287">🚨 24/7 SOS: 1800-GLOW-BUS</a>
                </li>
                <li><a href="tel:0265224400">📞 Desk: +91 (0265) 224400</a></li>
                <li><a href="mailto:transit@gsfcuni.edu.in">📧 transit@gsfcuni.edu.in</a></li>
                <li><span className="gl-status-pill-green">● All Systems Normal</span></li>
              </ul>
            </div>
          </div>

          <div className="gl-footer-bottom">
            <span>© 2026 GLOW Campus Transit System · GSFC University, Vadodara.</span>
            <div className="gl-footer-bottom-links">
              <button onClick={() => navigate("/login")}>Privacy Policy</button>
              <span>·</span>
              <button onClick={() => navigate("/login")}>Terms of Service</button>
              <span>·</span>
              <button onClick={() => navigate("/login")}>Security Verification</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageView;
