import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePasswordHasher } from '../hooks/usePasswordHasher';
import { calculateCrackTime } from '../utils';

const PasswordForm = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [crackData, setCrackData] = useState(null);
  
  const { hashPassword, isLoading } = usePasswordHasher();

  // --- REAL-TIME MATH ---
  useEffect(() => {
    if (password) {
      setCrackData(calculateCrackTime(password));
    } else {
      setCrackData(null);
      setResult(null);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    // 1. Client-Side Hashing
    const hashData = await hashPassword(password);
    if (!hashData) return;

    try {
      // 2. Check API (UPDATED URL to /v1)
      const response = await axios.get(`http://127.0.0.1:5001/api/v1/check-prefix/${hashData.prefix}`);
      const suffixes = response.data.suffixes;

      // 3. Find Match locally
      const breachEntry = suffixes.find(line => line.startsWith(hashData.suffix));
      const isBreached = !!breachEntry;

      setResult(isBreached ? 'breached' : 'safe');

      // 4. Log Statistics (UPDATED URL to /v1)
      await axios.post('http://127.0.0.1:5001/api/v1/log-check', {
        length: password.length,
        is_breached: isBreached
      }, {
        headers: { 'X-API-Key': 'notsafe_dev_12345' } 
      });

    } catch (err) {
      console.error("API Error:", err);
      setResult('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      {/* TOP NAVIGATION */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-5xl z-50">
        <Link to="/" className="font-bold text-xl tracking-tighter text-white hover:text-blue-400 transition">
            notSafe.
        </Link>
        <div className="space-x-6 text-sm font-semibold">
           <Link to="/about" className="hover:text-white transition">About</Link>
           <Link to="/email-checker" className="hover:text-amber-500 transition">Email Check</Link>
        </div>
      </nav>

      <div className="w-full max-w-lg relative z-10 mt-10">
        
        {/* HERO HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
            Password <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Auditor</span>
          </h1>
          <p className="text-slate-500 text-lg">Analyze entropy & check global breach databases.</p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password..."
                className="w-full p-4 bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 transition-all font-mono text-lg"
                required
              />
              
              {/* Live Entropy Score Badge */}
              {crackData && (
                 <div className={`absolute right-4 top-4 text-xs font-bold px-2 py-1 rounded border ${
                    crackData.score < 3 ? 'bg-red-900/30 border-red-500/30 text-red-400' :
                    crackData.score < 5 ? 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400' :
                    'bg-emerald-900/30 border-emerald-500/30 text-emerald-400'
                 }`}>
                    STRENGTH: {crackData.label}
                 </div>
              )}
            </div>

            {/* Time to Crack Display */}
            {password && crackData && (
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Time to Crack</span>
                <span className={`text-xl font-bold ${crackData.color}`}>
                   ~ {crackData.time}
                </span>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Running K-Anonymity Scan...
                </>
              ) : (
                'Run Breach Analysis'
              )}
            </button>
          </form>

          {/* RESULT CARD */}
          {result && (
            <div className={`mt-8 p-6 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              result === 'breached' 
                ? 'bg-red-900/20 border-red-500/50 text-red-200' 
                : result === 'safe'
                ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-200'
                : 'bg-yellow-900/20 border-yellow-500/50'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${
                    result === 'breached' ? 'bg-red-500/20' : result === 'safe' ? 'bg-emerald-500/20' : 'bg-yellow-500/20'
                }`}>
                    {result === 'breached' && (
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    )}
                    {result === 'safe' && (
                        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {result === 'error' && (
                         <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {result === 'breached' ? 'Compromised Password' : result === 'safe' ? 'No Breaches Found' : 'Connection Error'}
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed">
                    {result === 'breached' 
                      ? "This password appears in known data leaks. Hackers likely have it in their dictionaries." 
                      : result === 'safe' 
                      ? "This specific password was not found in our database of 800M+ leaked credentials."
                      : "Could not connect to the API. Ensure the backend is running at localhost:5001."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
            <Link to="/" className="text-slate-600 text-xs uppercase tracking-widest hover:text-slate-400 transition">
                ← Return to Tool Selection
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordForm;