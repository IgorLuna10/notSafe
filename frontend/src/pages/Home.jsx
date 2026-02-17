import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-vh-100 bg-dark text-light d-flex flex-column align-items-center justify-content-center p-4 position-relative overflow-hidden font-sans">
      
      {/* Background Effects (Inline styles for specific blurs) */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1 }}>
          <div className="position-absolute top-0 start-0 bg-primary opacity-25 rounded-circle blur-effect" style={{ width: '400px', height: '400px', filter: 'blur(100px)', transform: 'translate(-20%, -20%)' }}></div>
          <div className="position-absolute bottom-0 end-0 bg-danger opacity-25 rounded-circle blur-effect" style={{ width: '400px', height: '400px', filter: 'blur(100px)', transform: 'translate(20%, 20%)' }}></div>
      </div>

      {/* NAVBAR */}
      <nav className="position-absolute top-0 w-100 p-4 d-flex justify-content-between align-items-center container" style={{ zIndex: 10 }}>
        <div className="fs-3 fw-bold text-gradient">
          notSafe.
        </div>
        <div className="d-flex gap-3 align-items-center">
            <Link to="/about" className="text-decoration-none text-secondary fw-semibold hover-text-white">
                Architecture
            </Link>
            <Link to="/login" className="text-decoration-none text-secondary fw-semibold hover-text-white">
                Sign In
            </Link>
            <Link to="/register" className="btn btn-primary fw-bold rounded-pill shadow-sm">
                Get Started
            </Link>
        </div>
      </nav>

      {/* HERO CONTENT */}
      <div className="container text-center mt-5" style={{ zIndex: 5 }}>
        <div className="d-inline-block px-3 py-1 mb-4 small fw-bold font-monospace text-success border border-success bg-opacity-10 bg-success rounded-pill">
          ENTERPRISE SECURITY SUITE v1.0
        </div>

        <h1 className="display-3 fw-bolder text-white mb-4">
          Secure your workforce <br />
          <span className="text-gradient">
            before the breach.
          </span>
        </h1>
        
        <p className="lead text-secondary mx-auto mb-5" style={{ maxWidth: '600px' }}>
          The all-in-one Mission Control for password auditing, entropy analysis, and breach monitoring. 
          Protect your company with real-time intelligence.
        </p>

        {/* BUTTONS */}
        <div className="d-flex justify-content-center gap-3 mb-5">
            <Link to="/register" className="btn btn-light btn-lg fw-bold rounded-pill px-4">
                Create Company Account
            </Link>
            <Link to="/global" className="btn btn-outline-light btn-lg fw-bold rounded-pill px-4">
                View Global Intelligence
            </Link>
        </div>

        {/* FEATURE CARDS */}
        <div className="row g-4 justify-content-center text-start">
            
            {/* Card 1: Password */}
            <div className="col-md-4">
              <Link to="/audit" className="card bg-glass h-100 text-decoration-none border-secondary hover-shadow transition">
                  <div className="card-body p-4">
                    <div className="mb-3 fs-1">🔑</div>
                    <h3 className="h5 fw-bold text-white mb-2">Password Auditor</h3>
                    <p className="small text-secondary m-0">Check against 800M+ leaked credentials securely.</p>
                  </div>
              </Link>
            </div>

            {/* Card 2: Email */}
            <div className="col-md-4">
              <Link to="/email-monitor" className="card bg-glass h-100 text-decoration-none border-secondary hover-shadow transition">
                  <div className="card-body p-4">
                    <div className="mb-3 fs-1">📧</div>
                    <h3 className="h5 fw-bold text-white mb-2">Email Monitor</h3>
                    <p className="small text-secondary m-0">Scan corporate domains for dark web exposure.</p>
                  </div>
              </Link>
            </div>

            {/* Card 3: Dashboard */}
            <div className="col-md-4">
              <Link to="/login" className="card bg-glass h-100 text-decoration-none border-secondary hover-shadow transition">
                  <div className="card-body p-4">
                    <div className="mb-3 fs-1">🛡️</div>
                    <h3 className="h5 fw-bold text-white mb-2">Company Portal</h3>
                    <p className="small text-secondary m-0">Login to Mission Control to manage campaigns.</p>
                  </div>
              </Link>
            </div>

        </div>
      </div>
    </div>
  );
}