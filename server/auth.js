import express from 'express';
import connection from './db/connection.js'; // ייבוא החיבור לבסיס הנתונים

const router = express.Router(); // יצירת נתיב (router) לניהול בקשות API

// רישום משתמש
router.post('/register', (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    const sql = `INSERT INTO Users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)`;
    const values = [firstName, lastName, username, email, password];

    connection.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            message: 'User registered successfully',
            user: { user_id: results.insertId, username } // החזרת user_id ו-username
        });
    });
});


// התחברות משתמש
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = `SELECT user_id, username FROM Users WHERE username = ? AND password = ?`; // מחזיר רק את user_id ו-username
    const values = [username, password];

    connection.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            const user = results[0]; // תוצאה ראשונה מהשאילתה
            res.json({ message: 'Login successful', user }); // החזרת userId ו-username בלבד
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

export default router;
