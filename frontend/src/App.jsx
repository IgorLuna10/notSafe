import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';                
import PasswordTool from './pages/PasswordTool'; 
import EmailChecker from './pages/EmailChecker';
import About from './pages/About';
import Login from './pages/Login';       
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import GlobalDashboard from './pages/GlobalDashboard';
import CompanyPortal from './pages/CompanyPortal';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Components
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute'; 

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/global" element={<GlobalDashboard />} />
            <Route path="/audit" element={<PasswordTool />} />
            <Route path="/email-monitor" element={<EmailChecker />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
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
    </ThemeProvider>
  );
}

export default App;