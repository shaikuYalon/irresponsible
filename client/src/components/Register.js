import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import styles from './Register.module.css';

function Register() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', formData);
            const { user_id, username } = response.data.user;
            
            localStorage.setItem('userId', user_id);
            localStorage.setItem('username', username);
            
            navigate('/dashboard');
        } catch (error) {
            alert('Error registering: ' + (error.response?.data?.message || error.message));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            className={styles.formContainer}
            sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
            noValidate
            autoComplete="off"
        >
            <h2>הרשמה</h2>
            <TextField
                label="שם פרטי"
                variant="outlined"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
            />
            <TextField
                label="שם משפחה"
                variant="outlined"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
            />
            <TextField
                label="שם משתמש"
                variant="outlined"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
            />
            <TextField
                label="אימייל"
                variant="outlined"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <div className={styles.passwordContainer}>
                <TextField
                    label="סיסמה"
                    variant="outlined"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <span onClick={togglePasswordVisibility} className={`${styles.togglePassword} material-symbols-outlined`}>
                    {showPassword ? 'visibility' : 'visibility_off'}
                </span>
            </div>
            <button type="submit" className={styles.submitButton}>הירשם</button>
        </Box>
    );
}

export default Register;
