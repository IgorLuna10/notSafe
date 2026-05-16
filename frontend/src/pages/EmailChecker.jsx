import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function EmailChecker() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      await new Promise(r => setTimeout(r, 1500));
      const res = await api.post('/email-check', { email });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Scan failed. Server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow-1 font-monospace p-4 d-flex flex-column align-items-center">
      <div className="container mt-5" style={{ maxWidth: '800px' }}>
        
        <Link to="/" className="text-secondary text-decoration-none fw-bold small mb-5 d-block hover-text-white transition">
          ← {t('auth.terminate')}
        </Link>

        <div className="text-center mb-5">
          <div className="bg-warning bg-opacity-10 border border-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
             <i className="bi bi-shield-exclamation text-warning fs-1"></i>
          </div>
          <h1 className="display-4 fw-bold text-white">
            EMAIL <span className="text-warning">INTELLIGENCE</span>
          </h1>
          <p className="lead text-secondary mt-3 mx-auto" style={{ maxWidth: '600px' }}>
            {t('tools.monitor_subtitle')}
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="card bg-glass border-secondary shadow-lg mb-4">
            <div className="card-body p-2">
                <div className="input-group input-group-lg">
                    <input 
                        type="email" 
                        className="form-control bg-transparent text-white border-0 shadow-none" 
                        placeholder={t('tools.monitor_placeholder')} 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button 
                        onClick={handleScan}
                        disabled={loading || !email}
                        className="btn btn-warning fw-bold px-4"
                    >
                        {loading ? t('auth.btn_authenticating') : t('tools.monitor_btn')}
                    </button>
                </div>
            </div>
        </div>

        {error && (
            <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger text-center">
                ⚠️ {error}
            </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="mt-5 fade-in">
            <div className={`card ${result.status === 'breached' ? 'border-danger' : 'border-success'} bg-glass`}>
                <div className={`card-header p-4 ${result.status === 'breached' ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <div className="small text-secondary fw-bold">{t('tools.monitor_status')}</div>
                            <div className={`h2 fw-bold m-0 ${result.status === 'breached' ? 'text-danger' : 'text-success'}`}>
                                {result.status === 'breached' ? 'COMPROMISED' : 'CLEAN'}
                            </div>
                        </div>
                        <div className="text-end">
                            <div className="small text-secondary fw-bold">{t('tools.monitor_risk')}</div>
                            <div className={`display-6 fw-bold ${result.risk_score > 50 ? 'text-danger' : 'text-success'}`}>
                                {result.risk_score}/100
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="card-body p-4">
                   {result.status === 'breached' ? (
                     <div>
                        <p className="text-secondary border-bottom border-secondary pb-3 mb-4">
                            <span className="text-danger fw-bold">CRITICAL ALERT:</span> {t('tools.audit_breached')}
                        </p>
                        
                        <div className="d-grid gap-3">
                            {result.sources.map((leak, idx) => (
                                <div key={idx} className="p-3 rounded border border-secondary bg-black d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold text-white">{leak.name}</div>
                                        <div className="small text-secondary">Leak Date: {leak.date}</div>
                                    </div>
                                    <div className="d-flex gap-1">
                                        {leak.data.map((tag, i) => (
                                            <span key={i} className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                                                {tag.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                   ) : (
                     <div className="text-center py-4">
                        <div className="mb-3">
                            <i className="bi bi-check-circle text-success fs-1"></i>
                        </div>
                        <h4 className="fw-bold text-white">{t('tools.monitor_no_leaks')}</h4>
                        <p className="text-secondary small mx-auto" style={{ maxWidth: '400px' }}>
                            {t('tools.audit_safe')}
                        </p>
                     </div>
                   )}
                </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}