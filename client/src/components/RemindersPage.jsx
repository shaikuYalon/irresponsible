import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RemindersPage.module.css';

function RemindersPage() {
    // מצב לשמירת רשימת התזכורות
    const [reminders, setReminders] = useState([]);
    // מצב לשמירת פרטי תזכורת חדשה עם סוג ברירת מחדל
    const [newReminder, setNewReminder] = useState({
        reminderType: '7days',
    });

    // טעינת תזכורות עם עליית הקומפוננטה
    useEffect(() => {
        fetchReminders();
    }, []);

    // שליפת תזכורות מהשרת
    const fetchReminders = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error("User ID is missing");
                return;
            }
            const response = await axios.get(`http://localhost:5000/api/reminders?userId=${userId}`);
            setReminders(response.data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
        }
    };
    

    // הוספת תזכורת חדשה לשרת וריענון הרשימה
    const addReminder = async () => {
        try {
            await axios.post('http://localhost:5000/api/reminders', {
                ...newReminder,
                userId: localStorage.getItem('userId'),
            });
            setNewReminder({ reminderType: '7days' }); // איפוס התזכורת החדשה לאחר הוספה
            fetchReminders();
        } catch (error) {
            console.error("Error adding reminder:", error);
        }
    };

    // מחיקת תזכורת לפי מזהה וריענון הרשימה
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
                <select
                    value={newReminder.reminderType}
                    onChange={(e) => setNewReminder({ reminderType: e.target.value })} // עדכון סוג התזכורת החדשה
                >
                    <option value="7days">שבוע לפני</option>
                    <option value="14days">שבועיים לפני</option>
                    <option value="2days">יומיים לפני</option>
                </select>
                <button onClick={addReminder}>הוסף תזכורת</button>
            </div>
            <ul className={styles.remindersList}>
                {reminders.map((reminder) => (
                    <li key={reminder.id} className={styles.reminderItem}>
                        {/* הצגת סוג התזכורת בעברית */}
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
