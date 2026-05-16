import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newDept, setNewDept] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard/analytics');
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addDept = async (e) => {
    e.preventDefault();
    const trimmed = newDept.trim();
    if (!trimmed) return;
    try {
      await api.post('/dashboard/company/departments', { name: trimmed });
      setNewDept('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding department');
    }
  };

  const deleteDept = async (name) => {
    if (!confirm(`${t('nav.architecture')} "${name}"?`)) return; // reusing architecture as a dummy confirm text if needed or just use a new key
    try {
      await api.delete('/dashboard/company/departments', { data: { name } });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting department');
    }
  };

  const portalLink = data?.company_id ? `${window.location.origin}/portal/${data.company_id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(portalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex-grow-1 d-flex align-items-center justify-content-center text-info font-monospace">
      {t('auth.btn_authenticating')}
    </div>
  );

  const { total = 0, breached_count = 0 } = data.stats;
  const ratio = total > 0 ? ((1 - (breached_count / total)) * 100).toFixed(1) : 100;

  return (
    <div className="flex-grow-1 p-4 font-monospace">
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>

        {/* HEADER */}
        <header className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 border-bottom border-secondary pb-4">
          <div className="mb-3 mb-md-0">
            <h1 className="h2 fw-bold m-0 text-white">
              {data.company_name.toUpperCase()} <span className="text-info">{t('dashboard.hq')}</span>
            </h1>
            <p className="small text-secondary m-0">{t('dashboard.risk_assessment')}</p>
          </div>
        </header>

        {/* METRICS ROW */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <MetricCard title={t('dashboard.total_checks')} value={total} border="border-info" />
          </div>
          <div className="col-md-4">
            <MetricCard title={t('dashboard.breaches_found')} value={breached_count} color="text-danger" border="border-danger" />
          </div>
          <div className="col-md-4">
            <MetricCard
              title={t('dashboard.safety_score')}
              value={ratio + '%'}
              color={ratio > 80 ? 'text-success' : 'text-warning'}
              border="border-success"
            />
          </div>
        </div>

        {/* MANAGEMENT ROW */}
        <div className="row g-4">

          {/* LEFT: CONFIGURATION */}
          <div className="col-md-5">
            <div className="card bg-glass border-secondary h-100">
              <div className="card-header bg-transparent border-secondary fw-bold text-info">
                {t('features.portal_title').toUpperCase()}
              </div>
              <div className="card-body">

                {/* PORTAL LINK */}
                <div className="p-3 bg-black rounded mb-4 text-center border border-secondary">
                  <div className="small text-secondary fw-bold mb-2">{t('dashboard.portal_link')}</div>
                  <code className="d-block p-2 bg-black rounded text-info mb-3 text-break user-select-all">
                    {portalLink}
                  </code>
                  <button
                    onClick={copyLink}
                    className={`btn btn-sm fw-bold w-100 ${copied ? 'btn-success' : 'btn-outline-info'}`}
                  >
                    {copied ? `✓ ${t('dashboard.copied')}` : `⎘ ${t('dashboard.copy_link')}`}
                  </button>
                </div>

                <hr className="border-secondary my-4" />

                {/* DEPARTMENTS */}
                <div className="small text-secondary fw-bold mb-2">{t('dashboard.manage_depts')}</div>
                <form onSubmit={addDept} className="d-flex gap-2 mb-2">
                  <input
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="form-control form-control-theme"
                    placeholder={t('dashboard.add_dept_placeholder')}
                  />
                  <button className="btn btn-info fw-bold text-white" disabled={!newDept.trim()}>+</button>
                </form>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  {data.departments.length === 0 && (
                    <div className="text-secondary small">{t('dashboard.no_depts')}</div>
                  )}
                  {data.departments.map(dept => (
                    <span key={dept} className="badge bg-glass border border-secondary p-2 d-flex align-items-center gap-2 text-white">
                      {dept}
                      <button
                        onClick={() => deleteDept(dept)}
                        className="btn-close ms-1"
                        style={{ fontSize: '0.5em', filter: 'var(--title-color) === "#ffffff" ? "invert(1)" : "none"' }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CHART */}
          <div className="col-md-7">
            <div className="card bg-glass border-secondary h-100">
              <div className="card-header bg-transparent border-secondary fw-bold text-white">
                {t('dashboard.risk_by_dept')}
              </div>
              <div className="card-body">
                {data.department_data && data.department_data.length > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Bar
                      data={{
                        labels: data.department_data.map(d => d.department),
                        datasets: [
                          { label: t('dashboard.total_checks'), data: data.department_data.map(d => d.total), backgroundColor: '#0dcaf0' },
                          { label: t('dashboard.breaches_found'), data: data.department_data.map(d => d.breached), backgroundColor: '#dc3545' },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          x: { grid: { display: false }, ticks: { color: '#aaa' } },
                          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#aaa' } },
                        },
                        plugins: {
                          legend: { labels: { color: '#aaa' } },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center text-secondary py-5 d-flex flex-column align-items-center justify-content-center h-100">
                    <i className="bi bi-bar-chart-fill fs-1 mb-3"></i>
                    {t('dashboard.no_data')}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, color = 'text-white', border }) => (
  <div className={`card bg-glass border-secondary h-100 border-start border-4 ${border.replace('border-', 'border-start-')}`}>
    <div className="card-body p-4">
      <h6 className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>{title}</h6>
      <div className={`display-5 fw-bold mt-2 ${color}`}>{value}</div>
    </div>
  </div>
);