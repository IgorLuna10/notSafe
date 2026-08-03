import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
              
              <div className="text-center mb-4">
                <h1 className="fw-bold text-uppercase text-white" style={{ letterSpacing: '2px' }}>{t('auth.register_title')}</h1>
                <p className="text-info small fw-bold tracking-wide">{t('auth.register_subtitle')}</p>
              </div>

              {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">{t('auth.company_label')}</label>
                  <input type="text" required className="form-control form-control-theme" placeholder="Acme Corp"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">{t('auth.email_label')}</label>
                  <input type="email" required className="form-control form-control-theme" placeholder="admin@company.com"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary fw-bold">{t('auth.password_label')}</label>
                  <input type="password" required className="form-control form-control-theme" placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>

                <button type="submit" disabled={loading} className="btn btn-info w-100 py-2 fw-bold text-white shadow">
                  {loading ? t('auth.btn_initializing') : t('auth.btn_register')}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <Link to="/login" className="text-decoration-none text-secondary small hover-text-white transition">
                  {t('auth.back_to_login')}
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}