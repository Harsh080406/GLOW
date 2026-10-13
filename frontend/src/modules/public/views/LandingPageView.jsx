import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlowLogo from "../../../shared/assets/GlowLogo";
import campusBusHero from "../../../shared/assets/campus-bus-hero.jpg";
import glowStudentsBanner from "../../../shared/assets/glow-students-banner.jpg";
import RealMapView from "../../../shared/components/RealMapView";
import "./LandingPage.css";

// ── SVG ICONS (CLEAN HEROICON / LUCIDE STYLE) ─────────────────────
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    chevronDown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
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
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    layout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mockTab, setMockTab] = useState("dashboard");

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

  // Ensure body scroll is never trapped
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Allow mobile drawer to close before computing position and scrolling
    setTimeout(() => {
      const targetId = id === "faqs" ? "faq" : id;
      const el = document.getElementById(targetId) || document.getElementById(id);
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    }, 60);
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
      stopsList: [
        { name: "Fatehgunj Circle", lat: 22.3245, lng: 73.1880, orderIndex: 1 },
        { name: "Nizampura Main Cross", lat: 22.3360, lng: 73.1795, orderIndex: 2 },
        { name: "Chhani Jakat Naka", lat: 22.3485, lng: 73.1710, orderIndex: 3 },
        { name: "Bajwa Crossing", lat: 22.3550, lng: 73.1620, orderIndex: 4 },
        { name: "Fertilizernagar Gate", lat: 22.3605, lng: 73.1590, orderIndex: 5 },
        { name: "GSFC University Gate 1", lat: 22.3615, lng: 73.1550, orderIndex: 6, isDestination: true },
      ],
      sampleBuses: [
        { busId: "BUS-104", lat: 22.3485, lng: 73.1710, speed: 42, routeName: "Fatehgunj Express", status: "On Time", nextStop: "Bajwa Crossing" },
      ],
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
      stopsList: [
        { name: "Alkapuri Hub", lat: 22.3080, lng: 73.1670, orderIndex: 1 },
        { name: "RC Dutt Road", lat: 22.3120, lng: 73.1710, orderIndex: 2 },
        { name: "Sayajigunj Tower", lat: 22.3180, lng: 73.1810, orderIndex: 3 },
        { name: "GSFC University Vigyan Bhavan", lat: 22.3615, lng: 73.1550, orderIndex: 4, isDestination: true },
      ],
      sampleBuses: [
        { busId: "BUS-101", lat: 22.3120, lng: 73.1710, speed: 36, routeName: "Alkapuri Corridor", status: "On Time", nextStop: "Sayajigunj" },
      ],
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
      stopsList: [
        { name: "Manjalpur Naka", lat: 22.2700, lng: 73.1950, orderIndex: 1 },
        { name: "Tarsali Susen Circle", lat: 22.2850, lng: 73.2050, orderIndex: 2 },
        { name: "Pratapnagar Heritage", lat: 22.2980, lng: 73.1980, orderIndex: 3 },
        { name: "GSFC University North Gate", lat: 22.3615, lng: 73.1550, orderIndex: 4, isDestination: true },
      ],
      sampleBuses: [
        { busId: "BUS-107", lat: 22.2850, lng: 73.2050, speed: 38, routeName: "Manjalpur Line", status: "On Time", nextStop: "Pratapnagar" },
      ],
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
      stopsList: [
        { name: "Waghodia Cross Road", lat: 22.2950, lng: 73.2350, orderIndex: 1 },
        { name: "Bapod Gurukul", lat: 22.3100, lng: 73.2250, orderIndex: 2 },
        { name: "Amit Nagar Circle", lat: 22.3320, lng: 73.2020, orderIndex: 3 },
        { name: "GSFC Academic Quad", lat: 22.3615, lng: 73.1550, orderIndex: 4, isDestination: true },
      ],
      sampleBuses: [
        { busId: "BUS-112", lat: 22.3100, lng: 73.2250, speed: 32, routeName: "Waghodia Commuter", status: "Delayed", nextStop: "Amit Nagar Circle" },
      ],
    },
  ];

  const activeRoute = SAMPLE_ROUTES.find((r) => r.id === activeRouteTab) || SAMPLE_ROUTES[0];

  return (
    <div className="glow-landing">
      {/* ── 1. MODERN APICENTER-INSPIRED STICKY NAVBAR ──────────── */}
      <header className={`gl-navbar ${isScrolled ? "gl-navbar--scrolled" : ""}`}>
        <div className="gl-container gl-navbar-inner">
          {/* Official GLOW Logo */}
          <div className="gl-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="GLOW Campus Transit">
            <GlowLogo width={105} darkMode={false} />
          </div>

          {/* Center Navigation Links */}
          <nav className="gl-nav-links" aria-label="Main Navigation">
            <button className="gl-nav-link" onClick={() => scrollToSection("features")}>
              <span>Features</span>
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("how-it-works")}>
              <span>How It Works</span>
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("portals")}>
              <span>Portals</span>
              <Icon name="chevronDown" size={13} className="gl-caret" />
            </button>
            <button className="gl-nav-link" onClick={() => scrollToSection("faq")}>
              <span>FAQ</span>
            </button>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="gl-nav-actions">
            <button
              type="button"
              className="gl-search-btn"
              onClick={() => setShowSearchModal(true)}
              title="Search routes or stops"
              aria-label="Search routes"
            >
              <Icon name="search" size={17} />
            </button>

            <button className="gl-link-login" onClick={() => navigate("/login")}>
              Log In
            </button>

            <button className="gl-btn-green-pill" onClick={() => navigate("/login")}>
              <span>Try For Free</span>
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
                  Platform Features
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("how-it-works")}>
                  How It Works
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("portals")}>
                  Campus Portals
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("support")}>
                  Support & Help
                </button>
                <button className="gl-mobile-link" onClick={() => scrollToSection("faq")}>
                  FAQs
                </button>
              </nav>
              <div className="gl-mobile-actions">
                <button
                  className="gl-link-login gl-btn--full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  Log In
                </button>
                <button
                  className="gl-btn-green-pill gl-btn--full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  <span>Try For Free</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO SECTION (APICENTER TWO-TONE WITH FLOATING BROWSER MOCKUP) ── */}
      <section className="gl-hero-modern">
        <div className="gl-container">
          <div className="gl-hero-layout">
            
            {/* Left Column: Bold Typography & CTA Actions */}
            <div className="gl-hero-left">
              <h1 className="gl-hero-headline">
                Automate your <br />
                <span className="gl-hero-headline-blue">Campus Transit</span>
              </h1>

              <p className="gl-hero-paragraph">
                Smart mobility platform designed to scale your university transit ecosystem, track campus buses in real-time GPS, and assure a fluid and secure flow of student travel.
              </p>

              <div className="gl-hero-cta-wrap">
                <button
                  type="button"
                  className="gl-btn-blue-pill"
                  onClick={() => navigate("/login")}
                  id="hero-get-started-btn"
                >
                  <span>GET STARTED NOW</span>
                </button>
                <button
                  type="button"
                  className="gl-btn-secondary-pill"
                  onClick={() => scrollToSection("features")}
                  id="hero-explore-features-btn"
                >
                  <Icon name="radar" size={15} />
                  <span>Platform Features</span>
                </button>
              </div>

              {/* Feature Checklist Strip */}
              <div className="gl-hero-features-list">
                <div className="gl-hero-feat-item">
                  <span className="gl-feat-check">✓</span>
                  <span>Instant QR Passes</span>
                </div>
                <div className="gl-hero-feat-item">
                  <span className="gl-feat-check">✓</span>
                  <span>Live GPS Telemetry</span>
                </div>
                <div className="gl-hero-feat-item">
                  <span className="gl-feat-check">✓</span>
                  <span>Direct SOS Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Column: Layered Campus Photo + Floating MacOS Browser Mockup */}
            <div className="gl-hero-right">
              {/* Lifestyle Background Photo */}
              <div className="gl-hero-bg-photo-wrap">
                <img
                  src={glowStudentsBanner}
                  alt="GSFC University Campus Commuters"
                  className="gl-hero-bg-photo"
                />
              </div>

              {/* Floating MacOS Dashboard Mockup Card */}
              <div className="gl-browser-mockup">
                {/* Browser Window Header Chrome */}
                <div className="gl-browser-header">
                  <div className="gl-browser-dots">
                    <span className="gl-dot gl-dot--red" />
                    <span className="gl-dot gl-dot--yellow" />
                    <span className="gl-dot gl-dot--green" />
                  </div>
                  <div className="gl-browser-nav-icons">
                    <Icon name="layout" size={13} className="gl-b-icon" />
                    <span className="gl-b-arrow">‹</span>
                    <span className="gl-b-arrow">›</span>
                  </div>
                  <div className="gl-browser-url-bar">
                    <Icon name="shield" size={11} className="gl-url-icon" />
                    <span className="gl-url-text">
                      {mockTab === "dashboard" && "glow.campus.transit/dashboard"}
                      {mockTab === "routes" && "glow.campus.transit/live-routes"}
                      {mockTab === "pass" && "glow.campus.transit/digital-pass"}
                      {mockTab === "telemetry" && "glow.campus.transit/fleet-telemetry"}
                      {mockTab === "support" && "glow.campus.transit/sos-support"}
                    </span>
                    <Icon name="lock" size={10} className="gl-url-lock" />
                  </div>
                </div>

                {/* Browser Dashboard Interior */}
                <div className="gl-browser-body">
                  {/* Left Mini Sidebar */}
                  <div className="gl-mock-sidebar">
                    <div className="gl-mock-logo">
                      <GlowLogo width={66} darkMode={false} />
                    </div>

                    <div className="gl-mock-menu">
                      <div
                        className={`gl-mock-nav-item ${mockTab === "dashboard" ? "gl-mock-nav-item--active" : ""}`}
                        onClick={() => setMockTab("dashboard")}
                      >
                        <Icon name="radar" size={13} />
                        <span>Dashboard</span>
                      </div>
                      <div
                        className={`gl-mock-nav-item ${mockTab === "routes" ? "gl-mock-nav-item--active" : ""}`}
                        onClick={() => setMockTab("routes")}
                      >
                        <Icon name="route" size={13} />
                        <span>Live Routes</span>
                      </div>
                      <div
                        className={`gl-mock-nav-item ${mockTab === "pass" ? "gl-mock-nav-item--active" : ""}`}
                        onClick={() => setMockTab("pass")}
                      >
                        <Icon name="pass" size={13} />
                        <span>Digital Pass</span>
                      </div>
                      <div
                        className={`gl-mock-nav-item ${mockTab === "telemetry" ? "gl-mock-nav-item--active" : ""}`}
                        onClick={() => setMockTab("telemetry")}
                      >
                        <Icon name="bus" size={13} />
                        <span>Fleet Telemetry</span>
                      </div>
                      <div
                        className={`gl-mock-nav-item ${mockTab === "support" ? "gl-mock-nav-item--active" : ""}`}
                        onClick={() => setMockTab("support")}
                      >
                        <Icon name="sos" size={13} />
                        <span>Support</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Dashboard Content */}
                  <div className="gl-mock-content">
                    {/* TAB 1: DASHBOARD */}
                    {mockTab === "dashboard" && (
                      <>
                        <div className="gl-mock-tab-header">
                          <span className="gl-mock-tab-active">Dashboard</span>
                        </div>

                        {/* Top Solid Blue Welcome Banner */}
                        <div className="gl-mock-blue-card">
                          <h4 className="gl-mock-card-title">Welcome to GLOW BDS</h4>
                          <p className="gl-mock-card-text">
                            Real-time GPS tracking is active across all campus transit routes. Track your bus live & verify digital passes seamlessly.
                          </p>
                          <button
                            type="button"
                            className="gl-mock-white-btn"
                            onClick={() => navigate("/login")}
                          >
                            <span>START TRACKING NOW</span>
                          </button>
                        </div>

                        {/* Bottom Dashed Action Box */}
                        <div className="gl-mock-dashed-card">
                          <button
                            type="button"
                            className="gl-mock-blue-action-btn"
                            onClick={() => navigate("/login")}
                          >
                            <span>+ ADD NEW TRANSPORT PASS</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* TAB 2: LIVE ROUTES */}
                    {mockTab === "routes" && (
                      <>
                        <div className="gl-mock-tab-header">
                          <span className="gl-mock-tab-active">Live Corridors & Fleet</span>
                        </div>

                        <div className="gl-mock-routes-list">
                          <div className="gl-mock-route-item" onClick={() => navigate("/login")}>
                            <div className="gl-mock-route-badge">BUS-104</div>
                            <div className="gl-mock-route-info">
                              <strong>Fatehgunj Express</strong>
                              <span>● On Time · 42 km/h · Next: Chhani</span>
                            </div>
                            <span className="gl-mock-route-tag">Live GPS</span>
                          </div>
                          <div className="gl-mock-route-item" onClick={() => navigate("/login")}>
                            <div className="gl-mock-route-badge gl-badge-green">BUS-108</div>
                            <div className="gl-mock-route-info">
                              <strong>Alkapuri Corridor</strong>
                              <span>● Approaching Vigyan Bhavan</span>
                            </div>
                            <span className="gl-mock-route-tag">Gate 1</span>
                          </div>
                        </div>

                        <div className="gl-mock-dashed-card">
                          <button
                            type="button"
                            className="gl-mock-blue-action-btn"
                            onClick={() => navigate("/login")}
                          >
                            <span>+ VIEW TIMETABLES & SEATS</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* TAB 3: DIGITAL PASS */}
                    {mockTab === "pass" && (
                      <>
                        <div className="gl-mock-tab-header">
                          <span className="gl-mock-tab-active">Digital HMAC Pass</span>
                        </div>

                        <div className="gl-mock-pass-card" onClick={() => navigate("/login")}>
                          <div className="gl-mock-pass-top">
                            <span className="gl-mock-pass-id">ID: GSFC-2026-CS88</span>
                            <span className="gl-mock-pass-status">● ACTIVE PASS</span>
                          </div>
                          <div className="gl-mock-pass-body">
                            <div className="gl-mock-qr-box">
                              <div className="gl-mock-qr-matrix">
                                <span /><span /><span /><span /><span /><span /><span /><span /><span />
                              </div>
                              <span className="gl-mock-qr-text">Scan at Bus</span>
                            </div>
                            <div className="gl-mock-pass-meta">
                              <strong>Mahesh V. Sharma</strong>
                              <span>B.Tech CSE · Semester 6</span>
                              <span className="gl-mock-pass-route">Corridor: Fatehgunj Hub</span>
                            </div>
                          </div>
                        </div>

                        <div className="gl-mock-dashed-card">
                          <button
                            type="button"
                            className="gl-mock-blue-action-btn"
                            onClick={() => navigate("/login")}
                          >
                            <span>+ RENEW PASS / DOWNLOAD</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* TAB 4: FLEET TELEMETRY */}
                    {mockTab === "telemetry" && (
                      <>
                        <div className="gl-mock-tab-header">
                          <span className="gl-mock-tab-active">Fleet Telemetry HUD</span>
                        </div>

                        <div className="gl-mock-telemetry-box" onClick={() => navigate("/login")}>
                          <div className="gl-mock-telemetry-grid">
                            <div className="gl-mock-tele-cell">
                              <span className="gl-tele-k">GPS SPEED</span>
                              <span className="gl-tele-v">42 km/h</span>
                            </div>
                            <div className="gl-mock-tele-cell">
                              <span className="gl-tele-k">LATENCY</span>
                              <span className="gl-tele-v gl-text-green">28 ms</span>
                            </div>
                            <div className="gl-mock-tele-cell">
                              <span className="gl-tele-k">OCCUPANCY</span>
                              <span className="gl-tele-v gl-text-blue">38 / 50</span>
                            </div>
                            <div className="gl-mock-tele-cell">
                              <span className="gl-tele-k">COORDINATES</span>
                              <span className="gl-tele-v">22.348°N</span>
                            </div>
                          </div>
                        </div>

                        <div className="gl-mock-dashed-card">
                          <button
                            type="button"
                            className="gl-mock-blue-action-btn"
                            onClick={() => navigate("/login")}
                          >
                            <span>+ OPEN DISPATCH CONSOLE</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* TAB 5: SUPPORT */}
                    {mockTab === "support" && (
                      <>
                        <div className="gl-mock-tab-header">
                          <span className="gl-mock-tab-active">Support & Emergency Desk</span>
                        </div>

                        <div className="gl-mock-support-box" onClick={() => navigate("/login")}>
                          <div className="gl-mock-sos-row">
                            <div className="gl-mock-sos-icon">🚨</div>
                            <div className="gl-mock-sos-text">
                              <strong>Campus Security Dispatch</strong>
                              <span>Vigyan Bhavan Central Bay · +91 265 309 3700</span>
                            </div>
                          </div>
                          <p className="gl-mock-sos-note">
                            24/7 assistance for route enquiries & passenger safety.
                          </p>
                        </div>

                        <div className="gl-mock-dashed-card gl-mock-dashed-card--red">
                          <button
                            type="button"
                            className="gl-mock-red-action-btn"
                            onClick={() => navigate("/login")}
                          >
                            <span>🚨 TRIGGER LIVE SOS ALERT</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. CONTINUOUS RUNNING METRICS TICKER ──────────────────── */}
      <section className="gl-metrics-ticker-section" id="features">
        <div className="gl-metrics-ticker-wrap">
          <div className="gl-metrics-ticker-track">
            {/* Set 1 */}
            {[
              { val: "4,250+", label: "Daily Campus Commuters", sub: "Students, professors & staff", color: "blue", icon: "👥" },
              { val: "100%", label: "Campus Route Coverage", sub: "All major Vadodara sectors", color: "cyan", icon: "🗺️" },
              { val: "99.4%", label: "On-Time Reliability", sub: "Calculated across 52 daily shifts", color: "green", icon: "⏱️" },
              { val: "< 2s", label: "QR Boarding Verification", sub: "Instant cryptographic attendance", color: "purple", icon: "⚡" },
              { val: "Live GPS", label: "Telemetry Broadcast", sub: "Sub-second coordinate sync", color: "blue", icon: "🛰️" },
              { val: "24/7 SOS", label: "Security Response", sub: "Direct link to Vigyan Bhavan", color: "green", icon: "🛡️" },
            ].map((stat, idx) => (
              <div key={`stat-1-${idx}`} className="gl-stat-ticker-card">
                <span className="gl-ticker-icon">{stat.icon}</span>
                <div className="gl-ticker-content">
                  <div className={`gl-stat-val gl-text-${stat.color}`}>{stat.val}</div>
                  <div className="gl-stat-heading">{stat.label}</div>
                  <div className="gl-stat-sub">{stat.sub}</div>
                </div>
              </div>
            ))}

            {/* Set 2 (Duplicated for seamless infinite loop) */}
            {[
              { val: "4,250+", label: "Daily Campus Commuters", sub: "Students, professors & staff", color: "blue", icon: "👥" },
              { val: "100%", label: "Campus Route Coverage", sub: "All major Vadodara sectors", color: "cyan", icon: "🗺️" },
              { val: "99.4%", label: "On-Time Reliability", sub: "Calculated across 52 daily shifts", color: "green", icon: "⏱️" },
              { val: "< 2s", label: "QR Boarding Verification", sub: "Instant cryptographic attendance", color: "purple", icon: "⚡" },
              { val: "Live GPS", label: "Telemetry Broadcast", sub: "Sub-second coordinate sync", color: "blue", icon: "🛰️" },
              { val: "24/7 SOS", label: "Security Response", sub: "Direct link to Vigyan Bhavan", color: "green", icon: "🛡️" },
            ].map((stat, idx) => (
              <div key={`stat-2-${idx}`} className="gl-stat-ticker-card">
                <span className="gl-ticker-icon">{stat.icon}</span>
                <div className="gl-ticker-content">
                  <div className={`gl-stat-val gl-text-${stat.color}`}>{stat.val}</div>
                  <div className="gl-stat-heading">{stat.label}</div>
                  <div className="gl-stat-sub">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CORE PLATFORM FEATURES (THE GRID) ────────────────── */}
      <section className="gl-section gl-bg-subtle" id="features">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-eyebrow">INTELLIGENT CAMPUS MOBILITY</span>
            <h2 className="gl-section-title">Engineered for Reliability, Speed & Safety</h2>
            <p className="gl-section-desc">
              A comprehensive university transport suite replacing obsolete paper passes and uncoordinated buses with synchronized real-time fleet intelligence.
            </p>
          </div>

          <div className="gl-features-showcase-grid">
            {/* Feature 1 */}
            <div className="gl-feature-showcase-card" onClick={() => navigate("/login")}>
              <div className="gl-feat-icon-bubble gl-bg-blue-soft">
                <Icon name="pass" size={24} className="gl-text-blue" />
              </div>
              <span className="gl-feat-tag">Instant Boarding</span>
              <h3 className="gl-feat-title">Cryptographic HMAC Digital Passes</h3>
              <p className="gl-feat-desc">
                Digitally signed dynamic QR passes generated inside the Student Portal. Validated in under 2 seconds by drivers with zero paperwork required.
              </p>
              <div className="gl-feat-bullets">
                <span>✓ Dynamic HMAC-SHA256 signature</span>
                <span>✓ Offline scanner compatibility</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="gl-feature-showcase-card" onClick={() => navigate("/login")}>
              <div className="gl-feat-icon-bubble gl-bg-green-soft">
                <Icon name="radar" size={24} className="gl-text-green" />
              </div>
              <span className="gl-feat-tag">Live Satellite Sync</span>
              <h3 className="gl-feat-title">Sub-Second Fleet GPS Telemetry</h3>
              <p className="gl-feat-desc">
                High-frequency GPS broadcasting allows students and administrators to track exact shuttle locations, speed, and real-time arrival ETAs.
              </p>
              <div className="gl-feat-bullets">
                <span>✓ Sub-second live coordinate sync</span>
                <span>✓ Intelligent stop arrival predictions</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="gl-feature-showcase-card" onClick={() => navigate("/login")}>
              <div className="gl-feat-icon-bubble gl-bg-purple-soft">
                <Icon name="route" size={24} className="gl-text-purple" />
              </div>
              <span className="gl-feat-tag">Congestion Relief</span>
              <h3 className="gl-feat-title">Dynamic Corridor Load Balancing</h3>
              <p className="gl-feat-desc">
                Real-time seat occupancy monitors distribute commuters evenly across parallel morning and evening corridors serving shared destinations.
              </p>
              <div className="gl-feat-bullets">
                <span>✓ Automated capacity redistribution</span>
                <span>✓ Peak-hour bus fleet scaling</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="gl-feature-showcase-card" onClick={() => navigate("/login")}>
              <div className="gl-feat-icon-bubble gl-bg-cyan-soft">
                <Icon name="shield" size={24} className="gl-text-cyan" />
              </div>
              <span className="gl-feat-tag">Finance Integration</span>
              <h3 className="gl-feat-title">Online Fees & Challan Verification</h3>
              <p className="gl-feat-desc">
                Semester transit fees can be cleared via Cards/UPI for immediate pass activation or by uploading physical bank deposit challan receipts.
              </p>
              <div className="gl-feat-bullets">
                <span>✓ Instant UPI & Card gateways</span>
                <span>✓ Finance Officer bank challan queue</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="gl-feature-showcase-card" onClick={() => navigate("/login")}>
              <div className="gl-feat-icon-bubble gl-bg-red-soft">
                <Icon name="sos" size={24} className="gl-text-red" />
              </div>
              <span className="gl-feat-tag">24/7 Rapid Response</span>
              <h3 className="gl-feat-title">One-Tap Emergency SOS Dispatch</h3>
              <p className="gl-feat-desc">
                Dedicated SOS trigger transmits instant satellite coordinates and passenger rosters directly to Campus Security Control at Vigyan Bhavan.
              </p>
              <div className="gl-feat-bullets">
                <span>✓ High-priority security dispatch</span>
                <span>✓ Live passenger manifest broadcast</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="gl-feature-showcase-card" onClick={() => navigate("/login")}>
              <div className="gl-feat-icon-bubble gl-bg-amber-soft">
                <Icon name="bus" size={24} className="gl-text-amber" />
              </div>
              <span className="gl-feat-tag">Operations Hub</span>
              <h3 className="gl-feat-title">Duty Rosters & Fleet Governance</h3>
              <p className="gl-feat-desc">
                Comprehensive dispatch cockpit to assign drivers, monitor roadworthiness, schedule vehicle maintenance, and inspect transit audit logs.
              </p>
              <div className="gl-feat-bullets">
                <span>✓ Automated driver duty rostering</span>
                <span>✓ Multi-level audit logs & compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4B. HOW IT WORKS (3-STEP WORKFLOW) ───────────────────── */}
      <section className="gl-section" id="how-it-works">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-eyebrow">SIMPLE 3-STEP PROCESS</span>
            <h2 className="gl-section-title">How GLOW BDS Works for Commuters</h2>
            <p className="gl-section-desc">
              Experience frictionless university transport in three effortless steps.
            </p>
          </div>

          <div className="gl-workflow-grid">
            <div className="gl-workflow-card">
              <div className="gl-step-number">01</div>
              <h3 className="gl-step-title">Select Route & Stop</h3>
              <p className="gl-step-desc">
                Choose your nearest residential pickup point connecting Vadodara to GSFC University (Vigyan Bhavan Main Campus).
              </p>
            </div>

            <div className="gl-workflow-card">
              <div className="gl-step-number">02</div>
              <h3 className="gl-step-title">Activate HMAC Pass</h3>
              <p className="gl-step-desc">
                Complete semester fee clearance online or via bank challan to generate your cryptographically signed dynamic QR pass.
              </p>
            </div>

            <div className="gl-workflow-card">
              <div className="gl-step-number">03</div>
              <h3 className="gl-step-title">Board & Track Live</h3>
              <p className="gl-step-desc">
                Scan your pass at the bus door in under 2 seconds, track shuttle ETA in real time, and commute with peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CAMPUS PORTALS FOR EVERY ROLE ─────────────────────── */}
      <section className="gl-section" id="portals">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-eyebrow">ROLE-BASED COCKPITS</span>
            <h2 className="gl-section-title">Dedicated Portals for Every Campus Stakeholder</h2>
            <p className="gl-section-desc">
              Tailored interfaces built specifically for student commuters, bus pilots, transport controllers, and university administration.
            </p>
          </div>

          <div className="gl-portals-grid">
            {/* 1. Student */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-blue-soft">
                <Icon name="pass" size={24} className="gl-text-blue" />
              </div>
              <h3 className="gl-portal-title">Student Commuters</h3>
              <p className="gl-portal-desc">
                Instant digital QR passes, live bus arrival radar, fee management, route timetables, and direct SOS emergency alerts.
              </p>
              <span className="gl-portal-link">
                <span>Open Student Dashboard</span>
                <Icon name="arrowRight" size={14} />
              </span>
            </div>

            {/* 2. Driver */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-green-soft">
                <Icon name="bus" size={24} className="gl-text-green" />
              </div>
              <h3 className="gl-portal-title">Driver Cockpit</h3>
              <p className="gl-portal-desc">
                High-contrast mobile interface for trip telemetry, 1-tap emergency broadcasts, and high-speed QR pass attendance scanning.
              </p>
              <span className="gl-portal-link">
                <span>Launch Driver Cockpit</span>
                <Icon name="arrowRight" size={14} />
              </span>
            </div>

            {/* 3. Transport Manager */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-purple-soft">
                <Icon name="route" size={24} className="gl-text-purple" />
              </div>
              <h3 className="gl-portal-title">Operations & Fleet Control</h3>
              <p className="gl-portal-desc">
                Manage official campus corridors, coordinate vehicle maintenance, optimize stop schedules, and monitor driver duty rosters.
              </p>
              <span className="gl-portal-link">
                <span>Open Operations Hub</span>
                <Icon name="arrowRight" size={14} />
              </span>
            </div>

            {/* 4. Super Admin */}
            <div className="gl-portal-card" onClick={() => navigate("/login")}>
              <div className="gl-portal-icon gl-bg-amber-soft">
                <Icon name="shield" size={24} className="gl-text-amber" />
              </div>
              <h3 className="gl-portal-title">Super Admin Command Center</h3>
              <p className="gl-portal-desc">
                Full governance with 2FA security, user access controls, financial overview, audit logs, and university transit analytics.
              </p>
              <span className="gl-portal-link">
                <span>Access Command Center</span>
                <Icon name="arrowRight" size={14} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SAFETY & SOS ASSURANCE ────────────────────────────── */}
      <section className="gl-section gl-bg-subtle" id="support">
        <div className="gl-container">
          <div className="gl-safety-box">
            <div className="gl-safety-content">
              <div className="gl-safety-badge">
                <span className="gl-red-dot" />
                <span>24/7 Security & Rapid Response</span>
              </div>
              <h2 className="gl-safety-heading">Enterprise Safety Built for Campus Transit</h2>
              <p className="gl-safety-desc">
                Safety is central to GLOW. Every bus transmits live telemetric coordinates. In the event of an incident, the SOS protocol immediately alerts the Vigyan Bhavan Security Control Desk with full manifest details.
              </p>
              <div className="gl-safety-highlights">
                <div className="gl-highlight-item">
                  <Icon name="check" size={18} className="gl-text-green" />
                  <span>Instant Satellite Coordinates & Geofencing</span>
                </div>
                <div className="gl-highlight-item">
                  <Icon name="check" size={18} className="gl-text-green" />
                  <span>Encrypted QR Boarding Authentication</span>
                </div>
                <div className="gl-highlight-item">
                  <Icon name="check" size={18} className="gl-text-green" />
                  <span>Automated Parent & Guardian Dispatch Alerts</span>
                </div>
              </div>
            </div>

            <div className="gl-safety-cta-card">
              <div className="gl-sos-icon-wrap">
                <Icon name="sos" size={32} className="gl-text-red" />
              </div>
              <h4 className="gl-sos-card-title">Campus Security Helpline</h4>
              <p className="gl-sos-card-sub">GSFC University Vigyan Bhavan Control Room</p>
              <a href="tel:+912653093700" className="gl-sos-phone-btn">
                <span>+91 265 309 3700</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FREQUENTLY ASKED QUESTIONS ────────────────────────── */}
      <section className="gl-section" id="faq">
        <div className="gl-container">
          <div className="gl-section-header">
            <span className="gl-eyebrow">COMMON QUESTIONS</span>
            <h2 className="gl-section-title">Frequently Asked Questions</h2>
            <p className="gl-section-desc">
              Everything you need to know about passes, route schedules, and campus fleet operations.
            </p>
          </div>

          <div className="gl-faq-accordion">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`gl-faq-item ${isOpen ? "is-open" : ""}`}>
                  <button
                    className="gl-faq-question"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="gl-faq-chevron">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="gl-faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. CALL TO ACTION BANNER ─────────────────────────────── */}
      <section className="gl-cta-section">
        <div className="gl-container">
          <div className="gl-cta-banner">
            <h2 className="gl-cta-title">Ready to Experience Modern Campus Transit?</h2>
            <p className="gl-cta-desc">
              Access your digital bus pass, track active shuttles, or explore campus transit features in seconds.
            </p>
            <div className="gl-cta-actions">
              <button className="gl-btn-white-pill" onClick={() => navigate("/login")}>
                <span>Get Started Now</span>
                <Icon name="arrowRight" size={16} />
              </button>
              <button className="gl-btn-outline-pill" onClick={() => scrollToSection("features")}>
                <Icon name="radar" size={15} />
                <span>Explore Platform Features</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. SAAS FOOTER ───────────────────────────────────────── */}
      <footer className="gl-footer">
        <div className="gl-container">
          <div className="gl-footer-grid">
            <div className="gl-footer-brand-col">
              <div className="gl-footer-brand">
                <GlowLogo width={92} darkMode={false} />
              </div>
              <p className="gl-footer-about">
                Next-generation intelligent campus transit system developed for GSFC University, Vadodara.
              </p>
              <div className="gl-footer-copy">
                © {new Date().getFullYear()} GSFC University. All rights reserved.
              </div>
            </div>

            <div className="gl-footer-col">
              <h4 className="gl-footer-heading">Portals</h4>
              <ul className="gl-footer-list">
                <li><button onClick={() => navigate("/login")}>Student Portal</button></li>
                <li><button onClick={() => navigate("/login")}>Driver Cockpit</button></li>
                <li><button onClick={() => navigate("/login")}>Operations Hub</button></li>
                <li><button onClick={() => navigate("/login")}>Admin Command Center</button></li>
              </ul>
            </div>

            <div className="gl-footer-col">
              <h4 className="gl-footer-heading">Network</h4>
              <ul className="gl-footer-list">
                <li><button onClick={() => scrollToSection("features")}>Transit Features</button></li>
                <li><button onClick={() => scrollToSection("how-it-works")}>How It Works</button></li>
                <li><button onClick={() => scrollToSection("features")}>GPS Telemetry</button></li>
                <li><button onClick={() => scrollToSection("support")}>Safety & SOS</button></li>
              </ul>
            </div>

            <div className="gl-footer-col">
              <h4 className="gl-footer-heading">Emergency Desk</h4>
              <ul className="gl-footer-list">
                <li><span>Security: +91 265 309 3700</span></li>
                <li><span>Transport: <a href="mailto:glowtransportservices@gmail.com" className="gl-footer-email-link">glowtransportservices@gmail.com</a></span></li>
                <li><span>Campus: Vigyan Bhavan, Vadodara</span></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 10. QUICK SEARCH MODAL ──────────────────────────────── */}
      {showSearchModal && (
        <div className="gl-search-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="gl-search-card" onClick={(e) => e.stopPropagation()}>
            <div className="gl-search-input-row">
              <Icon name="search" size={20} className="gl-search-input-icon" />
              <input
                type="text"
                className="gl-search-input"
                placeholder="Search route (e.g. Fatehgunj, Alkapuri, Waghodia)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button className="gl-search-close" onClick={() => setShowSearchModal(false)}>✕</button>
            </div>

            <div className="gl-search-results">
              {SAMPLE_ROUTES.filter((r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.id.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((r) => (
                <div
                  key={r.id}
                  className="gl-search-result-item"
                  onClick={() => {
                    setActiveRouteTab(r.id);
                    setShowSearchModal(false);
                    navigate("/login");
                  }}
                >
                  <div className="gl-res-id">{r.id}</div>
                  <div className="gl-res-text">
                    <strong>{r.name}</strong>
                    <span>{r.route}</span>
                  </div>
                  <span className="gl-res-arrow">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageView;
