// Contact.js
import React, { useState } from 'react';
import './Contact.css';

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
        setFormData({ name: '', email: '', message: '' }); // איפוס השדות אחרי השליחה
    };

    return (
        <div className="contact-page">
            <h2>צור קשר</h2>
            <form onSubmit={handleSubmit} className="contact-form">
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
                <button type="submit" className="submit-button">שלח</button>
            </form>
        </div>
    );
}

export default Contact;
