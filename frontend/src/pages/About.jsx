import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <nav className="flex justify-between items-center mb-20">
          <Link to="/" className="text-xl font-bold text-white tracking-tighter hover:text-red-500 transition">
            notSafe.
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-white transition">
            ← Back to Tool
          </Link>
        </nav>

        <header className="mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-6">The Architecture.</h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            notSafe is a high-performance security auditing tool designed to demonstrate modern API architecture, secure hashing implementation, and real-time analytics.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Stack Item 1 */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl">
            <div className="text-blue-400 font-mono text-xs font-bold mb-3 uppercase tracking-widest">Backend Core</div>
            <h3 className="text-2xl font-bold text-white mb-2">Flask & Python</h3>
            <p className="text-slate-400">RESTful API design using Blueprints for modular routing. Implements strict rate-limiting via Flask-Limiter to prevent brute-force attacks.</p>
          </div>

          {/* Stack Item 2 */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl">
            <div className="text-red-400 font-mono text-xs font-bold mb-3 uppercase tracking-widest">Performance</div>
            <h3 className="text-2xl font-bold text-white mb-2">Redis Caching</h3>
            <p className="text-slate-400">In-memory data structure store used to cache external API responses (HIBP), reducing latency from ~600ms to &lt;10ms for repeated checks.</p>
          </div>

          {/* Stack Item 3 */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl">
            <div className="text-green-400 font-mono text-xs font-bold mb-3 uppercase tracking-widest">Data & Analytics</div>
            <h3 className="text-2xl font-bold text-white mb-2">MongoDB Atlas</h3>
            <p className="text-slate-400">NoSQL document storage for anonymous usage logs. Aggregation pipelines calculate global breach statistics in real-time.</p>
          </div>

          {/* Stack Item 4 */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl">
            <div className="text-purple-400 font-mono text-xs font-bold mb-3 uppercase tracking-widest">Security</div>
            <h3 className="text-2xl font-bold text-white mb-2">K-Anonymity</h3>
            <p className="text-slate-400">We never send your full password. Only the first 5 characters of the SHA-1 hash are transmitted, ensuring mathematical privacy.</p>
          </div>

        </div>

        <div className="mt-20 border-t border-slate-800 pt-10 text-center">
          <p className="text-slate-500 text-sm">
            Built by <span className="text-slate-300 font-bold">Igor Luna</span>.
          </p>
        </div>
      </div>
    </div>
  );
}