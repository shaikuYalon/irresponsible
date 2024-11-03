import express from 'express';
import connection from './db/connection.js'; // ייבוא החיבור לבסיס הנתונים

const router = express.Router(); // יצירת נתיב (router) לניהול בקשות API

// רישום משתמש
router.post('/register', (req, res) => { // מסלול POST לרישום משתמשים חדשים
    const { firstName, lastName, username, email, password } = req.body; // קבלת פרטי המשתמש מתוך גוף הבקשה

    const sql = `INSERT INTO Users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)`; // שאילתה להוספת המשתמש לטבלת Users
    const values = [firstName, lastName, username, email, password]; // ערכי המשתמש (כדי למלא את מקומות הסימנים בשאילתה)

    connection.query(sql, values, (err, results) => { // הרצת השאילתה במסד הנתונים
        if (err) return res.status(500).json({ error: err.message }); // טיפול בשגיאות: החזרת שגיאה 500 עם הודעה במידה ויש כזו
        res.status(201).json({ // אם ההוספה הצליחה
            message: 'User registered successfully',
            user: { username } // החזרת שם המשתמש שנרשם כתשובה
        });
    });
});

// התחברות משתמש
router.post('/login', (req, res) => { // מסלול POST לכניסה של משתמש קיים
    const { username, password } = req.body; // קבלת שם משתמש וסיסמה מתוך גוף הבקשה

    const sql = `SELECT * FROM Users WHERE username = ? AND password = ?`; // שאילתה למציאת משתמש על פי שם משתמש וסיסמה
    const values = [username, password]; // הכנסת הנתונים שסופקו לשאילתה

    connection.query(sql, values, (err, results) => { // הרצת השאילתה במסד הנתונים
        if (err) return res.status(500).json({ error: err.message }); // טיפול בשגיאות: החזרת שגיאה 500 עם הודעה במידה ויש כזו
        if (results.length > 0) { // אם נמצא משתמש עם הפרטים שסופקו
            res.json({ message: 'Login successful', user: results[0] }); // החזרת תגובה עם פרטי המשתמש
        } else { // אם לא נמצא משתמש עם הפרטים שסופקו
            res.status(401).json({ message: 'Invalid username or password' }); // החזרת תגובה של שגיאה עם קוד 401
        }
    });
});

export default router; // ייצוא הנתיב (router) כך שניתן יהיה להשתמש בו בקבצים אחרים
