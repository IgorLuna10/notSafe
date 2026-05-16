import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
                <div className="fs-1 mb-2">🔐</div>
                <h2 className="fw-bold text-white">{t('auth.forgot_title')}</h2>
                <p className="text-secondary small">
                  {t('auth.forgot_desc')}
                </p>
              </div>

              {submitted ? (
                /* ── Success State ── */
                <div className="text-center py-3">
                  <div className="fs-1 mb-3">📬</div>
                  <h5 className="fw-bold text-success">{t('auth.forgot_sent')}</h5>
                  <p className="text-secondary small">
                    {t('auth.forgot_expiry')}
                  </p>
                  <Link to="/login" className="btn btn-outline-info mt-3 fw-bold w-100">
                    {t('auth.back_to_login')}
                  </Link>
                </div>
              ) : (
                /* ── Form State ── */
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label small text-secondary fw-bold">{t('auth.email_label')}</label>
                    <input
                      type="email"
                      required
                      className="form-control form-control-theme"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 text-center small">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-info w-100 py-2 fw-bold text-white shadow"
                  >
                    {loading ? t('auth.btn_initializing') : t('auth.btn_send')}
                  </button>
                </form>
              )}

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