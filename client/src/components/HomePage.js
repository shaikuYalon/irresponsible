import React from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // ספרייה לפענוח טוקן
import styles from './HomePage.module.css';

function HomePage() {
    const navigate = useNavigate();

    const goToRegister = () => {
        navigate('/register'); 
    };

    const goToLogin = () => {
        let token = null;
        let userRole = null;

        try {
            token = sessionStorage.getItem('token'); // שליפת הטוקן מ-sessionStorage
            if (token) {
                const decodedToken = jwtDecode(token); // פענוח הטוקן
                userRole = decodedToken.role; // שליפת role מתוך הטוקן
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }

        if (userRole) {
            // בדיקה של ה-role והפניה בהתאם
            if (userRole === 'admin') {
                navigate('/admin-dashboard'); // דף מנהל
            } else {
                navigate('/dashboard'); // דף רגיל למשתמש
            }
        } else {
            navigate('/login'); // דף התחברות אם אין טוקן או role
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
