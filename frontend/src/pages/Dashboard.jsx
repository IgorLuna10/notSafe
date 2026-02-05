import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ON LOAD ---
  useEffect(() => {
    fetch('/api/v1/dashboard/analytics')
      .then((res) => {
        if (res.status === 401) window.location.href = '/login'; // Auth Check
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Mission Control...</div>;

  // --- CALCULATE GRADE ---
  const ratio = data.stats.total > 0 
    ? ((1 - (data.stats.breached_count / data.stats.total)) * 100) 
    : 100;
  
  let grade = 'A';
  let gradeColor = 'text-emerald-400';
  if (ratio < 60) { grade = 'F'; gradeColor = 'text-red-600'; }
  else if (ratio < 70) { grade = 'D'; gradeColor = 'text-orange-500'; }
  else if (ratio < 85) { grade = 'C'; gradeColor = 'text-yellow-500'; }
  else if (ratio < 95) { grade = 'B'; gradeColor = 'text-blue-400'; }

  // --- HANDLERS ---
  const handleReset = async () => {
    const pwd = prompt("WARNING: DELETE ALL DATA?\nType Admin Password:");
    if (!pwd) return;
    const res = await fetch('/api/v1/reset-db', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: pwd})
    });
    if(res.ok) window.location.reload();
    else alert("Access Denied");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 font-mono">
      <div className="max-w-7xl mx-auto pb-20">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              notSafe. <span className="text-slate-500 text-lg">| MISSION CONTROL</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 tracking-widest">REAL-TIME PASSWORD INTELLIGENCE</p>
          </div>
          <div className="flex gap-3">
            <a href="/export-csv" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-200 text-xs font-bold px-4 py-2 border border-emerald-900 rounded bg-emerald-900/20 transition">
              EXPORT CSV
            </a>
            <button onClick={handleReset} className="text-red-400 hover:text-red-200 text-xs font-bold px-4 py-2 border border-red-900 rounded bg-red-900/20 transition">
              RESET DB
            </button>
            <button onClick={() => { fetch('/api/v1/auth/logout', {method:'POST'}).then(()=>window.location.href='/login')}} className="text-slate-400 hover:text-white text-xs font-bold px-4 py-2 border border-slate-700 rounded bg-slate-800 transition">
              LOGOUT
            </button>
          </div>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card title="TOTAL SCANS" value={data.stats.total} color="text-white" border="border-blue-500" />
            <Card title="BREACHES" value={data.stats.breached_count} color="text-red-500" border="border-red-500" />
            <Card title="SAFETY RATIO" value={`${ratio.toFixed(1)}%`} color="text-emerald-400" border="border-emerald-500" />
            
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 p-6 rounded-xl border-t-4 border-slate-500 flex justify-between items-center shadow-xl">
                <div>
                    <h3 className="text-slate-500 text-[10px] tracking-[0.2em] font-bold">GLOBAL GRADE</h3>
                    <p className="text-[10px] text-slate-600 mt-1">SYSTEM HEALTH</p>
                </div>
                <div className={`text-5xl font-black ${gradeColor}`}>{grade}</div> 
            </div>
        </div>

        {/* TREND CHART */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 p-6 rounded-xl mb-8 shadow-xl">
           <SectionTitle color="bg-indigo-500" title="30-DAY THREAT LANDSCAPE" />
           <div className="h-64 w-full">
             <Line options={commonOptions} data={{
               labels: data.trends.labels,
               datasets: [
                 { label: 'Activity', data: data.trends.scans, borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 },
                 { label: 'Breaches', data: data.trends.breaches, borderColor: '#ef4444', borderDash: [5,5], tension: 0.4 }
               ]
             }} />
           </div>
        </div>

        {/* SPLIT ROW: LENGTH & RATIO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-md border border-slate-700 p-6 rounded-xl shadow-xl">
                <SectionTitle color="bg-blue-500" title="PASSWORD LENGTH (REAL DATA)" />
                <div className="h-64">
                  <Bar options={commonOptions} data={{
                    labels: data.lengths.labels,
                    datasets: [{ label: 'Passwords', data: data.lengths.values, backgroundColor: '#3b82f6', borderRadius: 4 }]
                  }} />
                </div>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 p-6 rounded-xl flex flex-col shadow-xl">
                <SectionTitle color="bg-red-500" title="THREAT RATIO" />
                <div className="h-48 relative flex-grow flex items-center justify-center">
                  <Doughnut data={{
                    labels: ['Safe', 'Breached'],
                    datasets: [{ data: [data.stats.safe_count, data.stats.breached_count], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }]
                  }} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
                </div>
                <div className="mt-4 text-center text-xs text-slate-500">
                    <span className="text-emerald-400 font-bold">SAFE</span> vs <span className="text-red-500 font-bold">BREACHED</span>
                </div>
            </div>
        </div>

        {/* ADVANCED ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="COMPLEXITY DNA" color="bg-purple-500" subtitle="Character class distribution">
                <Radar data={{
                  labels: ['Upper', 'Lower', 'Num', 'Sym'],
                  datasets: [{ label: 'Usage', data: data.advanced.comp_data, backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7' }]
                }} options={radarOptions} />
            </ChartCard>

            <ChartCard title="DEPARTMENT RISK" color="bg-orange-500" subtitle="Avg. Security Score per Dept.">
                 <Bar options={{...commonOptions, indexAxis: 'y', scales: { x: { max: 100, grid: { color: '#334155' } }, y: { grid: { display: false } } }}} data={{
                    labels: data.advanced.dept_labels,
                    datasets: [{ label: 'Score', data: data.advanced.dept_scores, backgroundColor: (ctx) => ctx.raw < 60 ? '#ef4444' : ctx.raw < 80 ? '#f59e0b' : '#10b981', borderRadius: 4 }]
                }} />
            </ChartCard>

            <ChartCard title="ENTROPY DENSITY" color="bg-teal-500" subtitle="Bit-strength distribution">
                <Line options={{...commonOptions, scales: { y: { display: false }, x: { grid: { display: false } } }}} data={{
                  labels: data.advanced.ent_labels,
                  datasets: [{ label: 'Distribution', data: data.advanced.ent_values, borderColor: '#14b8a6', backgroundColor: 'rgba(20, 184, 166, 0.2)', fill: true, tension: 0.4 }]
                }} />
            </ChartCard>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS & CONFIG ---

const Card = ({ title, value, color, border }) => (
  <div className={`bg-slate-800/60 backdrop-blur-md border border-slate-700 p-6 rounded-xl border-t-4 ${border} shadow-xl`}>
    <h3 className="text-slate-500 text-[10px] tracking-[0.2em] font-bold">{title}</h3>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const ChartCard = ({ title, color, children, subtitle }) => (
  <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 p-6 rounded-xl shadow-xl">
    <SectionTitle color={color} title={title} />
    <div className="h-56">{children}</div>
    <p className="text-[10px] text-slate-500 text-center mt-2">{subtitle}</p>
  </div>
);

const SectionTitle = ({ color, title }) => (
  <h3 className="text-slate-300 text-sm font-bold mb-4 flex items-center gap-2">
    <span className={`w-2 h-2 ${color} rounded-full`}></span> {title}
  </h3>
);

const commonOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { grid: { color: '#334155' } }, x: { grid: { display: false } } }
};

const radarOptions = {
  maintainAspectRatio: false,
  scales: { r: { angleLines: { color: '#334155' }, grid: { color: '#334155' }, pointLabels: { color: '#94a3b8' }, ticks: { display: false } } }
};