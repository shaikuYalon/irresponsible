import React, { useState } from 'react';
import styles from './Contact.module.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [message, setMessage] = useState(''); // הודעת הצלחה או ביטול

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setMessage('ההודעה נשלחה בהצלחה!');
        setFormData({ name: '', email: '', message: '' });
    };

    const handleCancel = () => {
            window.history.back(); // מחזיר את המשתמש לעמוד הקודם
    };

    return (
        <div className={styles.contactPage}>
            <h2>צור קשר</h2>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
                <input
                    type="text"
                    name="name"
                    placeholder="שם הפונה"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="מייל הפונה"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="message"
                    placeholder="תוכן הפניה"
                    value={formData.message}
                    onChange={handleChange}
                    required
                />
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>שלח</button>
                    <button type="button" onClick={handleCancel} className={styles.submitButton}>ביטול</button>
                </div>
            </form>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}

export default Contact;
