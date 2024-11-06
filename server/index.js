import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import connection from './db/connection.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);

// אחסון קבצים עם multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// שליחת מייל בטופס יצירת קשר
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'your-email@gmail.com', pass: 'your-password' }
    });
    const mailOptions = {
        from: email,
        to: 'Sh6744998@gmail.com',
        subject: `New Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

// שליפת כל הקטגוריות
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM Categories';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// שליפת קבלות לפי userId
app.get('/api/receipts', (req, res) => {
    const userId = req.query.userId;
    const sql = 'SELECT * FROM Receipts WHERE user_id = ?';
    connection.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// הוספת קבלה עם קובץ כולל לוגים לבדיקת reminderDaysBefore
app.post('/api/receipts', upload.single('image'), (req, res) => {
    const { userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore } = req.body;
    const imagePath = req.file ? req.file.path : null;

    console.log("Received data for new receipt:", {
        userId,
        categoryId,
        storeName,
        purchaseDate,
        productName,
        warrantyExpiration,
        imagePath,
        reminderDaysBefore
    });

    const sql = 'INSERT INTO Receipts (user_id, category_id, store_name, purchase_date, product_name, warranty_expiration, image_path, reminder_days_before) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, imagePath, reminderDaysBefore], (err) => {
        if (err) {
            console.error('Error inserting receipt:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Receipt added successfully' });
    });
});

// עדכון קבלה קיימת כולל תזכורת
app.put('/api/receipts/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore } = req.body;
    const imagePath = req.file ? req.file.path : null;

    connection.query('SELECT * FROM Receipts WHERE receipt_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Receipt not found' });

        const sql = imagePath
            ? 'UPDATE Receipts SET user_id = ?, category_id = ?, store_name = ?, purchase_date = ?, product_name = ?, warranty_expiration = ?, image_path = ?, reminder_days_before = ? WHERE receipt_id = ?'
            : 'UPDATE Receipts SET user_id = ?, category_id = ?, store_name = ?, purchase_date = ?, product_name = ?, warranty_expiration = ?, reminder_days_before = ? WHERE receipt_id = ?';

        const params = imagePath
            ? [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, imagePath, reminderDaysBefore, id]
            : [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore, id];

        connection.query(sql, params, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Receipt updated successfully' });
        });
    });
});

// מחיקת קבלה עם מחיקת תזכורות קשורות
app.delete('/api/receipts/:id', (req, res) => {
    const { id } = req.params;
    
    // מחיקת התזכורות הקשורות לקבלה
    const deleteRemindersSql = 'DELETE FROM Reminders WHERE receipt_id = ?';
    connection.query(deleteRemindersSql, [id], (err) => {
        if (err) {
            console.error("Error deleting reminders for receipt:", err);
            return res.status(500).json({ error: err.message });
        }

        // מחיקת הקבלה לאחר מחיקת התזכורות
        const deleteReceiptSql = 'DELETE FROM Receipts WHERE receipt_id = ?';
        connection.query(deleteReceiptSql, [id], (err, result) => {
            if (err) {
                console.error("Error deleting receipt:", err);
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Receipt not found" });
            }
            res.json({ message: 'Receipt and related reminders deleted successfully' });
        });
    });
});

// הוספת תזכורת ועדכון תאריך בהתאם
app.post('/api/reminders', (req, res) => {
    const { userId, receiptId, reminderDaysBefore } = req.body;

    const sql = 'UPDATE Receipts SET reminder_days_before = ? WHERE receipt_id = ? AND user_id = ?';
    
    connection.query(sql, [reminderDaysBefore, receiptId, userId], (err, result) => {
        if (err) {
            console.error("Error updating reminder:", err.message);
            return res.status(500).json({ error: "Failed to add or update reminder" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Receipt not found or user mismatch" });
        }
        res.status(201).json({ message: 'Reminder updated successfully' });
    });
});

// קרון ג'וב לתזכורות יומיות
cron.schedule('0 8 * * *', () => {
    console.log("Cron job running for warranty expiration checks");
    const sql = `SELECT * FROM Receipts WHERE warranty_expiration BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)`;
    connection.query(sql, async (err, receipts) => {
        if (err) {
            console.error("Error fetching receipts for reminders:", err);
            return;
        }

        for (const receipt of receipts) {
            let reminderDays;
            let daysLeft = Math.ceil((new Date(receipt.warranty_expiration) - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft === 14) reminderDays = "שבועיים";
            else if (daysLeft === 7) reminderDays = "שבוע";
            else if (daysLeft === 2) reminderDays = "יומיים";
            
            if (reminderDays) {
                const notificationSql = `INSERT INTO Notifications (user_id, message) VALUES (?, ?)`;
                const message = `תזכורת: האחריות למוצר "${receipt.product_name}" מסתיימת בעוד ${reminderDays}.`;
                
                connection.query(notificationSql, [receipt.user_id, message], async (err) => {
                    if (err) console.error("Error adding notification:", err);
                });

                const userSql = `SELECT email FROM Users WHERE user_id = ?`;
                connection.query(userSql, [receipt.user_id], async (err, users) => {
                    if (err || users.length === 0) {
                        console.error("Error fetching user email:", err);
                        return;
                    }

                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: 'your-email@gmail.com', pass: 'your-password' }
                    });

                    const mailOptions = {
                        from: 'your-email@gmail.com',
                        to: users[0].email,
                        subject: 'תזכורת לתום אחריות',
                        text: message
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`Reminder email sent to ${users[0].email}`);
                    } catch (error) {
                        console.error("Error sending reminder email:", error);
                    }
                });
            }
        }
    });
});

// הפעלת השרת על פורט 5000
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
