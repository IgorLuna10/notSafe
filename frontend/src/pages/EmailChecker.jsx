import React from 'react';
import { Link } from 'react-router-dom';

export default function EmailChecker() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Background Grid - Converted to inline style for React compatibility */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#808080 1px, transparent 1px), linear-gradient(90deg, #808080 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative z-10 max-w-lg">
        <div className="w-20 h-20 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/30">
          <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Email Intelligence</h1>
        <p className="text-slate-500 mb-8 text-lg">
          We are currently training the hunter bots. <br />
          This module is under active development.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/10 border border-amber-900/50 rounded text-amber-500 font-mono text-sm mb-10">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          STATUS: BUILDING PIPELINE
        </div>

        <div>
          <Link to="/" className="text-slate-400 hover:text-white font-bold transition border-b border-transparent hover:border-white pb-1">
            ← Return to Base
          </Link>
        </div>
      </div>
    </div>
  );
}