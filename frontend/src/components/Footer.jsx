import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-100 bg-dark border-top border-secondary py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
        
        <div className="mb-3 mb-md-0">
          <span className="fw-bold text-light">notSafe.</span> 
          <span className="mx-2">|</span> 
          Enterprise Security Suite v1.0
        </div>

        <div className="d-flex gap-3 align-items-center">
          <Link to="/about" className="text-decoration-none text-secondary hover-text-white transition">Architecture</Link>
          
          {/* NEW LINK */}
          <Link to="/global" className="text-decoration-none text-info fw-bold transition">Global Intelligence</Link>
          
          <Link to="/login" className="text-decoration-none text-secondary hover-text-white transition">Portal Login</Link>
          <span className="opacity-50 border-start border-secondary ps-3 ms-2">© 2026 Igor Luna</span>
        </div>

      </div>
    </footer>
  );
}