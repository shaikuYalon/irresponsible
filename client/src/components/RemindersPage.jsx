import React, { useState, useEffect } from 'react';
import styles from './RemindersPage.module.css';
import apiClient from './ApiClient';

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
            const response = await apiClient.get('/reminders'); // שימוש ב-apiClient
            setReminders(response.data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
        }
    };
    
    

   // הוספת תזכורת חדשה לשרת וריענון הרשימה
const addReminder = async () => {
    try {
        await apiClient.post('/reminders', {
            ...newReminder, // פרטי התזכורת
        });
        setNewReminder({ reminderType: '7days' }); // איפוס התזכורת החדשה לאחר הוספה
        fetchReminders(); // ריענון רשימת התזכורות
    } catch (error) {
        console.error("Error adding reminder:", error);
    }
};

   // מחיקת תזכורת לפי מזהה וריענון הרשימה
const deleteReminder = async (id) => {
    try {
        await apiClient.delete(`/reminders/${id}`); // שימוש ב-apiClient למחיקת התזכורת
        fetchReminders(); // ריענון רשימת התזכורות
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


