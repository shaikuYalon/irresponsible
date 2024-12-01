import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import styles from './Profile.module.css';

function Profile() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('userId'); // מזהה המשתמש
    const username = localStorage.getItem('username'); // שם המשתמש

    // טעינת פרטי המשתמש מהשרת
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
                setFormData(response.data);
            } catch (error) {
                setMessage('שגיאה בטעינת פרטי הפרופיל');
                console.error(error);
            }
        };

        fetchProfileData();
    }, [userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}`, formData);
            setMessage('פרטי הפרופיל עודכנו בהצלחה!');
        } catch (error) {
            setMessage('שגיאה בעדכון פרטי הפרופיל');
            console.error(error);
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
            <h2>עריכת פרופיל</h2>
            {message && <p className={styles.message}>{message}</p>}
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
                    label="סיסמה (רק אם ברצונך לשנות)"
                    variant="outlined"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                />
                <span onClick={togglePasswordVisibility} className={`${styles.togglePassword} material-symbols-outlined`}>
                    {showPassword ? 'visibility' : 'visibility_off'}
                </span>
            </div>
            <button type="submit" className={styles.submitButton}>עדכן פרופיל</button>
        </Box>
    );
}

export default Profile;
