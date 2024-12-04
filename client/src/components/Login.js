import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import styles from './Login.module.css';

function Login({ onLogin }) { // הוספת onLogin כ-prop
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState(""); // הודעת שגיאה
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // איפוס הודעת שגיאה
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            const { user_id, username, role } = response.data.user;

            localStorage.setItem('userId', user_id);
            localStorage.setItem('username', username);
            localStorage.setItem('role', role);

            // עדכון ה-state של App באמצעות onLogin
            if (onLogin) {
                onLogin(role);
            }

            // הפניה לדף המתאים לפי role
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "שגיאה בהתחברות.");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            className={styles.loginContainer}
            sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
            noValidate
            autoComplete="off"
        >
            <h2>התחברות</h2>
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            <TextField
                id="username"
                label="שם משתמש"
                variant="outlined"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={styles.loginInput}
            />
            <div className={styles.passwordContainer}>
                <TextField
                    id="password"
                    label="סיסמה"
                    variant="outlined"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={styles.loginInput}
                />
                <span
                    onClick={togglePasswordVisibility}
                    className={`${styles.togglePassword} material-symbols-outlined`}
                >
                    {showPassword ? 'visibility' : 'visibility_off'}
                </span>
            </div>
            <button type="submit" className={styles.loginButton}>התחבר</button>
        </Box>
    );
}

export default Login;
