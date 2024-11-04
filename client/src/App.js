import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import DashboardPage from './components/DashboardPage';
import Contact from './components/Contact';
import ReceiptsPage from './components/ReceiptsPage'; // ייבוא הדף של ניהול קבלות
import Register from './components/Register';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/receipts" element={<ReceiptsPage />} /> {/* נתיב תקין לניהול קבלות */}
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/contact" element={<Contact />} /> {/* דף צור קשר */}
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;


