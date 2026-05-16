import React from 'react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="flex-grow-1 p-4 font-sans">
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* Header */}
        <header className="mb-5 mt-4">
          <h1 className="display-4 fw-bolder text-white mb-3">{t('about.title')}</h1>
          <p className="lead text-secondary mb-0">
            {t('about.subtitle')}
          </p>
        </header>

        {/* Grid */}
        <div className="row g-4">
          
          {/* Stack Item 1 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-info small fw-bold font-monospace mb-2 text-uppercase">{t('about.backend_title')}</div>
                <h3 className="h4 fw-bold text-white mb-2">Flask & Python</h3>
                <p className="small text-secondary">{t('about.backend_desc')}</p>
              </div>
            </div>
          </div>

          {/* Stack Item 2 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-danger small fw-bold font-monospace mb-2 text-uppercase">{t('about.performance_title')}</div>
                <h3 className="h4 fw-bold text-white mb-2">In-Memory Caching</h3>
                <p className="small text-secondary">{t('about.performance_desc')}</p>
              </div>
            </div>
          </div>

          {/* Stack Item 3 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-success small fw-bold font-monospace mb-2 text-uppercase">{t('about.data_title')}</div>
                <h3 className="h4 fw-bold text-white mb-2">MongoDB Atlas</h3>
                <p className="small text-secondary">{t('about.data_desc')}</p>
              </div>
            </div>
          </div>

          {/* Stack Item 4 */}
          <div className="col-md-6">
            <div className="card bg-glass h-100 border-secondary">
              <div className="card-body p-4">
                <div className="text-warning small fw-bold font-monospace mb-2 text-uppercase">{t('about.security_title')}</div>
                <h3 className="h4 fw-bold text-white mb-2">K-Anonymity</h3>
                <p className="small text-secondary">{t('about.security_desc')}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-5 border-top border-secondary pt-4 text-center">
          <p className="text-secondary small">
            {t('about.footer')} <span className="text-white fw-bold">Igor Luna</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
