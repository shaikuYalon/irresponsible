// HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    const goToRegister = () => {
        navigate('/register');
    };

    const goToLogin = () => {
        navigate('/login');
    };

    const goToContact = () => {
        navigate('/contact'); // ניתוב לדף יצירת קשר
    };

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>Irresponsible</h1>
                <p>ניהול אחריות שלא הכרתם!</p>
                <button className="register-button" onClick={goToRegister}>הרשמה</button>
                <button className="login-button" onClick={goToLogin}>משתמש קיים</button>
            </header>

            <footer className="footer">
                <a href="#about">אודות</a> | <button className="link-button" onClick={goToContact}>צור קשר</button>
            </footer>
        </div>
    );
}

export default HomePage;
