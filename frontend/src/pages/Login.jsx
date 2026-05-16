import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          
          <div className="card bg-glass text-white shadow-lg">
            <div className="card-body p-5">
              
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="fw-bold text-uppercase text-white" style={{ letterSpacing: '2px' }}>{t('auth.restricted')}</h1>
                <p className="text-danger small fw-bold tracking-wide">{t('auth.authorized_only')}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">{t('auth.email_label')}</label>
                  <input 
                    type="email" 
                    className="form-control form-control-theme"
                    placeholder="admin@corp.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary fw-bold">{t('auth.password_label')}</label>
                  <input 
                    type="password" 
                    className="form-control form-control-theme"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                {error && (
                  <div className="alert alert-danger py-2 text-center small" role="alert">
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-danger w-100 py-2 fw-bold shadow" 
                  disabled={loading}
                >
                  {loading ? t('auth.btn_authenticating') : t('auth.btn_login')}
                </button>
              </form>

              {/* Navigation Links */}
              <div className="mt-4 text-center small d-flex flex-column gap-3">
                
                {/* Primary Nav */}
                <div className="d-flex justify-content-center gap-4">
                  <Link to="/" className="text-decoration-none text-secondary hover-text-white transition">{t('auth.terminate')}</Link>
                  <Link to="/register" className="text-decoration-none text-info fw-bold hover-text-white transition">{t('auth.register_new')}</Link>
                </div>
                
                {/* Recovery */}
                <div className="pt-3 border-top border-secondary d-flex flex-column gap-2">
                  <Link to="/forgot-password" className="text-decoration-none text-warning fw-bold hover-text-white transition">
                    <i className="bi bi-key me-1"></i> {t('auth.forgot_password')}
                  </Link>
                  
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}