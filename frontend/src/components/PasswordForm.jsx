import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePasswordHasher } from '../hooks/usePasswordHasher';
import { calculateCrackTime } from '../utils';

const PasswordForm = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [crackData, setCrackData] = useState(null);
  
  const { hashPassword, isLoading } = usePasswordHasher();

  // --- 1. REAL-TIME MATH ---
  useEffect(() => {
    if (password) {
      setCrackData(calculateCrackTime(password));
    } else {
      setCrackData(null);
      setResult(null);
    }
  }, [password]);

  // --- 2. AUTO-HIDE RESULT LOGIC ---
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setResult(null);
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    const hashData = await hashPassword(password);
    if (!hashData) return;

    try {
      // Check Pwned Passwords API (via Prefix)
      const response = await axios.get(`/api/v1/check-prefix/${hashData.prefix}`);
      const suffixes = response.data.suffixes;
      const breachEntry = suffixes.find(line => line.startsWith(hashData.suffix));
      const isBreached = !!breachEntry;

      setResult(isBreached ? 'breached' : 'safe');

      // Log Anonymous Check to Backend
      await axios.post('/api/v1/log-check', {
        length: password.length,
        is_breached: isBreached
      }, {
        headers: { 'X-API-Key': 'notsafe_dev_12345' } 
      });

    } catch (err) {
      console.error("API Error:", err);
      setResult('error');
    }
  };

  return (
    <div className="min-vh-100 bg-dark text-light d-flex flex-column align-items-center justify-content-center p-4 position-relative overflow-hidden font-sans">
      
      {/* Background Decor (Bootstrap + Inline Styles) */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
          <div className="position-absolute top-0 start-0 bg-primary opacity-25 rounded-circle" style={{ width: '500px', height: '500px', filter: 'blur(120px)', transform: 'translate(-30%, -30%)' }}></div>
          <div className="position-absolute bottom-0 end-0 bg-danger opacity-25 rounded-circle" style={{ width: '500px', height: '500px', filter: 'blur(120px)', transform: 'translate(30%, 30%)' }}></div>
      </div>

      {/* TOP NAVIGATION */}
      <nav className="position-absolute top-0 w-100 p-4 d-flex justify-content-between align-items-center container" style={{ zIndex: 10, maxWidth: '1000px' }}>
        <Link to="/" className="fs-4 fw-bold text-light text-decoration-none hover-text-info transition">
            notSafe.
        </Link>
        <div className="d-flex gap-4 small fw-bold">
           <Link to="/about" className="text-secondary text-decoration-none hover-text-white transition">About</Link>
           <Link to="/email-monitor" className="text-secondary text-decoration-none hover-text-warning transition">Email Check</Link>
        </div>
      </nav>

      <div className="container position-relative" style={{ zIndex: 5, maxWidth: '600px' }}>
        
        {/* HERO HEADER */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-2">
            Password <span className="text-gradient">Auditor</span>
          </h1>
          <p className="lead text-secondary">Analyze entropy & check global breach databases.</p>
        </div>

        {/* MAIN CARD */}
        <div className="card bg-glass border-secondary shadow-lg">
          <div className="card-body p-4">
            
            <form onSubmit={handleSubmit}>
              
              {/* Password Input + Strength Badge */}
              <div className="position-relative mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password..."
                  className="form-control form-control-lg bg-dark text-light border-secondary font-monospace"
                  style={{ paddingRight: '120px' }} // Make room for badge
                  required
                />
                
                {crackData && (
                   <span className={`position-absolute top-50 end-0 translate-middle-y me-3 badge ${
                      crackData.score < 3 ? 'bg-danger text-light' :
                      crackData.score < 5 ? 'bg-warning text-dark' :
                      'bg-success text-light'
                   }`}>
                      STRENGTH: {crackData.label}
                   </span>
                )}
              </div>

              {/* Crack Time Display */}
              {password && crackData && (
                <div className="d-flex justify-content-between align-items-center p-3 bg-dark rounded border border-secondary mb-4">
                  <span className="small fw-bold text-uppercase text-secondary">Time to Crack</span>
                  {/* Using the text color class directly from utils.js (e.g. text-danger) */}
                  <span className={`h5 fw-bold m-0 ${crackData.color}`}>
                     ~ {crackData.time}
                  </span>
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn btn-primary w-100 py-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Analyzing Hash...
                  </>
                ) : (
                  'Run Breach Analysis'
                )}
              </button>
            </form>

            {/* RESULT ALERT */}
            {result && (
              <div className={`mt-4 alert d-flex align-items-center ${
                result === 'breached' 
                  ? 'alert-danger border-danger bg-danger bg-opacity-10 text-danger' 
                  : result === 'safe'
                  ? 'alert-success border-success bg-success bg-opacity-10 text-success'
                  : 'alert-warning border-warning'
              }`}>
                <div className="fs-2 me-3">
                    {result === 'breached' ? <i className="bi bi-exclamation-triangle-fill"></i> : result === 'safe' ? <i className="bi bi-shield-check"></i> : '?'}
                </div>
                
                <div>
                  <h5 className="alert-heading fw-bold m-0">
                    {result === 'breached' ? 'Compromised' : result === 'safe' ? 'Secure' : 'Error'}
                  </h5>
                  <p className="m-0 small opacity-75">
                    {result === 'breached' 
                      ? "Found in known breaches." 
                      : result === 'safe' 
                      ? "Not found in database."
                      : "Connection failed."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 text-center">
            <Link to="/" className="small fw-bold text-secondary text-decoration-none text-uppercase hover-text-white transition">
                ← Return to Tool Selection
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordForm;