import React, { useState } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Connect to your Flask Backend
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Registration Successful! Please Login.");
      // Navigate to Login Page here (e.g., using React Router)
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            notSafe.
          </h1>
          <p className="text-slate-400 text-sm mt-2">Enterprise Security Registration</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 text-sm p-3 rounded mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Company Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="Acme Corp"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Work Email</label>
            <input 
              type="email" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="admin@company.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/20 transition duration-300"
          >
            CREATE ACCOUNT
          </button>
        </form>
        
        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account? <a href="/login" className="text-blue-400 hover:text-blue-300 font-bold">Sign In</a>
        </p>
      </div>
    </div>
  );
}