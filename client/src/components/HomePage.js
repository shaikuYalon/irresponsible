import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

function HomePage() {
    const navigate = useNavigate();

    const goToRegister = () => {
        navigate('/register'); 
    };

    const goToLogin = () => {
        let user = null;

        try {
            user = JSON.parse(localStorage.getItem('user')); // שליפת פרטי המשתמש מה-localStorage
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
        }

        if (user && user.role) {
            // בדיקה של ה-role והפניה בהתאם
            if (user.role === 'admin') {
                navigate('/admin-dashboard'); // דף מנהל
            } else {
                navigate('/dashboard'); // דף רגיל למשתמש
            }
        } else {
            navigate('/login'); // דף התחברות אם אין משתמש
        }
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
