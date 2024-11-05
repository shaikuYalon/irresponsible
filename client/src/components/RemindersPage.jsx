import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RemindersPage.module.css';

function RemindersPage() {
    const [reminders, setReminders] = useState([]);
    const [newReminder, setNewReminder] = useState({
        reminderType: '7days',
    });

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.get(`http://localhost:5000/api/reminders?userId=${userId}`);
            setReminders(response.data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
        }
    };

    const addReminder = async () => {
        try {
            await axios.post('http://localhost:5000/api/reminders', {
                ...newReminder,
                userId: localStorage.getItem('userId'),
            });
            setNewReminder({ reminderType: '7days' });
            fetchReminders();
        } catch (error) {
            console.error("Error adding reminder:", error);
        }
    };

    const deleteReminder = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/reminders/${id}`);
            fetchReminders();
        } catch (error) {
            console.error("Error deleting reminder:", error);
        }
    };

    return (
        <div className={styles.remindersPage}>
            <h2>ניהול תזכורות</h2>
            <div className={styles.reminderForm}>
                <label>בחר סוג תזכורת:</label>
                <select value={newReminder.reminderType} onChange={(e) => setNewReminder({ reminderType: e.target.value })}>
                    <option value="7days">שבוע לפני</option>
                    <option value="14days">שבועיים לפני</option>
                    <option value="2days">יומיים לפני</option>
                </select>
                <button onClick={addReminder}>הוסף תזכורת</button>
            </div>
            <ul className={styles.remindersList}>
                {reminders.map((reminder) => (
                    <li key={reminder.id} className={styles.reminderItem}>
                        {reminder.reminderType === '7days' && 'שבוע לפני'}
                        {reminder.reminderType === '14days' && 'שבועיים לפני'}
                        {reminder.reminderType === '2days' && 'יומיים לפני'}
                        <button onClick={() => deleteReminder(reminder.id)} className={styles.deleteButton}>מחק</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RemindersPage;
