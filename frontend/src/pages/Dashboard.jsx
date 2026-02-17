import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newDept, setNewDept] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard/analytics');
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const addDept = async (e) => {
    e.preventDefault();
    if(!newDept) return;
    await api.post('/company/departments', { name: newDept });
    setNewDept('');
    fetchData();
  };

  const deleteDept = async (name) => {
    if(!confirm(`Delete ${name}?`)) return;
    await api.delete('/company/departments', { data: { name } });
    fetchData();
  };

  const portalLink = data?.company_id ? `${window.location.origin}/portal/${data.company_id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(portalLink);
    alert("Portal Link Copied!");
  };

  if (loading) return <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center text-info font-monospace">CONNECTING...</div>;

  const { total = 0, breached_count = 0 } = data.stats;
  const ratio = total > 0 ? ((1 - (breached_count/total))*100).toFixed(1) : 100;

  return (
    <div className="min-vh-100 bg-dark text-light p-4 font-monospace">
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* HEADER */}
        <header className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 border-bottom border-secondary pb-4">
          <div className="mb-3 mb-md-0">
            <h1 className="h2 fw-bold m-0">{data.company_name.toUpperCase()} <span className="text-info">HQ</span></h1>
            <p className="small text-secondary m-0">DEPARTMENTAL RISK ASSESSMENT</p>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-outline-secondary btn-sm fw-bold rounded-pill px-4">DISCONNECT</button>
        </header>

        {/* METRICS ROW */}
        <div className="row g-4 mb-5">
            <div className="col-md-4"><MetricCard title="TOTAL CHECKS" value={total} border="border-info" /></div>
            <div className="col-md-4"><MetricCard title="BREACHES FOUND" value={breached_count} color="text-danger" border="border-danger" /></div>
            <div className="col-md-4"><MetricCard title="SAFETY SCORE" value={ratio + '%'} color={ratio > 80 ? 'text-success' : 'text-warning'} border="border-success" /></div>
        </div>

        {/* MANAGEMENT ROW */}
        <div className="row g-4">
            
            {/* LEFT: CONFIGURATION */}
            <div className="col-md-5">
                <div className="card bg-glass border-secondary h-100">
                    <div className="card-header bg-transparent border-secondary fw-bold text-info">
                        PORTAL CONFIGURATION
                    </div>
                    <div className="card-body">
                        
                        {/* 1. PORTAL LINK */}
                        <div className="p-3 bg-dark border border-secondary rounded mb-4 text-center">
                            <div className="small text-secondary fw-bold mb-2">EMPLOYEE PORTAL LINK</div>
                            <code className="d-block p-2 bg-black rounded text-info mb-3 text-break user-select-all">
                                {portalLink}
                            </code>
                            <button onClick={copyLink} className="btn btn-sm btn-outline-light fw-bold w-100">
                                <i className="bi bi-clipboard me-2"></i> COPY LINK
                            </button>
                        </div>

                        <hr className="border-secondary my-4" />

                        {/* 2. DEPARTMENTS */}
                        <div className="small text-secondary fw-bold mb-2">MANAGE DEPARTMENTS</div>
                        <form onSubmit={addDept} className="d-flex gap-2 mb-3">
                            <input 
                                value={newDept} 
                                onChange={e=>setNewDept(e.target.value)} 
                                className="form-control bg-dark text-light border-secondary" 
                                placeholder="e.g. Finance" 
                            />
                            <button className="btn btn-info fw-bold">+</button>
                        </form>
                        
                        <div className="d-flex flex-wrap gap-2">
                            {data.departments.map(dept => (
                                <span key={dept} className="badge bg-dark border border-secondary p-2 d-flex align-items-center gap-2">
                                    {dept}
                                    <button onClick={()=>deleteDept(dept)} className="btn-close btn-close-white ms-1" style={{ fontSize: '0.5em' }}></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: CHART */}
            <div className="col-md-7">
                <div className="card bg-glass border-secondary h-100">
                    <div className="card-header bg-transparent border-secondary fw-bold text-light">RISK BY DEPARTMENT</div>
                    <div className="card-body">
                        {data.department_data && data.department_data.length > 0 ? (
                            <div style={{ height: '300px' }}>
                                <Bar data={{
                                    labels: data.department_data.map(d => d._id),
                                    datasets: [
                                        { label: 'Total Checks', data: data.department_data.map(d => d.total), backgroundColor: '#0dcaf0' },
                                        { label: 'Breaches', data: data.department_data.map(d => d.breached), backgroundColor: '#dc3545' }
                                    ]
                                }} options={{ maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: '#333' } } } }} />
                            </div>
                        ) : (
                            <div className="text-center text-secondary py-5 d-flex flex-column align-items-center justify-content-center h-100">
                                <i className="bi bi-bar-chart-fill fs-1 mb-3"></i>
                                NO DATA YET. SHARE THE PORTAL LINK TO GATHER INTELLIGENCE.
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

const MetricCard = ({ title, value, color='text-light', border }) => (
  <div className={`card bg-glass border-secondary h-100 border-start border-4 ${border.replace('border-', 'border-start-')}`}>
    <div className="card-body p-4">
        <h6 className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>{title}</h6>
        <div className={`display-5 fw-bold mt-2 ${color}`}>{value}</div>
    </div>
  </div>
);