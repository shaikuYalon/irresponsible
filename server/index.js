import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import connection from './db/connection.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import cron from 'node-cron';
import { initializeApp } from 'firebase/app';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig.js';
import path from 'path';



const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// הגדרת אחסון קבצים עם multer לשימוש בזיכרון בלבד
const upload = multer({ storage: multer.memoryStorage() });

// פונקציה להעלאת תמונה לפיירבייס והחזרת URL
const uploadImageToFirebase = async (file) => {
    const uniqueSuffix = Date.now();
    const fileName = `receipt_${uniqueSuffix}${path.extname(file.originalname)}`;
    const storageRef = ref(storage, `receipts/${fileName}`);
    const metadata = {
        contentType: file.mimetype, // לדוגמה: "image/jpeg" או "image/png"
    };
    const snapshot = await uploadBytes(storageRef, file.buffer,metadata);
    return await getDownloadURL(snapshot.ref);
  };
  

// מסלול להוספת קבלה עם העלאה לפיירבייס
app.post('/api/receipts', upload.single('image'), async (req, res) => {
  const { userId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore } = req.body;
  const categoryId = parseInt(req.body.categoryId, 10) || null;

  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImageToFirebase(req.file);
    }

    const sql = 'INSERT INTO Receipts (user_id, category_id, store_name, purchase_date, product_name, warranty_expiration, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, imageUrl];

    connection.query(sql, params, (err, result) => {
      if (err) {
        console.error("Error adding receipt:", err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: 'Receipt added successfully', receiptId: result.insertId });
    });
  } catch (error) {
    console.error("Error uploading image to Firebase:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});



// שליחת מייל באמצעות טופס יצירת קשר
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
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

// שליפת כל הקטגוריות מהדאטה בייס
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM Categories';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
// קבלה לפי מיון
app.get('/api/receipts', (req, res) => {
    const userId = req.query.userId;
    const { categoryId, storeName, productName, startDate, endDate, sortField, sortOrder } = req.query;
    let sql = 'SELECT * FROM Receipts WHERE user_id = ? AND is_deleted = 0';
    const params = [userId];

    if (categoryId) {
        sql += ' AND category_id = ?';
        params.push(categoryId);
    }
    if (storeName) {
        sql += ' AND store_name LIKE ?';
        params.push(`%${storeName}%`);
    }
    if (productName) {
        sql += ' AND product_name LIKE ?';
        params.push(`%${productName}%`);
    }
    if (startDate && endDate) {
        sql += ' AND purchase_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }

    // הוספת מיון
    if (sortField && sortOrder) {
        sql += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    connection.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// הוספת תזכורת בקבלה קיימת
app.post('/api/reminders', (req, res) => {
    const { userId, receiptId, reminderDaysBefore } = req.body;
    
    // הוספת תזכורת חדשה או עדכון אם כבר קיימת
    const checkReminderSql = 'SELECT * FROM Reminders WHERE receipt_id = ?';
    connection.query(checkReminderSql, [receiptId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to check reminder' });

        // חישוב תאריך התזכורת לפי תאריך סיום האחריות
        const warrantySql = 'SELECT warranty_expiration FROM Receipts WHERE receipt_id = ?';
        connection.query(warrantySql, [receiptId], (err, receiptResults) => {
            if (err || receiptResults.length === 0) return res.status(404).json({ error: 'Receipt not found' });

            const warrantyExpiration = new Date(receiptResults[0].warranty_expiration);
            const reminderDate = new Date(warrantyExpiration.getTime() - reminderDaysBefore * 24 * 60 * 60 * 1000);

            if (results.length > 0) {
                // אם יש כבר תזכורת - מבצעים עדכון
                const updateReminderSql = 'UPDATE Reminders SET reminder_days_before = ?, reminder_date = ? WHERE receipt_id = ?';
                connection.query(updateReminderSql, [reminderDaysBefore, reminderDate, receiptId], (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to update reminder' });

                    // עדכון השדה בטבלת הקבלות להצגת תזכורת
                    const updateReceiptSql = 'UPDATE Receipts SET reminder_days_before = ? WHERE receipt_id = ?';
                    connection.query(updateReceiptSql, [reminderDaysBefore, receiptId], (err) => {
                        if (err) return res.status(500).json({ error: 'Failed to update receipt' });
                        res.status(200).json({ message: 'Reminder updated successfully' });
                    });
                });
            } else {
                // אם אין תזכורת קיימת - מוסיפים חדשה
                const insertReminderSql = 'INSERT INTO Reminders (user_id, receipt_id, reminder_days_before, reminder_date) VALUES (?, ?, ?, ?)';
                connection.query(insertReminderSql, [userId, receiptId, reminderDaysBefore, reminderDate], (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to add reminder' });

                    // עדכון השדה בטבלת הקבלות להצגת תזכורת
                    const updateReceiptSql = 'UPDATE Receipts SET reminder_days_before = ? WHERE receipt_id = ?';
                    connection.query(updateReceiptSql, [reminderDaysBefore, receiptId], (err) => {
                        if (err) return res.status(500).json({ error: 'Failed to update receipt' });
                        res.status(201).json({ message: 'Reminder added successfully' });
                    });
                });
            }
        });
    });
});


// הוספת קבלה חדשה עם אפשרות לתזכורת
app.post('/api/receipts', upload.single('image'), (req, res) => {
    const { userId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore } = req.body;
    const categoryId = parseInt(req.body.categoryId, 10) || null; // ממיר את categoryId למספר או מגדיר null במקרה של ערך ריק
    const imagePath = req.file ? req.file.path : null;

    const sql = 'INSERT INTO Receipts (user_id, category_id, store_name, purchase_date, product_name, warranty_expiration, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, imagePath];

    connection.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error adding receipt:", err);
            return res.status(500).json({ error: err.message });
        }

        const receiptId = result.insertId;

        if (reminderDaysBefore && reminderDaysBefore.trim() !== '') {
            const daysBefore = parseInt(reminderDaysBefore, 10);
            const reminderDate = new Date(new Date(warrantyExpiration).getTime() - daysBefore * 24 * 60 * 60 * 1000);
        
            const reminderSql = 'INSERT INTO Reminders (user_id, receipt_id, reminder_days_before, reminder_date) VALUES (?, ?, ?, ?)';
            const reminderParams = [userId, receiptId, daysBefore, reminderDate];
        
            connection.query(reminderSql, reminderParams, (err) => {
                if (err) {
                    console.error("Error adding reminder:", err.message);
                    return res.status(500).json({ error: "Failed to add reminder" });
                }

                const updateReceiptSql = 'UPDATE Receipts SET reminder_days_before = ? WHERE receipt_id = ?';
                connection.query(updateReceiptSql, [daysBefore, receiptId], (err) => {
                    if (err) {
                        console.error("Error updating reminder_days_before in Receipts:", err.message);
                        return res.status(500).json({ error: "Failed to update reminder_days_before in receipt" });
                    }
                    res.status(201).json({ message: 'Receipt and reminder added successfully' });
                });
            });
        } else {
            res.status(201).json({ message: 'Receipt added successfully without reminder' });
        }
    });
});

// עדכון קבלה קיימת כולל אפשרות לשנות תמונה ותזכורת
app.put('/api/receipts/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore } = req.body;
    const imagePath = req.file ? req.file.path : null;

    connection.query('SELECT * FROM Receipts WHERE receipt_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Receipt not found' });

        // הכנה של שאילתת העדכון בהתאם לתנאי של reminderDaysBefore
        const sql = imagePath
            ? (reminderDaysBefore ? 
                'UPDATE Receipts SET user_id = ?, category_id = ?, store_name = ?, purchase_date = ?, product_name = ?, warranty_expiration = ?, image_path = ?, reminder_days_before = ? WHERE receipt_id = ?' 
                : 
                'UPDATE Receipts SET user_id = ?, category_id = ?, store_name = ?, purchase_date = ?, product_name = ?, warranty_expiration = ?, image_path = ? WHERE receipt_id = ?')
            : (reminderDaysBefore ? 
                'UPDATE Receipts SET user_id = ?, category_id = ?, store_name = ?, purchase_date = ?, product_name = ?, warranty_expiration = ?, reminder_days_before = ? WHERE receipt_id = ?'
                : 
                'UPDATE Receipts SET user_id = ?, category_id = ?, store_name = ?, purchase_date = ?, product_name = ?, warranty_expiration = ? WHERE receipt_id = ?');

        // יצירת המערך עם הפרמטרים בהתאם לתנאי של reminderDaysBefore
        const params = imagePath
            ? (reminderDaysBefore ? 
                [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, imagePath, reminderDaysBefore, id] 
                : 
                [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, imagePath, id])
            : (reminderDaysBefore ? 
                [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore, id]
                : 
                [userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, id]);

        connection.query(sql, params, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Receipt updated successfully' });
        });
    });
});


// מחיקת התזכורת מבלי למחוק את הקבלה
app.put('/api/receipts/:id/reminder', (req, res) => {
    const { id } = req.params;

    // מחיקת התזכורת מטבלת Reminders
    const deleteReminderSql = 'DELETE FROM Reminders WHERE receipt_id = ?';
    connection.query(deleteReminderSql, [id], (err) => {
        if (err) {
            console.error("Error deleting reminder from Reminders:", err);
            return res.status(500).json({ error: err.message });
        }

        // עדכון השדה reminder_days_before בטבלת Receipts ל-NULL
        const updateReceiptSql = 'UPDATE Receipts SET reminder_days_before = NULL WHERE receipt_id = ?';
        connection.query(updateReceiptSql, [id], (err) => {
            if (err) {
                console.error("Error updating reminder_days_before in Receipts:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Reminder deleted successfully' });
        });
    });
});


app.delete('/api/receipts/:id', (req, res) => {
    const { id } = req.params;

    const deleteRemindersSql = 'DELETE FROM Reminders WHERE receipt_id = ?';
    connection.query(deleteRemindersSql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting reminders for receipt:", err);
            return res.status(500).json({ error: err.message });
        }
        
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

// פונקציות ניהול זבל

// העברת קבלה לזבל
app.put('/api/receipts/:id/trash', (req, res) => {
    const { id } = req.params;

    // עדכון `is_deleted` ל-1 ושמירת תאריך ושעה נוכחיים ב-`deleted_at`
    const sql = 'UPDATE Receipts SET is_deleted = 1, deleted_at = NOW() WHERE receipt_id = ?';
    connection.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to move receipt to trash' });
        res.json({ message: 'Receipt moved to trash' });
    });
});


// שחזור קבלה מהזבל
app.put('/api/receipts/restore/:id', (req, res) => {
    const { id } = req.params;

    // עדכון השדה is_deleted ל-0 ומאפסת את deleted_at בלבד, ללא איפוס תאריך רכישה
    const sql = 'UPDATE Receipts SET is_deleted = 0, deleted_at = NULL WHERE receipt_id = ?';

    connection.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: 'שחזור הקבלה נכשל' });
        res.json({ message: 'הקבלה שוחזרה בהצלחה' });
    });
});

// פונקציה למחיקת תמונה מפיירבייס
const deleteImageFromFirebase = async (imagePath) => {
    try {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
        console.log(`Image at ${imagePath} deleted successfully from Firebase`);
    } catch (error) {
        console.error("Error deleting image from Firebase:", error);
    }
};

// מחיקת קבלה לצמיתות מהזבל
app.delete('/api/trash/:id', (req, res) => {
    const { id } = req.params;

    // שליפת נתיב התמונה של הקבלה
    const getImagePathSql = 'SELECT image_path FROM Receipts WHERE receipt_id = ?';
    connection.query(getImagePathSql, [id], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch receipt image path' });

        if (results.length === 0) return res.status(404).json({ error: 'Receipt not found' });

        const imagePath = results[0].image_path;

        // מחיקת התמונה מפיירבייס אם קיים imagePath
        if (imagePath) {
            await deleteImageFromFirebase(imagePath);
        }

        // מחיקת הקבלה ממסד הנתונים
        const deleteReceiptSql = 'DELETE FROM Receipts WHERE receipt_id = ?';
        connection.query(deleteReceiptSql, [id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to permanently delete receipt' });
            res.json({ message: 'Receipt and related image deleted successfully' });
        });
    });
});


// שליפת כל הקבלות שבזבל
app.get('/api/trash', (req, res) => {
    const sql = 'SELECT * FROM Receipts WHERE is_deleted = 1';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch trash receipts' });
        res.json(results);
    });
});

// קרון ג'וב למחיקת קבלות מהזבל לאחר 30 ימים
cron.schedule('0 0 * * *', () => {
    console.log("Running cron job to delete old trash receipts");

    const daysInTrash = 30; // מספר הימים לשמירת קבלה בזבל
    const sql = `DELETE FROM Receipts WHERE is_deleted = 1 AND deleted_at < NOW() - INTERVAL ? DAY`;

    connection.query(sql, [daysInTrash], (err, results) => {
        if (err) {
            console.error("Error deleting old receipts from trash:", err);
        } else {
            console.log(`Deleted ${results.affectedRows} old receipts from trash`);
        }
    });
});




// קרון ג'וב לתזכורות יומיות (שליחת התראות על סיום אחריות קרוב)
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
                        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
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
