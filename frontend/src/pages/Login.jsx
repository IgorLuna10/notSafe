import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

export default function Login() {
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
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          
          <div className="card bg-glass text-light shadow-lg">
            <div className="card-body p-5">
              
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="fw-bold text-uppercase letter-spacing-2">Restricted</h1>
                <p className="text-danger small fw-bold tracking-wide">AUTHORIZED PERSONNEL ONLY</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">EMAIL IDENTITY</label>
                  <input 
                    type="email" 
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="admin@corp.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary fw-bold">ACCESS CODE</label>
                  <input 
                    type="password" 
                    className="form-control bg-dark text-light border-secondary"
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
                  {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                </button>
              </form>

              <div className="mt-4 text-center small">
                <Link to="/" className="text-decoration-none text-secondary me-3">← TERMINATE SESSION</Link>
                <Link to="/register" className="text-decoration-none text-info">REGISTER NEW ID →</Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}