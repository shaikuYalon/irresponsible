import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

function HomePage() {
    const navigate = useNavigate();

    const goToRegister = () => {
        navigate('/register'); 
    };

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <div className={styles.homePage}>
            <header className={styles.homeHeader}>
                <h1>Irresponsible</h1>
                <p>ניהול אחריות שלא הכרתם!</p>
                <button className={styles.registerButton} onClick={goToRegister}>הרשמה</button>
                <button className={styles.loginButton} onClick={goToLogin}>משתמש קיים</button>
            </header>
        </div>
    );
}

export default HomePage;
