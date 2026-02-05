import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-[128px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl z-50">
        <div className="font-bold text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          notSafe.
        </div>
        <div className="flex gap-6 items-center">
            <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition">
                Sign In
            </Link>
            <Link to="/register" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-900/20 transition">
                Get Started
            </Link>
        </div>
      </nav>

      {/* HERO CONTENT */}
      <div className="max-w-4xl text-center space-y-8 z-10 mt-10">
        <div className="inline-block px-3 py-1 text-xs font-mono text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded-full">
          ENTERPRISE SECURITY SUITE v1.0
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
          Secure your workforce <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            before the breach.
          </span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one Mission Control for password auditing, entropy analysis, and breach monitoring. 
          Protect your company with real-time intelligence.
        </p>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto mt-12">
            
            {/* Card 1: Public Auditor */}
            <Link to="/audit" className="group relative p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-2xl transition-all duration-300 text-left cursor-pointer">
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition">
                    🔑
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">Password Auditor</h3>
                <p className="text-sm text-slate-400">Analyze password complexity and check against 800M+ leaked credentials.</p>
            </Link>

            {/* Card 2: Company Dashboard */}
            <Link to="/login" className="group relative p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-2xl transition-all duration-300 text-left">
                <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition">
                    🛡️
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">Company Portal</h3>
                <p className="text-sm text-slate-400">Login to Mission Control to manage campaigns and view department risk scores.</p>
            </Link>

        </div>
      </div>
    </div>
  );
}