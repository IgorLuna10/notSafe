import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Successful Login
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          notSafe.
        </h1>
        <p className="text-slate-500 text-xs text-center mb-6 tracking-widest uppercase">Mission Control Access</p>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 text-xs p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase">Email</label>
            <input 
              type="email" 
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase">Password</label>
            <input 
              type="password" 
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded shadow-lg transition">
            ENTER
          </button>
        </form>
        
        <div className="mt-6 text-center">
             <a href="/register" className="text-xs text-slate-500 hover:text-blue-400 transition">Create Company Account</a>
        </div>
      </div>
    </div>
  );
}