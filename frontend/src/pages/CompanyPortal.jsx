import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { usePasswordHasher } from '../hooks/usePasswordHasher';

export default function CompanyPortal() {
  const { t } = useTranslation();
  const { companyId } = useParams(); 
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDept, setSelectedDept] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  
  const { hashPassword, isLoading } = usePasswordHasher();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`/api/v1/public/company/${companyId}`);
        setCompany(res.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !selectedDept) return;

    const hashData = await hashPassword(password);
    if (!hashData) return;

    try {
      const res = await axios.get(`/api/v1/check-prefix/${hashData.prefix}`);
      const isBreached = !!res.data.suffixes.find(l => l.startsWith(hashData.suffix));
      
      setResult(isBreached ? 'breached' : 'safe');

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

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-info font-monospace">{t('tools.portal_loading')}</div>;
  
  if (error) return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center text-white">
          <div className="text-center">
              <h1 className="display-1 text-danger fw-bold">404</h1>
              <p className="lead text-secondary">{error}</p>
              <Link to="/" className="btn btn-outline-info mt-3">{t('auth.back_to_login')}</Link>
          </div>
      </div>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative">
      
      {/* Background Ambience */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
          <div className="position-absolute top-50 start-50 bg-primary opacity-10 rounded-circle blur-effect" style={{ width: '800px', height: '800px', transform: 'translate(-50%, -50%)' }}></div>
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
                    <label className="form-label small text-secondary fw-bold">{t('tools.portal_select_dept')}</label>
                    <select 
                        className="form-select form-control-theme p-3"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        {company.departments.length === 0 && <option>{t('dashboard.no_depts')}</option>}
                        {company.departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* 2. Password Input */}
                <div className="mb-4">
                    <label className="form-label small text-secondary fw-bold">{t('tools.portal_verify')}</label>
                    <input 
                        type="password" 
                        className="form-control form-control-theme p-3 text-center font-monospace" 
                        placeholder={t('tools.portal_verify_placeholder')}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className="form-text text-secondary small mt-2 text-center">
                        <i className="bi bi-shield-lock-fill me-1"></i> 
                        {t('tools.portal_verify_desc')}
                    </div>
                </div>

                <button disabled={isLoading || !selectedDept} className="btn btn-primary w-100 py-3 fw-bold shadow">
                    {isLoading ? t('auth.btn_authenticating') : t('tools.monitor_btn')}
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
                            {result === 'breached' ? t('audit_breached', 'Compromised') : t('audit_safe', 'Secure')}
                        </h5>
                        <p className="m-0 small opacity-75">
                             {result === 'breached' 
                                ? t('tools.audit_breached') 
                                : t('tools.audit_safe')}
                        </p>
                    </div>
                </div>
            )}
            
            <div className="mt-5 pt-4 border-top border-secondary text-center">
                <Link to="/" className="text-decoration-none text-secondary small hover-text-white transition">
                    Powered by notSafe. Enterprise
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}