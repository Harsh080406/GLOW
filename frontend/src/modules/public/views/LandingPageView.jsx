import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlowLogo from "../../../shared/assets/GlowLogo";
import campusBusHero from "../../../shared/assets/campus-bus-hero.jpg";
import "./LandingPage.css";

// ── CLEAN SVG ICONS (LUCIDE / HEROICON STYLE) ─────────────────────
const Icon = ({ name, size = 18, className = "" }) => {
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
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    wallet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    externalLink: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
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
  const [activeRouteTab, setActiveRouteTab] = useState("R-04");

  // Navbar scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollY > 16);
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

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const FAQS = [
    {
      q: "How do students access their Digital Transit Pass?",
      a: "Every registered commuter receives a cryptographically signed HMAC QR pass under 'Transport Pass' in the Student Portal. Drivers scan this QR code with their mobile scanner in under 2 seconds to log attendance with zero paper slips required.",
    },
    {
      q: "How accurate is the campus fleet tracking and schedule?",
      a: "GLOW campus shuttles operate on synchronized timetable corridors with dedicated campus bays. Students and administration view real-time corridor stops, vehicle assignments, arrival schedules, and route notices across all active campus lines.",
    },
    {
      q: "How does corridor load-balancing prevent overcrowding?",
      a: "The transport engine monitors seat occupancies in real time. If a specific shuttle reaches 85%+ capacity, the system automatically suggests or re-routes waiting commuters at shared stops to parallel under-capacity corridors serving the same drop points.",
    },
    {
      q: "What happens during an emergency or delay?",
      a: "Both the Student Portal and Driver Cockpit feature dedicated SOS emergency triggers. Activating an alert immediately broadcasts high-priority satellite coordinates and passenger manifests to Campus Security Control (Vigyan Bhavan) and emergency contacts.",
    },
    {
      q: "Can fee payments be verified through bank challans?",
      a: "Yes. Students can pay semester transit fees online via Cards/UPI for instant pass activation or upload physical bank deposit challan receipts. Finance Officers review and approve uploaded receipts directly in the Finance Verification queue.",
    },
  ];

  const SAMPLE_ROUTES = [
    {
      id: "R-04",
      name: "Fatehgunj Express",
      route: "Fatehgunj Depot ↔ GSFC University Campus Gate 1",
      stops: 8,
      buses: 14,
      frequency: "Every 12 mins",
      status: "On Time",
      firstBus: "07:15 AM",
      lastBus: "06:30 PM",
    },
    {
      id: "R-01",
      name: "Alkapuri & RC Dutt Corridor",
      route: "Alkapuri Hub ↔ Vigyan Bhavan Complex",
      stops: 10,
      buses: 18,
      frequency: "Every 10 mins",
      status: "Normal Traffic",
      firstBus: "07:00 AM",
      lastBus: "07:00 PM",
    },
    {
      id: "R-07",
      name: "Manjalpur & Makarpura Line",
      route: "Manjalpur Naka ↔ GSFC University North Gate",
      stops: 12,
      buses: 16,
      frequency: "Every 15 mins",
      status: "On Time",
      firstBus: "06:45 AM",
      lastBus: "06:15 PM",
    },
    {
      id: "R-12",
      name: "Waghodia Road Commuter",
      route: "Waghodia Cross ↔ Academic Quadrangle",
      stops: 9,
      buses: 12,
      frequency: "Every 15 mins",
      status: "Minor Delay (3m)",
      firstBus: "07:10 AM",
      lastBus: "06:45 PM",
    },
  ];

  return (
    <div className="glow-landing">
      {/* ── 1. CLEAN LIGHT STICKY NAVBAR ────────────────────────── */}
      <header className={`gl-navbar ${isScrolled ? "gl-navbar--scrolled" : ""}`}>
        <div className="gl-container gl-navbar-inner">
          {/* Brand Logo & University Attribution */}
          <div className="gl-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="gl-logo-wrapper">
              <GlowLogo width={82} darkMode={false} />
            </div>
            <div className="gl-brand-meta">
              <span className="gl-brand-title">Campus Transit</span>
              <span className="gl-brand-sub">GSFC University · Vadodara</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="gl-nav-links" aria-label="Main Navigation">
            <button className="gl-nav-link" onClick={() => scrollToSection("features")}>
              Platform
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("routes")}>
              Corridors & Timetables
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("portals")}>
              Portals
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("safety")}>
              Safety & SOS
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("faq")}>
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="gl-nav-actions">
            <button className="gl-btn-secondary" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="gl-btn-primary" onClick={() => navigate("/login")}>
              <span>Open Portal</span>
              <Icon name="arrowRight" size={14} />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className={`gl-hamburger ${mobileMenuOpen ? "is-active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="gl-mobile-menu">
            <div className="gl-container gl-mobile-menu-inner">
              <nav className="gl-mobile-links">
                <button className="gl-mobile-link" onClick={() => scrollToSection("features")}>
                  Platform Overview
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("routes")}>
                  Corridors & Timetables
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("how-it-works")}>
                  How It Works
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("portals")}>
                  Campus Portals
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("safety")}>
                  Safety & Emergency SOS
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("faq")}>
                  Frequently Asked Questions
                </button>
              </nav>
              <div className="gl-mobile-actions">
                <button
                  className="gl-btn-secondary gl-btn--full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  Sign In
                </button>
                <button
                  className="gl-btn-primary gl-btn--full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  <span>Open Commuter Portal</span>
                  <Icon name="arrowRight" size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO SECTION (EDITORIAL LIGHT PROFESSIONAL) ───────── */}
      <section className="gl-hero">
        <div className="gl-container">
          <div className="gl-hero-grid">
            {/* Left Column: Heading, Subtext, Trust & CTAs */}
            <div className="gl-hero-content">
              <div className="gl-hero-badge">
                <span className="gl-live-indicator" />
                <span>Official Transit System · GSFC University</span>
              </div>

              <h1 className="gl-hero-title">
                Safe, Predictable Campus Transit for Everyone.
              </h1>

              <p className="gl-hero-description">
                Real-time GPS bus tracking, instant cryptographic commuter passes, and automated fleet coordination connecting 4,200+ students and faculty across Vadodara.
              </p>

              <div className="gl-hero-ctas">
                <button className="gl-btn-primary gl-btn--large" onClick={() => navigate("/login")}>
                  <span>Access Commuter Portal</span>
                  <Icon name="arrowRight" size={16} />
                </button>
                <button className="gl-btn-secondary gl-btn--large" onClick={() => scrollToSection("routes")}>
                  <span>View Live Routes</span>
                </button>
              </div>

              {/* Trust & Punctuality Proof Points */}
              <div className="gl-hero-trust-bar">
                <div className="gl-trust-item">
                  <span className="gl-trust-strong">85 Shuttles</span>
                  <span className="gl-trust-sub">Active fleet units</span>
                </div>
                <div className="gl-trust-divider" />
                <div className="gl-trust-item">
                  <span className="gl-trust-strong">34 Corridors</span>
                  <span className="gl-trust-sub">Covering Vadodara</span>
                </div>
                <div className="gl-trust-divider" />
                <div className="gl-trust-item">
                  <span className="gl-trust-strong">99.2%</span>
                  <span className="gl-trust-sub">On-time arrival</span>
                </div>
              </div>
            </div>

            {/* Right Column: Official Campus Bus Fleet Image Showcase */}
            <div className="gl-hero-visual">
              <div className="gl-hero-bus-frame">
                <div className="gl-hero-bus-img-wrap">
                  <img
                    src={campusBusHero}
                    alt="GSFC University Campus Transit Bus"
                    className="gl-hero-bus-img"
                  />
                  {/* Floating Top Status Badge */}
                  <div className="gl-bus-float-badge">
                    <span className="gl-live-dot" />
                    <span>Official University Fleet · Vadodara</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. METRICS OVERVIEW STRIP ────────────────────────────── */}
      <section className="gl-metrics-bar">
        <div className="gl-container">
          <div className="gl-metrics-grid">
            <div className="gl-stat-card">
              <div className="gl-stat-val">4,250+</div>
              <div className="gl-stat-heading">Daily Campus Commuters</div>
              <p className="gl-stat-sub">Students, professors, and administrative staff</p>
            </div>
            <div className="gl-stat-card">
              <div className="gl-stat-val gl-text-blue">85</div>
              <div className="gl-stat-heading">GPS-Monitored Buses</div>
              <p className="gl-stat-sub">Modern fleet serving all university campuses</p>
            </div>
            <div className="gl-stat-card">
              <div className="gl-stat-val">34</div>
              <div className="gl-stat-heading">Active Transit Corridors</div>
              <p className="gl-stat-sub">Direct routes connecting all Vadodara zones</p>
            </div>
            <div className="gl-stat-card">
              <div className="gl-stat-val gl-text-green">&lt; 2s</div>
              <div className="gl-stat-heading">Boarding Scan Speed</div>
              <p className="gl-stat-sub">Instant QR verification with zero paper queues</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ROLE PORTALS / QUICK ACCESS ───────────────────────── */}
      <section className="gl-section gl-bg-subtle" id="portals">
        <div className="gl-container">
          <div className="gl-section-heading">
            <span className="gl-pill">CAMPUS STAKEHOLDER PORTALS</span>
            <h2 className="gl-title">One Unified Transit System, Tailored for Every Role</h2>
            <p className="gl-description">
              Access purpose-built interfaces with dedicated tools, granular role-based security, and live data synchronization.
            </p>
          </div>

          <div className="gl-portals-grid">
            {/* 1. Student Portal */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-blue-soft">
                <Icon name="pass" size={24} className="gl-text-blue" />
              </div>
              <span className="gl-portal-tag">STUDENT COMMUTER</span>
              <h3 className="gl-portal-name">Student Mobility Hub</h3>
              <p className="gl-portal-desc">
                Track assigned shuttles in real time, pull up digital HMAC bus passes, receive stop alerts, and check semester fee balances.
              </p>
              <div className="gl-portal-footer">
                <span>Access Student Portal</span>
                <Icon name="arrowRight" size={14} />
              </div>
            </div>

            {/* 2. Driver Cockpit */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-amber-soft">
                <Icon name="bus" size={24} className="gl-text-amber" />
              </div>
              <span className="gl-portal-tag">DRIVER CREW</span>
              <h3 className="gl-portal-name">Driver Mobile Cockpit</h3>
              <p className="gl-portal-desc">
                Log trip departure and completion, scan student passes offline in under 2s, broadcast corridor delay notices, and trigger emergency SOS.
              </p>
              <div className="gl-portal-footer">
                <span>Access Driver Cockpit</span>
                <Icon name="arrowRight" size={14} />
              </div>
            </div>

            {/* 3. Transport Operations */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-green-soft">
                <Icon name="route" size={24} className="gl-text-green" />
              </div>
              <span className="gl-portal-tag">FLEET DISPATCH</span>
              <h3 className="gl-portal-name">Transport Manager Hub</h3>
              <p className="gl-portal-desc">
                Balance corridor loads, manage driver rosters, monitor bus occupancy rates, inspect vehicle fitness certificates, and export manifests.
              </p>
              <div className="gl-portal-footer">
                <span>Access Fleet Operations</span>
                <Icon name="arrowRight" size={14} />
              </div>
            </div>

            {/* 4. Finance & Bursar */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-purple-soft">
                <Icon name="wallet" size={24} className="gl-text-purple" />
              </div>
              <span className="gl-portal-tag">FINANCE OFFICE</span>
              <h3 className="gl-portal-name">Bursar & Fee Ledger</h3>
              <p className="gl-portal-desc">
                Collect payments, configure fee slabs, approve bank challan deposit slips, generate tax invoices with verification QR, and audit logs.
              </p>
              <div className="gl-portal-footer">
                <span>Access Finance Console</span>
                <Icon name="arrowRight" size={14} />
              </div>
            </div>

            {/* 5. Super Admin */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-slate-soft">
                <Icon name="settings" size={24} className="gl-text-slate" />
              </div>
              <span className="gl-portal-tag">SUPER ADMIN</span>
              <h3 className="gl-portal-name">Executive Administration</h3>
              <p className="gl-portal-desc">
                Campus-wide user directory, RBAC governance, emergency incident resolution, timetable publishing, and complete fleet and corridor governance.
              </p>
              <div className="gl-portal-footer">
                <span>Access Admin Console</span>
                <Icon name="arrowRight" size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CORE CAPABILITIES (LIGHT BENTO GRID) ──────────────── */}
      <section className="gl-section" id="features">
        <div className="gl-container">
          <div className="gl-section-heading">
            <span className="gl-pill">ENGINEERED FOR EXCELLENCE</span>
            <h2 className="gl-title">Core Capabilities Designed for Modern Campuses</h2>
            <p className="gl-description">
              Replacing legacy clipboards, unmonitored delays, and lost paper passes with a modern, high-precision transit architecture.
            </p>
          </div>

          <div className="gl-bento-grid">
            {/* Feature 1: Wide Card */}
            <div className="gl-bento-card gl-bento-card--featured">
              <div className="gl-bento-header">
                <div className="gl-bento-icon gl-bg-blue-soft">
                  <Icon name="radar" size={24} className="gl-text-blue" />
                </div>
                <span className="gl-badge-pill">SCHEDULED CORRIDORS</span>
              </div>
              <h3 className="gl-bento-title">Precision Campus Route Network</h3>
              <p className="gl-bento-desc">
                Structured transit schedules connect all major Vadodara transit hubs directly to GSFC University with predictable arrival intervals, designated campus pickup bays, and minimal transit delays. Commuters always know precisely when to board.
              </p>
              <div className="gl-feature-chips">
                <span className="gl-chip">✓ 34 Dedicated Vadodara Corridors</span>
                <span className="gl-chip">✓ Fixed Morning & Evening Runs</span>
                <span className="gl-chip">✓ Designated Campus Bays</span>
                <span className="gl-chip">✓ Automated Stop Announcements</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="gl-bento-card">
              <div className="gl-bento-header">
                <div className="gl-bento-icon gl-bg-green-soft">
                  <Icon name="pass" size={24} className="gl-text-green" />
                </div>
                <span className="gl-badge-pill">CRYPTOGRAPHIC</span>
              </div>
              <h3 className="gl-bento-title">HMAC-Signed Digital QR Passes</h3>
              <p className="gl-bento-desc">
                Tamper-proof, cryptographically signed digital passes replace physical cards. Drivers scan student passes in under 2 seconds, verifying zone access and semester dues even in offline basement zones.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="gl-bento-card">
              <div className="gl-bento-header">
                <div className="gl-bento-icon gl-bg-red-soft">
                  <Icon name="shield" size={24} className="gl-text-red" />
                </div>
                <span className="gl-badge-pill">24/7 COMMAND</span>
              </div>
              <h3 className="gl-bento-title">Security Dispatch & Panic SOS</h3>
              <p className="gl-bento-desc">
                One-touch emergency triggers dispatch instant alerts to the Campus Security Control Cell at Vigyan Bhavan, sharing real-time vehicle GPS coordinates and passenger manifests.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="gl-bento-card">
              <div className="gl-bento-header">
                <div className="gl-bento-icon gl-bg-purple-soft">
                  <Icon name="route" size={24} className="gl-text-purple" />
                </div>
                <span className="gl-badge-pill">DYNAMIC</span>
              </div>
              <h3 className="gl-bento-title">Corridor Load-Balancing</h3>
              <p className="gl-bento-desc">
                Automatic load balancing moves commuters from overcrowded routes to under-capacity parallel shuttles serving shared stops, keeping occupancy strictly within safety limits.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="gl-bento-card">
              <div className="gl-bento-header">
                <div className="gl-bento-icon gl-bg-amber-soft">
                  <Icon name="wallet" size={24} className="gl-text-amber" />
                </div>
                <span className="gl-badge-pill">AUDITED</span>
              </div>
              <h3 className="gl-bento-title">Integrated Bursar Ledger</h3>
              <p className="gl-bento-desc">
                Direct integration between semester transit fees, bank deposit slip verification, and transport pass validity. Past-due accounts are managed with automated friendly reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. INTERACTIVE ROUTE & TIMETABLE PREVIEW ──────────────── */}
      <section className="gl-section gl-bg-subtle" id="routes">
        <div className="gl-container">
          <div className="gl-section-heading">
            <span className="gl-pill">CAMPUS TRANSIT NETWORK</span>
            <h2 className="gl-title">Explore Active Vadodara Corridors</h2>
            <p className="gl-description">
              Browse regular and examination timetables, stop counts, and live vehicle allocations across major university lines.
            </p>
          </div>

          {/* Route Tabs */}
          <div className="gl-route-tabs">
            {SAMPLE_ROUTES.map((r) => (
              <button
                key={r.id}
                className={`gl-route-tab ${activeRouteTab === r.id ? "is-active" : ""}`}
                onClick={() => setActiveRouteTab(r.id)}
              >
                <strong>{r.id}</strong>
                <span>{r.name}</span>
              </button>
            ))}
          </div>

          {/* Active Route Details Card */}
          {(() => {
            const current = SAMPLE_ROUTES.find((r) => r.id === activeRouteTab) || SAMPLE_ROUTES[0];
            return (
              <div className="gl-route-detail-card">
                <div className="gl-route-card-header">
                  <div>
                    <div className="gl-route-badge-row">
                      <span className="gl-route-id-badge">{current.id}</span>
                      <span className="gl-status-pill-green">● {current.status}</span>
                    </div>
                    <h3 className="gl-route-name-title">{current.name}</h3>
                    <p className="gl-route-sub-text">{current.route}</p>
                  </div>
                  <button className="gl-btn-primary" onClick={() => navigate("/login")}>
                    <span>Track on Live Map</span>
                    <Icon name="arrowRight" size={14} />
                  </button>
                </div>

                <div className="gl-route-meta-grid">
                  <div className="gl-rmeta-box">
                    <span className="gl-rmeta-label">Designated Stops</span>
                    <strong className="gl-rmeta-val">{current.stops} Major Campus Stops</strong>
                  </div>
                  <div className="gl-rmeta-box">
                    <span className="gl-rmeta-label">Allocated Shuttles</span>
                    <strong className="gl-rmeta-val">{current.buses} Volvo Fleet Units</strong>
                  </div>
                  <div className="gl-rmeta-box">
                    <span className="gl-rmeta-label">Service Frequency</span>
                    <strong className="gl-rmeta-val">{current.frequency}</strong>
                  </div>
                  <div className="gl-rmeta-box">
                    <span className="gl-rmeta-label">Operating Window</span>
                    <strong className="gl-rmeta-val">{current.firstBus} – {current.lastBus}</strong>
                  </div>
                </div>

                <div className="gl-route-stops-flow">
                  <span className="gl-flow-label">KEY CORRIDOR STOPS:</span>
                  <div className="gl-flow-chips">
                    <span className="gl-flow-chip">Fatehgunj Circle</span>
                    <span className="gl-flow-arrow">→</span>
                    <span className="gl-flow-chip">Nizampura Main Cross</span>
                    <span className="gl-flow-arrow">→</span>
                    <span className="gl-flow-chip">Chhani Jakat Naka</span>
                    <span className="gl-flow-arrow">→</span>
                    <span className="gl-flow-chip is-highlight">GSFC University Gate 1</span>
                    <span className="gl-flow-arrow">→</span>
                    <span className="gl-flow-chip">Vigyan Bhavan Quad</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── 7. HOW IT WORKS (SIMPLE 3 STEPS) ───────────────────────── */}
      <section className="gl-section" id="how-it-works">
        <div className="gl-container">
          <div className="gl-section-heading">
            <span className="gl-pill">COMMUTER WALKTHROUGH</span>
            <h2 className="gl-title">Your Morning Commute in Three Easy Steps</h2>
            <p className="gl-description">
              Designed for speed, clarity, and zero morning stress for university students and faculty.
            </p>
          </div>

          <div className="gl-steps-grid">
            <div className="gl-step-card">
              <div className="gl-step-badge">STEP 01</div>
              <div className="gl-step-icon gl-bg-blue-soft">
                <Icon name="pass" size={24} className="gl-text-blue" />
              </div>
              <h3 className="gl-step-title">Open Portal & View Assigned Bus</h3>
              <p className="gl-step-text">
                Log in via SSO or student credentials. Your assigned shuttle ID, pickup stop, driver details, and live ETA appear immediately.
              </p>
            </div>

            <div className="gl-step-card">
              <div className="gl-step-badge">STEP 02</div>
              <div className="gl-step-icon gl-bg-green-soft">
                <Icon name="radar" size={24} className="gl-text-green" />
              </div>
              <h3 className="gl-step-title">Track Bus Live to Your Stop</h3>
              <p className="gl-step-text">
                Watch your bus approach on the live map with 4-second GPS precision. Receive an automatic notification when the bus is 5 minutes away.
              </p>
            </div>

            <div className="gl-step-card">
              <div className="gl-step-badge">STEP 03</div>
              <div className="gl-step-icon gl-bg-purple-soft">
                <Icon name="shield" size={24} className="gl-text-purple" />
              </div>
              <h3 className="gl-step-title">Scan Digital Pass & Board</h3>
              <p className="gl-step-text">
                Show your cryptographic QR pass to the driver cockpit scanner. Verification takes less than 2 seconds, logging your boarding seat instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SAFETY & SECURITY COMMAND ─────────────────────────── */}
      <section className="gl-section gl-bg-subtle" id="safety">
        <div className="gl-container">
          <div className="gl-safety-layout">
            <div className="gl-safety-info">
              <span className="gl-pill gl-pill--red">CAMPUS SAFETY PRIORITY</span>
              <h2 className="gl-title">Dedicated Safety Infrastructure for University Transit</h2>
              <p className="gl-description">
                Safety is built into every layer of GLOW. From geofenced speed monitoring to direct security dispatch lines, students and parents can rely on our transit network.
              </p>

              <div className="gl-safety-points">
                <div className="gl-safety-point">
                  <div className="gl-spoint-icon">✓</div>
                  <div>
                    <strong>Continuous Satellite Geofencing</strong>
                    <p>Alerts transport managers instantly if any shuttle deviates from official campus corridors or exceeds 50 km/h.</p>
                  </div>
                </div>
                <div className="gl-safety-point">
                  <div className="gl-spoint-icon">✓</div>
                  <div>
                    <strong>One-Touch SOS Emergency Relay</strong>
                    <p>Drivers and passengers can trigger an emergency beacon that notifies campus police and medical personnel with GPS coordinates.</p>
                  </div>
                </div>
                <div className="gl-safety-point">
                  <div className="gl-spoint-icon">✓</div>
                  <div>
                    <strong>Verified Driver Credentials</strong>
                    <p>All drivers undergo background checks, periodic fitness evaluations, and license validity monitoring.</p>
                  </div>
                </div>
              </div>

              {/* Emergency Hotline Box */}
              <div className="gl-emergency-box">
                <div>
                  <span className="gl-emg-tag">24/7 CAMPUS TRANSIT EMERGENCY HELPLINE</span>
                  <div className="gl-emg-num">1800-GLOW-BUS · (1800-456-9287)</div>
                </div>
                <a href="tel:18004569287" className="gl-btn-emergency">
                  <Icon name="phone" size={16} />
                  <span>Call Emergency Dispatch</span>
                </a>
              </div>
            </div>

            {/* Safety Console Card */}
            <div className="gl-safety-card">
              <div className="gl-scard-top">
                <div className="gl-scard-status">
                  <span className="gl-live-dot" />
                  <strong>CAMPUS SECURITY CELL: ONLINE</strong>
                </div>
                <span className="gl-scard-loc">Room 302, Vigyan Bhavan</span>
              </div>

              <div className="gl-scard-metrics">
                <div className="gl-smetric">
                  <span className="gl-slabel">Active Fleet Shuttles</span>
                  <strong className="gl-sval">85 / 85 Operational</strong>
                </div>
                <div className="gl-smetric">
                  <span className="gl-slabel">Speed Compliance</span>
                  <strong className="gl-sval gl-text-green">100% Within Limit</strong>
                </div>
                <div className="gl-smetric">
                  <span className="gl-slabel">Emergency Incidents</span>
                  <strong className="gl-sval gl-text-green">0 Active Alerts</strong>
                </div>
                <div className="gl-smetric">
                  <span className="gl-slabel">Avg. Response Time</span>
                  <strong className="gl-sval gl-text-blue">&lt; 3.2 Minutes</strong>
                </div>
              </div>

              <div className="gl-scard-footer">
                <div className="gl-verified-seal">
                  <span>🛡️</span>
                  <div>
                    <strong>GSFC University Transportation Cell</strong>
                    <p>Direct communication link with Vadodara City Traffic Police & Emergency Medical Response.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FREQUENTLY ASKED QUESTIONS ────────────────────────── */}
      <section className="gl-section" id="faq">
        <div className="gl-container">
          <div className="gl-section-heading">
            <span className="gl-pill">COMMON INQUIRIES</span>
            <h2 className="gl-title">Frequently Asked Questions</h2>
            <p className="gl-description">
              Find quick answers regarding commuter pass issuance, live GPS tracking, fee receipts, and safety protocols.
            </p>
          </div>

          <div className="gl-faq-container">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`gl-faq-row ${isOpen ? "is-open" : ""}`}>
                  <button
                    className="gl-faq-header"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="gl-faq-q">{faq.q}</span>
                    <span className="gl-faq-toggle">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="gl-faq-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 10. CALL TO ACTION BANNER ────────────────────────────── */}
      <section className="gl-cta-section">
        <div className="gl-container">
          <div className="gl-cta-card">
            <h2 className="gl-cta-heading">Ready for a Smarter Campus Commute?</h2>
            <p className="gl-cta-sub">
              Log in with your university credentials to view your live bus route, access your digital commuter pass, and travel with peace of mind.
            </p>
            <div className="gl-cta-buttons">
              <button className="gl-btn-primary gl-btn--large" onClick={() => navigate("/login")}>
                <span>Sign In to Student Portal</span>
                <Icon name="arrowRight" size={16} />
              </button>
              <button className="gl-btn-secondary gl-btn--large" onClick={() => navigate("/login")}>
                <span>Driver & Staff Login</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. PROFESSIONAL ENTERPRISE FOOTER ────────────────────── */}
      <footer className="gl-footer">
        <div className="gl-container">
          <div className="gl-footer-grid">
            {/* Col 1: Brand & Campus Address */}
            <div className="gl-fcol gl-fcol--brand">
              <div className="gl-fbrand-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <GlowLogo width={84} darkMode={false} />
                <span className="gl-fbrand-tag">Campus Transit</span>
              </div>
              <p className="gl-fdesc">
                The official smart transit and fleet management platform of GSFC University, connecting students and campus operations seamlessly.
              </p>
              <div className="gl-faddress">
                <strong>GSFC University Transportation Cell</strong>
                <span>Room 302, Vigyan Bhavan, P.O. Fertilizernagar</span>
                <span>Vadodara, Gujarat 391750, India</span>
              </div>
            </div>

            {/* Col 2: Commuter Links */}
            <div className="gl-fcol">
              <h4 className="gl-fheading">Commuter Services</h4>
              <ul className="gl-flinks">
                <li><button onClick={() => navigate("/login")}>Student Digital Pass</button></li>
                <li><button onClick={() => scrollToSection("routes")}>Live Route Network</button></li>
                <li><button onClick={() => scrollToSection("features")}>Stop Arrival Notifications</button></li>
                <li><button onClick={() => navigate("/login")}>Semester Fee Ledger</button></li>
                <li><button onClick={() => navigate("/login")}>Grievance & Complaints</button></li>
              </ul>
            </div>

            {/* Col 3: Operations & Portals */}
            <div className="gl-fcol">
              <h4 className="gl-fheading">Campus Portals</h4>
              <ul className="gl-flinks">
                <li><button onClick={() => navigate("/login")}>Driver Mobile Cockpit</button></li>
                <li><button onClick={() => navigate("/login")}>Transport Operations</button></li>
                <li><button onClick={() => navigate("/login")}>Bursar & Finance Desk</button></li>
                <li><button onClick={() => navigate("/login")}>Executive Super Admin</button></li>
                <li><button onClick={() => scrollToSection("safety")}>Security Command Center</button></li>
              </ul>
            </div>

            {/* Col 4: Emergency & Helplines */}
            <div className="gl-fcol">
              <h4 className="gl-fheading">Helplines & Support</h4>
              <ul className="gl-flinks">
                <li className="gl-sos-link">
                  <a href="tel:18004569287">🚨 24/7 SOS: 1800-GLOW-BUS</a>
                </li>
                <li><a href="tel:0265224400">📞 Desk: +91 (0265) 224400</a></li>
                <li><a href="mailto:transit@gsfcuni.edu.in">📧 transit@gsfcuni.edu.in</a></li>
                <li>
                  <span className="gl-status-pill-green">
                    <span className="gl-live-dot" /> All Corridors Operational
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="gl-footer-bottom">
            <span className="gl-copyright">
              © {new Date().getFullYear()} GSFC University Transit System (GLOW). All rights reserved.
            </span>
            <div className="gl-legal-links">
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
