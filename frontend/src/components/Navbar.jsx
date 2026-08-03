import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-glass sticky-top" style={{ zIndex: 100 }}>
      <div className="container">
        <Link className="navbar-brand fs-3 fw-bold text-gradient" to="/">
          notSafe
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-secondary hover-text-white" to="/about">
                {t('nav.architecture')}
              </Link>
            </li>
            
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold text-secondary hover-text-white" to="/login">
                    {t('nav.login')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary fw-bold rounded-pill shadow-sm px-3" to="/register">
                    {t('nav.register')}
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button className="btn btn-outline-danger fw-bold rounded-pill px-3" onClick={handleLogout}>
                  {t('nav.logout')}
                </button>
              </li>
            )}

            {/* THEME TOGGLE */}
            <li className="nav-item ms-lg-3">
              <button 
                className="btn btn-sm btn-outline-secondary rounded-circle" 
                onClick={toggleTheme}
                title="Toggle Theme"
                style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </li>

            {/* LANGUAGE TOGGLE */}
            <li className="nav-item">
              <div className="btn-group btn-group-sm ms-2">
                <button 
                  className={`btn btn-outline-secondary ${i18n.language === 'en' ? 'active' : ''}`}
                  onClick={() => changeLanguage('en')}
                >
                  EN
                </button>
                <button 
                  className={`btn btn-outline-secondary ${i18n.language === 'fr' ? 'active' : ''}`}
                  onClick={() => changeLanguage('fr')}
                >
                  FR
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}