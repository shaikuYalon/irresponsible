import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import styles from './Profile.module.css';
import apiClient from './ApiClient';

function Profile() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '', email: '' });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('userId'); // מזהה המשתמש

    // טעינת פרטי המשתמש מהשרת
useEffect(() => {
    const fetchProfileData = async () => {
        try {
            const response = await apiClient.get(`/users/${userId}`); // שימוש ב-apiClient
            setFormData(response.data);
        } catch (error) {
            setMessage('שגיאה בטעינת פרטי הפרופיל');
            console.error(error);
        }
    };

    if (userId) {
        fetchProfileData();
    }
}, [userId]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/users/${userId}`, formData); // שימוש ב-apiClient
            setMessage('פרטי הפרופיל עודכנו בהצלחה!');
        } catch (error) {
            setMessage('שגיאה בעדכון פרטי הפרופיל');
            console.error(error);
        }
    };
    

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setMessage('הסיסמה החדשה והאישור אינם תואמים.');
            return;
        }
    
        try {
            await apiClient.post('/users/change-password', {
                userId,
                currentPassword,
                newPassword,
            });
            setMessage('הסיסמה עודכנה בהצלחה!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'שגיאה בעדכון הסיסמה.';
            setMessage(errorMsg);
            console.error('Error changing password:', error);
        }
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
            <button type="submit" className={styles.submitButton}>עדכן פרופיל</button>

            <h3>שינוי סיסמה</h3>
            <TextField
                label="סיסמה נוכחית"
                variant="outlined"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
            />
            <TextField
                label="סיסמה חדשה"
                variant="outlined"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
            />
            <TextField
                label="אישור סיסמה חדשה"
                variant="outlined"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <button
                type="button"
                className={styles.submitButton}
                onClick={handlePasswordChange}
            >
                עדכן סיסמה
            </button>
        </Box>
    );
}

export default Profile;
