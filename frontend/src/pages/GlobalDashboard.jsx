import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2'; 
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function GlobalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/dashboard/global')
      .then(res => res.ok ? res.json() : null)
      .then(json => { setData(json); setLoading(false); })
      .catch(e => setLoading(false));
  }, []);

  if (loading || !data || !data.stats) return <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center text-info font-monospace">ESTABLISHING UPLINK...</div>;

  const passwords = data.stats.passwords || { total: 0, breached: 0 };
  const emails = data.stats.emails || { total: 0, breached: 0 };
  const total = data.stats.total || 0;
  const breached_count = data.stats.breached_count || 0;

  const safe_ratio = total > 0 ? ((1 - (breached_count / total)) * 100) : 100;
  let grade = 'A';
  let gradeColor = 'text-success';
  if (safe_ratio < 60) { grade = 'F'; gradeColor = 'text-danger'; }
  else if (safe_ratio < 75) { grade = 'D'; gradeColor = 'text-warning'; }
  else if (safe_ratio < 90) { grade = 'C'; gradeColor = 'text-warning'; }
  else if (safe_ratio < 97) { grade = 'B'; gradeColor = 'text-info'; }

  return (
    <div className="min-vh-100 bg-dark text-light p-4 font-monospace">
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* HEADER */}
        <header className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
          <div>
            <h1 className="h2 fw-bold m-0">GLOBAL <span className="text-info">INTELLIGENCE</span></h1>
            <div className="small text-secondary font-monospace" style={{ letterSpacing: '2px' }}>LIVE THREAT TELEMETRY</div>
          </div>
          <Link to="/" className="btn btn-outline-secondary btn-sm fw-bold rounded-pill px-4">
            EXIT DASHBOARD
          </Link>
        </header>

        <div className="row g-4">

            {/* 1. BIG SCORE CARD (Left Column) */}
            <div className="col-lg-3 col-md-4">
                <div className="card bg-glass border-secondary h-100 text-center position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', background: 'linear-gradient(90deg, #0dcaf0, #6610f2)' }}></div>
                    <div className="card-body d-flex flex-column justify-content-center align-items-center">
                        <div className={`display-1 fw-bold ${gradeColor}`}>{grade}</div>
                        <div className="small text-secondary fw-bold text-uppercase mt-2">Global Safety Score</div>
                    </div>
                </div>
            </div>

            {/* 2. SUMMARY METRICS (Right Column) */}
            <div className="col-lg-9 col-md-8">
                <div className="row g-4">
                    <div className="col-md-4">
                        <MetricBox label="TOTAL SCANS" value={total} sub="Combined Traffic" />
                    </div>
                    <div className="col-md-4">
                        <MetricBox label="THREATS DETECTED" value={breached_count} color="text-danger" sub="Compromised Assets" />
                    </div>
                    <div className="col-md-4">
                        <MetricBox label="PASSWORDS AUDITED" value={passwords.total} color="text-info" sub="SHA-1 Checks" />
                    </div>
                </div>
            </div>

            {/* 3. MAIN MULTI-LINE CHART (Middle) */}
            <div className="col-lg-8">
                <div className="card bg-glass border-secondary shadow-lg">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title fw-bold m-0 d-flex align-items-center gap-2">
                                <span className="d-inline-block rounded-circle bg-info" style={{ width: '8px', height: '8px' }}></span> 
                                30-DAY ACTIVITY
                            </h5>
                            <div className="small fw-bold">
                                <span className="text-info me-3">● PASSWORDS</span>
                                <span className="text-warning">● EMAILS</span>
                            </div>
                        </div>
                        <div style={{ height: '300px' }}>
                            <Line 
                                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#343a40' } } } }}
                                data={{
                                    labels: data.trends.labels,
                                    datasets: [
                                        { label: 'Passwords', data: data.trends.password_scans, borderColor: '#0dcaf0', backgroundColor: 'rgba(13, 202, 240, 0.1)', tension: 0.4, fill: true },
                                        { label: 'Emails', data: data.trends.email_scans, borderColor: '#ffc107', backgroundColor: 'rgba(255, 193, 7, 0.05)', tension: 0.4, borderDash: [5,5] }
                                    ]
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. EMAIL DOUGHNUT CHART (Side Right) */}
            <div className="col-lg-4">
                <div className="card bg-glass border-secondary h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
                        <h6 className="text-secondary fw-bold small text-uppercase mb-4">EMAIL RISK RATIO</h6>
                        <div style={{ width: '150px', height: '150px', position: 'relative' }}>
                            <Doughnut data={{
                                labels: ['Safe', 'Breached'],
                                datasets: [{ data: [emails.total - emails.breached, emails.breached], backgroundColor: ['#198754', '#dc3545'], borderWidth: 0 }]
                            }} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                            
                            <div className="position-absolute top-50 start-50 translate-middle h4 fw-bold text-light m-0">
                                {emails.total > 0 ? ((emails.breached/emails.total)*100).toFixed(0) : 0}%
                            </div>
                        </div>
                        <div className="mt-3 text-center small text-secondary">
                            {emails.breached.toLocaleString()} / {emails.total.toLocaleString()} <br/> Emails Compromised
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. PASSWORD BAR CHART (Bottom) */}
            <div className="col-12">
                <div className="card bg-glass border-secondary">
                    <div className="card-body p-4">
                        <h6 className="card-title fw-bold text-light mb-4">PASSWORD COMPLEXITY DISTRIBUTION</h6>
                        <div style={{ height: '200px' }}>
                            <Bar 
                                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { display: false } } }} 
                                data={{
                                    labels: data.lengths.labels,
                                    datasets: [{ data: data.lengths.values, backgroundColor: '#6610f2', borderRadius: 4 }]
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

const MetricBox = ({ label, value, sub, color="text-light" }) => (
    <div className="card bg-glass border-secondary h-100">
        <div className="card-body p-3">
            <div className="small text-secondary fw-bold text-uppercase">{label}</div>
            <div className={`display-6 fw-bold my-2 ${color}`}>{value.toLocaleString()}</div>
            <div className="small text-secondary">{sub}</div>
        </div>
    </div>
);