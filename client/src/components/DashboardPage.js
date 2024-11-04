import React from 'react';
import './DashboardPage.css';
import { useNavigate } from 'react-router-dom';


function DashboardPage({ username }) {
    const navigate = useNavigate();

    const handleReceiptsClick = () => {
        navigate('/receipts');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    const handleLogoutClick = () => {
        // כאן אפשר להוסיף את הלוגיקה להתנתקות, כמו ניקוי מידע מה-local storage
        navigate('/login');
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h2>ברוך הבא! {username}</h2>
                <p>ניהול האחריות שלך במקום אחד</p>
            </header>
            
            <div className="dashboard-links">
                <button className="dashboard-button" onClick={handleReceiptsClick}>ניהול קבלות</button>
                <button className="dashboard-button" onClick={handleProfileClick}>פרופיל</button>
                <button className="dashboard-button" onClick={handleSettingsClick}>הגדרות</button>
                <button className="dashboard-button logout-button" onClick={handleLogoutClick}>התנתק</button>
            </div>
        </div>
    );
}

export default DashboardPage;
