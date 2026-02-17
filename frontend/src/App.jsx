import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';                
import PasswordTool from './pages/PasswordTool'; 
import EmailChecker from './pages/EmailChecker';
import About from './pages/About';
import Login from './pages/Login';       
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import GlobalDashboard from './pages/GlobalDashboard';
import CompanyPortal from './pages/CompanyPortal'; // <--- NEW IMPORT

// Components
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute'; 

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-dark">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/global" element={<GlobalDashboard />} />
          <Route path="/audit" element={<PasswordTool />} />
          <Route path="/email-monitor" element={<EmailChecker />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* NEW: Public Company Portal */}
          <Route path="/portal/:companyId" element={<CompanyPortal />} />

          {/* PROTECTED ROUTES */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;