import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { usePasswordHasher } from '../hooks/usePasswordHasher';

export default function CompanyPortal() {
  const { companyId } = useParams(); // URL: /portal/:companyId
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [selectedDept, setSelectedDept] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  
  const { hashPassword, isLoading } = usePasswordHasher();

  // 1. Fetch Company Info (Name + Departments)
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`/api/v1/public/company/${companyId}`);
        setCompany(res.data);
        // Default to first department if available
        if (res.data.departments?.length > 0) {
            setSelectedDept(res.data.departments[0]);
        }
      } catch (err) {
        setError("Invalid Portal Link. This company may not exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [companyId]);

  // 2. Handle the Check
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !selectedDept) return;

    const hashData = await hashPassword(password);
    if (!hashData) return;

    try {
      // Check Breach Status
      const res = await axios.get(`/api/v1/check-prefix/${hashData.prefix}`);
      const isBreached = !!res.data.suffixes.find(l => l.startsWith(hashData.suffix));
      
      setResult(isBreached ? 'breached' : 'safe');

      // Log to Backend (Anonymous)
      await axios.post('/api/v1/log-dept-check', {
        company_id: companyId,
        department: selectedDept,
        length: password.length,
        is_breached: isBreached
      });

    } catch (err) {
      setResult('error');
    }
  };

  if (loading) return <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center text-info font-monospace">LOADING PORTAL...</div>;
  
  if (error) return (
      <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center text-light">
          <div className="text-center">
              <h1 className="display-1 text-danger fw-bold">404</h1>
              <p className="lead text-secondary">{error}</p>
              <Link to="/" className="btn btn-outline-light mt-3">Return Home</Link>
          </div>
      </div>
  );

  return (
    <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center p-4">
      
      {/* Background Ambience */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
          <div className="position-absolute top-50 start-50 bg-primary opacity-10 rounded-circle" style={{ width: '800px', height: '800px', filter: 'blur(150px)', transform: 'translate(-50%, -50%)' }}></div>
      </div>

      <div className="card bg-glass border-secondary shadow-lg w-100 position-relative" style={{ maxWidth: '550px', zIndex: 10 }}>
        <div className="card-body p-5">
            
            {/* Header */}
            <div className="text-center mb-5">
                <div className="d-inline-block px-3 py-1 border border-info text-info rounded-pill small fw-bold mb-3">
                    OFFICIAL SECURITY PORTAL
                </div>
                <h2 className="fw-bold text-white mb-2">{company.name}</h2>
                <p className="small text-secondary m-0">
                    Anonymous Department Audit System
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                
                {/* 1. Department Selector */}
                <div className="mb-4">
                    <label className="form-label small text-secondary fw-bold">SELECT YOUR DEPARTMENT</label>
                    <select 
                        className="form-select bg-dark text-light border-secondary p-3"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        {company.departments.length === 0 && <option>No Departments Configured</option>}
                        {company.departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* 2. Password Input */}
                <div className="mb-4">
                    <label className="form-label small text-secondary fw-bold">VERIFY CREDENTIAL STRENGTH</label>
                    <input 
                        type="password" 
                        className="form-control bg-dark text-light border-secondary p-3 text-center font-monospace" 
                        placeholder="Enter password to test..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className="form-text text-secondary small mt-2 text-center">
                        <i className="bi bi-shield-lock-fill me-1"></i> 
                        Zero-Knowledge Protocol: We only see the Department and Result.
                    </div>
                </div>

                <button disabled={isLoading || !selectedDept} className="btn btn-primary w-100 py-3 fw-bold shadow">
                    {isLoading ? 'ANALYZING HASH...' : 'RUN SECURITY CHECK'}
                </button>
            </form>

            {/* 3. Results */}
            {result && (
                <div className={`mt-4 alert d-flex align-items-center ${result === 'breached' ? 'alert-danger bg-danger bg-opacity-10' : 'alert-success bg-success bg-opacity-10'}`}>
                    <div className="fs-1 me-3">
                        {result === 'breached' ? <i className="bi bi-exclamation-octagon-fill"></i> : <i className="bi bi-check-circle-fill"></i>}
                    </div>
                    <div>
                        <h5 className="alert-heading fw-bold m-0">
                            {result === 'breached' ? 'Credential Compromised' : 'Credential Secure'}
                        </h5>
                        <p className="m-0 small opacity-75">
                             {result === 'breached' 
                                ? "This password appears in known data breaches. Please rotate immediately." 
                                : "No match found in our dark web database."}
                        </p>
                    </div>
                </div>
            )}
            
            <div className="mt-5 pt-4 border-top border-secondary text-center">
                <Link to="/" className="text-decoration-none text-secondary small hover-text-white">
                    Powered by notSafe. Enterprise
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}