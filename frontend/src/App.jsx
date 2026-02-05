import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';                // New Intro Page
import PasswordTool from './pages/PasswordTool'; // Renamed Password Page
import About from './pages/About';
import EmailChecker from './pages/EmailChecker';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Tools */}
        <Route path="/password-check" element={<PasswordTool />} />
        <Route path="/email-checker" element={<EmailChecker />} />
        
        {/* Info */}
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;