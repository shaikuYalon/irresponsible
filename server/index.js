import express from 'express';  
import cors from 'cors';        
import authRoutes from './auth.js'; 
import connection from './db/connection.js'; 
import nodemailer from 'nodemailer'; 
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();       
app.use(cors());             
app.use(express.json());    
app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);

// הגדרת אחסון קבצים עם multer
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

// נתיב לשליחת מייל בטופס יצירת קשר
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

// שליפת כל הקבלות
app.get('/api/receipts', (req, res) => {
    const sql = 'SELECT * FROM Receipts';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// הוספת קבלה חדשה עם העלאת קובץ
app.post('/api/receipts', upload.single('image'), (req, res) => {
    const { userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const sql = 'INSERT INTO Receipts (user_id, category_id, store_name, purchase_date, product_name, warranty_expiration, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, imagePath], (err, result) => {
        if (err) {
            console.error('Error inserting receipt:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Receipt added successfully' });
    });
});

// עדכון קבלה קיימת
app.put('/api/receipts/:id', (req, res) => {
    const { id } = req.params;
    const { storeName, purchaseDate, productName, warrantyExpiration } = req.body;
    const sql = 'UPDATE Receipts SET store_name = ?, purchase_date = ?, product_name = ?, warranty_expiration = ? WHERE receipt_id = ?';
    connection.query(sql, [storeName, purchaseDate, productName, warrantyExpiration, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Receipt updated successfully' });
    });
});

// מחיקת קבלה
app.delete('/api/receipts/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Receipts WHERE receipt_id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Receipt deleted successfully' });
    });
});

// הפעלת השרת על פורט 5000
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
