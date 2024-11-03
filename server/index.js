import express from 'express';  // מייבא את הספרייה express, המאפשרת יצירת שרת אינטרנט.
import cors from 'cors';        // מייבא את הספרייה cors, שמאפשרת תקשורת חוצת דומיינים.
import authRoutes from './auth.js'; // ייבוא נתיבי האימות מקובץ auth.js לטיפול ברישום והתחברות משתמשים.
import connection from './db/connection.js'; // ייבוא החיבור ל-MySQL מקובץ connection.js.
import nodemailer from 'nodemailer'; // מייבא את Nodemailer לשליחת מיילים.

const app = express();       // יוצר אפליקציית express, שהיא האובייקט המרכזי של השרת.
app.use(cors());             // מאפשר תמיכה בבקשות חוצות דומיינים לכל מקור.
app.use(express.json());     // מאפשר לשרת לקרוא נתוני JSON מבקשות POST ו-PUT.

app.use('/api/auth', authRoutes); // מגדיר את נתיבי האימות בכתובת '/api/auth'.

// נתיב לשליחת מייל בטופס יצירת קשר
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // הגדרת טרנספורטר לשליחת מיילים
    const transporter = nodemailer.createTransport({
        service: 'gmail', // אפשר להשתמש גם ב-smtp מותאם אישית
        auth: {
            user: 'your-email@gmail.com', // החלף במייל שלך
            pass: 'your-password' // החלף בסיסמה שלך, עדיף להשתמש ב-App Passwords
        }
    });

    const mailOptions = {
        from: email, // האימייל של השולח
        to: 'Sh6744998@gmail.com', // כתובת המייל שאליה יישלח המייל
        subject: `New Contact Form Submission from ${name}`, // נושא המייל
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}` // גוף המייל
    };

    try {
        await transporter.sendMail(mailOptions); // שולח את המייל
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

// נתיב לקבלת רשימת הקבלות ממסד הנתונים
app.get('/receipts', (req, res) => {
    const sql = 'SELECT * FROM Receipts';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// הפעלת השרת על פורט 5000
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
