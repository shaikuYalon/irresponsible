import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import styles from './Login.module.css';

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            const { user_id, username } = response.data.user;
            localStorage.setItem('username', username);
            localStorage.setItem('userId', user_id);
            navigate('/dashboard');
        } catch (error) {
            alert('Error logging in: ' + (error.response?.data?.message || error.message));
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
                <span onClick={togglePasswordVisibility} className={`${styles.togglePassword} material-symbols-outlined`}>
                    {showPassword ? 'visibility' : 'visibility_off'}
                </span>
            </div>
            <button type="submit" className={styles.loginButton}>התחבר</button>
        </Box>
    );
}

export default Login;
