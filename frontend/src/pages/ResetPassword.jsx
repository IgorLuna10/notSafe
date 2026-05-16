import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token') || '';
  const navigate                = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  // Simple client-side strength check
  const isStrong = password.length >= 8;
  const matches  = password === confirm && confirm.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isStrong) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!matches) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Missing token guard
  if (!token) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="text-center text-white">
          <div className="fs-1 mb-3">⚠️</div>
          <h4 className="fw-bold">Invalid Reset Link</h4>
          <p className="text-secondary small">No token found in the URL. Please use the link from your email.</p>
          <Link to="/forgot-password" className="btn btn-outline-info mt-3 fw-bold">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">

          <div className="card bg-glass text-white shadow-lg">
            <div className="card-body p-5">

              <div className="text-center mb-4">
                <div className="fs-1 mb-2">🛡️</div>
                <h2 className="fw-bold text-white">{t('auth.reset_title')}</h2>
                <p className="text-secondary small">Choose a strong password for your account.</p>
              </div>

              {success ? (
                <div className="text-center py-3">
                  <div className="fs-1 mb-3">✅</div>
                  <h5 className="fw-bold text-success">{t('auth.reset_success')}</h5>
                  <p className="text-secondary small">
                    Redirecting you to login in a moment...
                  </p>
                  <Link to="/login" className="btn btn-outline-info mt-3 fw-bold w-100">
                    {t('auth.back_to_login')}
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-bold">{t('auth.new_password_label')}</label>
                    <input
                      type="password"
                      required
                      className={`form-control form-control-theme ${
                        password.length > 0 ? (isStrong ? 'border-success' : 'border-danger') : ''
                      }`}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {password.length > 0 && !isStrong && (
                      <div className="form-text text-danger small">Too short — minimum 8 characters.</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label small text-secondary fw-bold">{t('auth.confirm_password_label')}</label>
                    <input
                      type="password"
                      required
                      className={`form-control form-control-theme ${
                        confirm.length > 0 ? (matches ? 'border-success' : 'border-danger') : ''
                      }`}
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                    {confirm.length > 0 && !matches && (
                      <div className="form-text text-danger small">Passwords don't match.</div>
                    )}
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 text-center small">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isStrong || !matches}
                    className="btn btn-info w-100 py-2 fw-bold text-white shadow"
                  >
                    {loading ? t('auth.btn_authenticating') : t('auth.btn_reset')}
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