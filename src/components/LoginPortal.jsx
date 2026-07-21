import React, { useState, useEffect, useRef } from 'react';

export default function LoginPortal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation and Feedback States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  
  // Ref for parallax image element
  const imageRef = useRef(null);

  // Parallax effect on mousemove for desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!imageRef.current || window.innerWidth < 1024) return;
      const amount = 15; // amount of movement in px
      const x = (e.clientX / window.innerWidth - 0.5) * amount;
      const y = (e.clientY / window.innerHeight - 0.5) * amount;
      imageRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePasswordToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCheckboxChange = () => {
    setRememberMe((prev) => !prev);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginFeedback(null);
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate authentication API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Feature: Enter 'error' for username to trigger an error styling demo, otherwise succeed
      if (username.toLowerCase() === 'error') {
        setLoginFeedback({
          type: 'error',
          message: 'Invalid username or password. Please try again.'
        });
      } else {
        setLoginFeedback({
          type: 'success',
          message: `Welcome back, ${username}! Redirecting to GLOW Dashboard...`
        });
        // Clear form
        setUsername('');
        setPassword('');
      }
    }, 1500);
  };

  return (
    <div className="app-container">
      <main className="main-layout">
        
        {/* Left Section: Branding & Vision */}
        <section className="branding-section">
          <div className="radial-bg-overlay"></div>
          <div className="branding-content">
            {/* Branding */}
            <div className="brand-logo-container">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmdh0QxKGrG9Nvmbxx1RDlmOqwhr7submgZKCoCjUCQa1rSd_mIEDBNoGWrcz6gnm0FYo_RgrTzaPygVf_8i5TsWKgItMLxpDmbDBkEY8icu-qiG7hlJ3kHGgKW5wU4HpszxWjowXYyQ8AztRQZl9qmKyYPIi7pHE_vOF_FSIh415yiWKgYRaIjf6D8BavSd5mrLkbvX59AXjlsuyhUc2kUPeKQbE1wMialUW8HkzRpEfp8RZTCyHbGBlrUyMK1G3Rrdxz9VPa3Hln" 
                alt="GLOW Logo" 
                className="brand-logo"
              />
              <p className="brand-tagline">
                GSFC University - Live Operations on Wheels
              </p>
            </div>
            
            <h2 className="branding-title">
              Reliable University <br /> Bus Services
            </h2>
            <p className="branding-desc">
              Reliable and efficient university transport services connecting our campus community. Providing safe, comfortable, and timely travel solutions for students.
            </p>
            
            {/* Illustration Container */}
            <div className="illustration-container">
              <img 
                ref={imageRef}
                className="illustration-img" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVn1jrFED2623oksO1H2QZVFiRLANYcktYWFQbVgWI8aldpkkw7Rn_7QQHgWZfabokrPr4EKzoF1mZugq4FSOVISJgE_7u-nmyW8IfCxSD9ZvMi3mHLMDpf8BOPtvnZ8q_mnA9DvWRu17Le0mLKljFLw6GNQo1_jOo-rG1d8lLl1NQqSlRWbDjWFm-XBp2__4f-1KPxNAXjXT3u262kBor8iKbVowa_2lseO3T9-emwLIT4JTVRL7a8BEaZGTEGyUgjnu4RqK1I4ol7aM"
                alt="GLOW High-tech Smart Bus on Campus" 
              />
            </div>
          </div>
        </section>

        {/* Right Section: Login Interface */}
        <section className="login-section">
          <div className="login-card">
            
            <div className="login-header">
              <h3 className="login-title">University Bus Management and Monitoring System</h3>
              <p className="login-subtitle">Access the monitoring dashboard to track and manage university transit operations.</p>
            </div>

            {/* Error or Success feedback */}
            {loginFeedback && (
              <div style={{ marginBottom: '24px' }}>
                {loginFeedback.type === 'error' ? (
                  <div className="alert-error">
                    <span className="material-symbols-outlined">error</span>
                    <span>{loginFeedback.message}</span>
                  </div>
                ) : (
                  <div className="alert-error" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}>
                    <span className="material-symbols-outlined" style={{ color: '#2e7d32' }}>check_circle</span>
                    <span>{loginFeedback.message}</span>
                  </div>
                )}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              
              {/* Username Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon-left">person</span>
                  <input 
                    className={`form-input ${errors.username ? 'form-input-error' : ''}`}
                    id="username" 
                    name="username" 
                    placeholder="Enter your username" 
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors(prev => ({ ...prev, username: null }));
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && (
                  <span className="error-message">
                    <span className="material-symbols-outlined">error</span>
                    {errors.username}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="password">Password</label>
                  <a className="forgot-link" href="#forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
                </div>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon-left">lock</span>
                  <input 
                    className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                    }}
                    disabled={isSubmitting}
                  />
                  <button 
                    className="password-toggle-btn" 
                    onClick={handlePasswordToggle} 
                    type="button"
                    tabIndex="-1"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <span className="material-symbols-outlined">error</span>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Keep me logged in checkbox */}
              <div className="checkbox-container" onClick={handleCheckboxChange}>
                <button
                  type="button"
                  id="remember"
                  className="checkbox-input"
                  role="checkbox"
                  aria-checked={rememberMe}
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleCheckboxChange();
                    }
                  }}
                />
                <label className="checkbox-label" htmlFor="remember" onClick={(e) => e.preventDefault()}>
                  Keep me logged in
                </label>
              </div>

              {/* Action Button */}
              <button 
                className="submit-btn" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="submit-btn-spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

            </form>

            {/* Secondary Actions */}
            <div className="secondary-actions">
              <p className="register-text">
                Register For GLOW? 
                <a className="register-link" href="#register" onClick={(e) => e.preventDefault()}>Create an account</a>
              </p>
              
              <div className="support-container">
                <p className="support-title">Need Support?</p>
                <div className="support-links">
                  <a className="support-btn" href="#help" title="Help Center" onClick={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined">help</span>
                  </a>
                  <a className="support-btn" href="#contact" title="Contact Admin" onClick={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined">mail</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="footer-shell">
        <div className="footer-content">
          <p className="footer-copyright">
            © 2026 GSFC University - GLOW Initiative. All rights reserved.
          </p>
          <div className="footer-links">
            <a className="footer-link" href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="footer-link" href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a className="footer-link" href="#portal" onClick={(e) => e.preventDefault()}>University Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
