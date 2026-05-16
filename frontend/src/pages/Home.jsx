import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 position-relative overflow-hidden font-sans">

      {/* Background Effects */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1 }}>
          <div className="position-absolute top-0 start-0 bg-primary opacity-25 rounded-circle blur-effect" style={{ width: '400px', height: '400px', filter: 'blur(100px)', transform: 'translate(-20%, -20%)' }}></div>
          <div className="position-absolute bottom-0 end-0 bg-danger opacity-25 rounded-circle blur-effect" style={{ width: '400px', height: '400px', filter: 'blur(100px)', transform: 'translate(20%, 20%)' }}></div>
      </div>

      {/* HERO CONTENT */}
      <div className="container text-center mt-5" style={{ zIndex: 5 }}>
        <div className="d-inline-block px-3 py-1 mb-4 small fw-bold font-monospace text-success border border-success bg-opacity-10 bg-success rounded-pill">
          {t('hero.badge')}
        </div>

        <h1 className="display-3 fw-bolder text-white mb-4">
          {t('hero.title_part1')} <br />
          <span className="text-gradient">
            {t('hero.title_part2')}
          </span>
        </h1>

        <p className="lead text-secondary mx-auto mb-5" style={{ maxWidth: '600px' }}>
          {t('hero.subtitle')}
        </p>

        {/* BUTTONS */}
        <div className="d-flex justify-content-center gap-3 mb-5">
            <Link to="/register" className="btn btn-primary btn-lg fw-bold rounded-pill px-4">
                {t('hero.btn_register')}
            </Link>
            <Link to="/global" className="btn btn-outline-secondary btn-lg fw-bold rounded-pill px-4">
                {t('hero.btn_global')}
            </Link>
        </div>

        {/* FEATURE CARDS */}
        <div className="row g-4 justify-content-center text-start">

            {/* Card 1: Password */}
            <div className="col-md-4">
              <Link to="/audit" className="card bg-glass h-100 text-decoration-none border-secondary hover-shadow transition">
                  <div className="card-body p-4">
                    <div className="mb-3 fs-1">🔑</div>
                    <h3 className="h5 fw-bold text-white mb-2">{t('features.auditor_title')}</h3>
                    <p className="small text-secondary m-0">{t('features.auditor_desc')}</p>
                  </div>
              </Link>
            </div>

            {/* Card 2: Email */}
            <div className="col-md-4">
              <Link to="/email-monitor" className="card bg-glass h-100 text-decoration-none border-secondary hover-shadow transition">
                  <div className="card-body p-4">
                    <div className="mb-3 fs-1">📧</div>
                    <h3 className="h5 fw-bold text-white mb-2">{t('features.monitor_title')}</h3>
                    <p className="small text-secondary m-0">{t('features.monitor_desc')}</p>
                  </div>
              </Link>
            </div>

            {/* Card 3: Dashboard */}
            <div className="col-md-4">
              <Link to="/login" className="card bg-glass h-100 text-decoration-none border-secondary hover-shadow transition">
                  <div className="card-body p-4">
                    <div className="mb-3 fs-1">🛡️</div>
                    <h3 className="h5 fw-bold text-white mb-2">{t('features.portal_title')}</h3>
                    <p className="small text-secondary m-0">{t('features.portal_desc')}</p>
                  </div>
              </Link>
            </div>

        </div>
      </div>
    </div>
  );
}