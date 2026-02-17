import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      navigate('/login'); 
    } catch (err) {
      setError(err.message);
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
              
              <div className="text-center mb-4">
                <h2 className="fw-bold text-gradient">notSafe.</h2>
                <p className="text-secondary small">Enterprise Security Registration</p>
              </div>

              {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">COMPANY NAME</label>
                  <input type="text" required className="form-control bg-dark text-light border-secondary" placeholder="Acme Corp"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">WORK EMAIL</label>
                  <input type="email" required className="form-control bg-dark text-light border-secondary" placeholder="admin@company.com"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary fw-bold">PASSWORD</label>
                  <input type="password" required className="form-control bg-dark text-light border-secondary" placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2 fw-bold">
                  {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                </button>
              </form>
              
              <div className="mt-4 text-center small">
                <span className="text-secondary">Already have an account?</span>
                <Link to="/login" className="text-decoration-none text-info ms-2 fw-bold">Sign In</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}