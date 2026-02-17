import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-vh-100 bg-dark text-light p-4 font-sans">
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Nav */}
        <nav className="d-flex justify-content-between align-items-center mb-5">
          <Link to="/" className="fs-4 fw-bold text-white text-decoration-none">
            notSafe.
          </Link>
          <Link to="/" className="small text-secondary text-decoration-none hover-text-white">
            ← Back to Tool
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-5">
          <h1 className="display-4 fw-bolder text-white mb-3">The Architecture.</h1>
          <p className="lead text-secondary">
            notSafe is a high-performance security auditing tool designed to demonstrate modern API architecture, secure hashing implementation, and real-time analytics.
          </p>
        </header>

        {/* Grid */}
        <div className="row g-4">
          
          {/* Stack Item 1 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-info small fw-bold font-monospace mb-2 text-uppercase">Backend Core</div>
                <h3 className="h4 fw-bold text-white mb-2">Flask & Python</h3>
                <p className="small text-secondary">RESTful API design using Blueprints for modular routing. Implements strict rate-limiting via Flask-Limiter to prevent brute-force attacks.</p>
              </div>
            </div>
          </div>

          {/* Stack Item 2 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-danger small fw-bold font-monospace mb-2 text-uppercase">Performance</div>
                <h3 className="h4 fw-bold text-white mb-2">Redis Caching</h3>
                <p className="small text-secondary">In-memory data structure store used to cache external API responses (HIBP), reducing latency from ~600ms to &lt;10ms for repeated checks.</p>
              </div>
            </div>
          </div>

          {/* Stack Item 3 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-success small fw-bold font-monospace mb-2 text-uppercase">Data & Analytics</div>
                <h3 className="h4 fw-bold text-white mb-2">MongoDB Atlas</h3>
                <p className="small text-secondary">NoSQL document storage for anonymous usage logs. Aggregation pipelines calculate global breach statistics in real-time.</p>
              </div>
            </div>
          </div>

          {/* Stack Item 4 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-warning small fw-bold font-monospace mb-2 text-uppercase">Security</div>
                <h3 className="h4 fw-bold text-white mb-2">K-Anonymity</h3>
                <p className="small text-secondary">We never send your full password. Only the first 5 characters of the SHA-1 hash are transmitted, ensuring mathematical privacy.</p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-5 border-top border-secondary pt-4 text-center">
          <p className="text-secondary small">
            Built by <span className="text-light fw-bold">Igor Luna</span>.
          </p>
        </div>
      </div>
    </div>
  );
}