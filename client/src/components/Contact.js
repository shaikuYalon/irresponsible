import React, { useState } from 'react';
import styles from './Contact.module.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // כאן אפשר להוסיף את הלוגיקה לשליחת המייל
        console.log('Form submitted:', formData);
        alert('ההודעה נשלחה בהצלחה!');
        setFormData({ name: '', email: '', message: '' });
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
                <button type="submit" className={styles.submitButton}>שלח</button>
            </form>
        </div>
    );
}

export default Contact;
