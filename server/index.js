import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import connection from './db/connection.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import cron from 'node-cron';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig.js';
import path from 'path';
import dotenv from 'dotenv';
import middlewareToken from './middlewareToken.js';
import { jwtDecode } from 'jwt-decode';

dotenv.config();

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
  
// מסלול להעלאת תמונה בלבד לפיירבייס
app.post('/api/upload-image',middlewareToken.verifyToken, upload.single('image'), async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(403).json({ error: 'User not authorized' });
    }

    try {
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToFirebase(req.file); // העלאת התמונה לפיירבייס
        } else {
            return res.status(400).json({ error: "No image file provided" });
        }

        res.status(200).json({ message: "Image uploaded successfully", imageUrl });
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
        from: "Sh6744998@gmail.com",
        to: "Sh6744998@gmail.com",
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
app.get('/api/categories', middlewareToken.verifyToken, (req, res) => {
    // ניתן להוסיף בדיקה להרשאות אם נדרש
    if (req.role !== 'admin' && req.role !== 'user') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const sql = 'SELECT * FROM Categories';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
        res.json(results);  
    });
});

app.get('/api/reminders', middlewareToken.verifyToken, (req, res) => {
    const userId = req.user.userId; // קבלת מזהה המשתמש מהמיידלוור

    if (!userId) {
        return res.status(403).json({ error: 'User not authorized' });
    }

    // שליפת התזכורות של המשתמש מהדאטה בייס
    const sql = `
        SELECT r.reminder_id, r.receipt_id, r.reminder_days_before, r.reminder_date, re.store_name, re.product_name
        FROM Reminders r
        JOIN Receipts re ON r.receipt_id = re.receipt_id
        WHERE r.user_id = ?
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching reminders:", err);
            return res.status(500).json({ error: 'Failed to fetch reminders' });
        }

        res.json(results); // מחזיר את רשימת התזכורות בפורמט JSON
    });
});

// שליפת כל הקבלות מהדאטה בייס
app.get('/api/receipts', middlewareToken.verifyToken, (req, res) => {
    const userId = req.userId; // קבלת userId מהמידלוור

    // וידוא ש-userId קיים
    if (!userId) {
        return res.status(403).json({ error: 'User not authorized' });
    }

    // שליפת פרמטרים מה-query
    const { categoryId, storeName, productName, startDate, endDate, sortField, sortOrder } = req.query;

    // בסיס השאילתה
    let sql = 'SELECT * FROM Receipts WHERE user_id = ? AND is_deleted = 0';
    const params = [userId];

    // הוספת פילטרים בהתאם לפרמטרים
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
        const validSortFields = ['category_id', 'store_name', 'product_name', 'purchase_date', 'price']; // שדות מיון תקינים
        if (!validSortFields.includes(sortField)) {
            return res.status(400).json({ error: 'Invalid sort field' });
        }

        const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        sql += ` ORDER BY ${sortField} ${order}`;
    }

    // ביצוע השאילתה
    connection.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching receipts:', err);
            return res.status(500).json({ error: 'Failed to fetch receipts' });
        }
        res.json(results);
    });
});

app.post('/api/reminders', middlewareToken.verifyToken, (req, res) => {
    const { receiptId, reminderDaysBefore } = req.body;

    // בדיקה אם כל הנתונים הנדרשים לתזכורת סופקו
    if (!receiptId || isNaN(reminderDaysBefore)) {
        return res.status(400).json({
            error: "'receiptId' must be valid and 'reminderDaysBefore' must be a number."
        });
    }

    const userId = req.user.userId; // קבלת מזהה המשתמש מה-middleware

    // בדיקה אם הקבלה קיימת ושייכת למשתמש
    const warrantySql = `
        SELECT warranty_expiration 
        FROM Receipts 
        WHERE receipt_id = ? AND user_id = ?
    `;
    connection.query(warrantySql, [receiptId, userId], (err, receiptResults) => {
        if (err) {
            console.error("Error fetching receipt data:", err.message);
            return res.status(500).json({ error: 'Failed to fetch receipt data' });
        }

        if (receiptResults.length === 0) {
            return res.status(404).json({ error: 'Receipt not found or does not belong to the user' });
        }

        // חישוב תאריך התזכורת
        const warrantyExpiration = new Date(receiptResults[0].warranty_expiration);
        const reminderDate = new Date(warrantyExpiration.getTime() - reminderDaysBefore * 24 * 60 * 60 * 1000);

        // בדיקה אם קיימת תזכורת
        const checkReminderSql = 'SELECT * FROM Reminders WHERE receipt_id = ?';
        connection.query(checkReminderSql, [receiptId], (err, results) => {
            if (err) {
                console.error("Error checking reminder:", err.message);
                return res.status(500).json({ error: 'Failed to check reminder' });
            }

            if (results.length > 0) {
                // עדכון תזכורת קיימת
                const updateReminderSql = `
                    UPDATE Reminders 
                    SET reminder_days_before = ?, reminder_date = ? 
                    WHERE receipt_id = ?
                `;
                connection.query(updateReminderSql, [reminderDaysBefore, reminderDate, receiptId], (err) => {
                    if (err) {
                        console.error("Error updating reminder:", err.message);
                        return res.status(500).json({ error: 'Failed to update reminder' });
                    }

                    res.status(200).json({ message: 'Reminder updated successfully' });
                });
            } else {
                // הוספת תזכורת חדשה
                const insertReminderSql = `
                    INSERT INTO Reminders (user_id, receipt_id, reminder_days_before, reminder_date) 
                    VALUES (?, ?, ?, ?)
                `;
                connection.query(insertReminderSql, [userId, receiptId, reminderDaysBefore, reminderDate], (err) => {
                    if (err) {
                        console.error("Error adding reminder:", err.message);
                        return res.status(500).json({ error: 'Failed to add reminder' });
                    }

                    res.status(201).json({ message: 'Reminder added successfully' });
                });
            }
        });
    });
});

// הוספת קבלה חדשה   
app.post('/api/receipts', middlewareToken.verifyToken, upload.single('image'), async (req, res) => {
    console.log("Incoming request to /api/receipts");
    
    try {
        // שליפת הטוקן מהכותרת Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error("Authorization header is missing");
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const token = authHeader.split(' ')[1];
        console.log("Token received:", token);

        // פענוח הטוקן עם jwtDecode
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);

        const userId = decodedToken.user_id; // מזהה המשתמש מתוך הטוקן
        if (!userId) {
            console.error("User ID not found in token");
            return res.status(403).json({ error: "User ID not found in token" });
        }
        console.log("User ID:", userId);

        // שליפת הנתונים מהבקשה
        const { storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore, price, receiptNumber } = req.body;
        const categoryId = parseInt(req.body.categoryId, 10) || null;

        console.log("Request body:", req.body);

        // בדיקת שדות חובה: רק storeName ו-productName
        if (!storeName || !productName) {
            console.error("Missing required fields: storeName or productName");
            return res.status(400).json({ error: "Both 'storeName' and 'productName' are required fields." });
        }

        // העלאת תמונה לפיירבייס אם יש תמונה
        let imagePath = null;
        if (req.file) {
            console.log("File received:", req.file);
            try {
                imagePath = await uploadImageToFirebase(req.file);
                console.log("Image uploaded successfully:", imagePath);
            } catch (uploadError) {
                console.error("Error uploading image to Firebase:", uploadError.message);
                return res.status(500).json({ error: "Failed to upload image" });
            }
        } else {
            console.log("No file received with the request");
        }

        // הוספת הקבלה ל-DB
        const sql = `
            INSERT INTO Receipts (user_id, category_id, store_name, purchase_date, product_name, warranty_expiration, image_path, price, receipt_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            userId,
            categoryId || null,
            storeName,
            purchaseDate || null,
            productName,
            warrantyExpiration || null,
            imagePath || null,
            price || null,
            receiptNumber || null
        ];
        console.log("SQL Query:", sql);
        console.log("SQL Parameters:", params);

        connection.query(sql, params, (err, result) => {
            if (err) {
                console.error("Error adding receipt to database:", err.message);
                return res.status(500).json({ error: err.message });
            }

            const receiptId = result.insertId;
            console.log("Receipt added successfully with ID:", receiptId);

            // הוספת תזכורת אם נדרש
            if (reminderDaysBefore && reminderDaysBefore.trim() !== '') {
                const daysBefore = parseInt(reminderDaysBefore, 10);
                if (isNaN(daysBefore)) {
                    console.error("Invalid reminderDaysBefore value:", reminderDaysBefore);
                    return res.status(400).json({ error: "Invalid reminderDaysBefore value" });
                }

                const reminderDate = new Date(new Date(warrantyExpiration).getTime() - daysBefore * 24 * 60 * 60 * 1000);
                console.log("Reminder date calculated:", reminderDate);

                const reminderSql = `
                    INSERT INTO Reminders (user_id, receipt_id, reminder_days_before, reminder_date)
                    VALUES (?, ?, ?, ?)
                `;
                const reminderParams = [userId, receiptId, daysBefore, reminderDate];
                console.log("Reminder SQL Query:", reminderSql);
                console.log("Reminder SQL Parameters:", reminderParams);

                connection.query(reminderSql, reminderParams, (err) => {
                    if (err) {
                        console.error("Error adding reminder to database:", err.message);
                        return res.status(500).json({ error: "Failed to add reminder" });
                    }

                    console.log("Reminder added successfully for receipt ID:", receiptId);

                    // עדכון טבלת הקבלות עם reminder_days_before
                    const updateReceiptSql = `
                        UPDATE Receipts SET reminder_days_before = ? WHERE receipt_id = ?
                    `;
                    connection.query(updateReceiptSql, [daysBefore, receiptId], (err) => {
                        if (err) {
                            console.error("Error updating reminder_days_before in Receipts:", err.message);
                            return res.status(500).json({ error: "Failed to update reminder_days_before in receipt" });
                        }
                        console.log("Receipt and reminder updated successfully");
                        res.status(201).json({ message: 'Receipt and reminder added successfully' });
                    });
                });
            } else {
                console.log("No reminder requested. Receipt added successfully without reminder.");
                res.status(201).json({ message: 'Receipt added successfully without reminder' });
            }
        });
    } catch (error) {
        console.error("Error processing receipt:", error.message || error);
        res.status(500).json({ error: "Failed to process receipt" });
    }
});

// הוספת תזכורת לקבלה קיימת
app.post('/api/receipts/:id/reminder', middlewareToken.verifyToken, (req, res) => {
    const { id } = req.params; // מזהה הקבלה
    const { reminderDaysBefore } = req.body;
    const userId = req.userId; // מזהה המשתמש

    if (!reminderDaysBefore || isNaN(reminderDaysBefore)) {
        return res.status(400).json({
            error: "'reminderDaysBefore' must be a valid number.",
        });
    }

    // בדיקת הקבלה שייכת למשתמש
    const checkReceiptSql = `
        SELECT warranty_expiration FROM Receipts WHERE receipt_id = ? AND user_id = ?
    `;
    connection.query(checkReceiptSql, [id, userId], (err, results) => {
        if (err) {
            console.error("Error fetching receipt:", err.message);
            return res.status(500).json({ error: 'Failed to fetch receipt' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Receipt not found or does not belong to the user' });
        }

        const warrantyExpiration = new Date(results[0].warranty_expiration);
        const reminderDate = new Date(
            warrantyExpiration.getTime() - reminderDaysBefore * 24 * 60 * 60 * 1000
        );

        // הוספה או עדכון של התזכורת
        const upsertReminderSql = `
            INSERT INTO Reminders (user_id, receipt_id, reminder_days_before, reminder_date)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                reminder_days_before = VALUES(reminder_days_before),
                reminder_date = VALUES(reminder_date)
        `;
        connection.query(upsertReminderSql, [userId, id, reminderDaysBefore, reminderDate], (err) => {
            if (err) {
                console.error("Error adding/updating reminder:", err.message);
                return res.status(500).json({ error: 'Failed to add/update reminder' });
            }

            // עדכון טבלת הקבלות
            const updateReceiptSql = `
                UPDATE Receipts SET reminder_days_before = ? WHERE receipt_id = ?
            `;
            connection.query(updateReceiptSql, [reminderDaysBefore, id], (err) => {
                if (err) {
                    console.error("Error updating receipt:", err.message);
                    return res.status(500).json({ error: 'Failed to update receipt' });
                }

                res.status(200).json({ message: 'Reminder added/updated and receipt updated successfully' });
            });
        });
    });
});

app.put('/api/receipts/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { userId, categoryId, storeName, purchaseDate, productName, warrantyExpiration, reminderDaysBefore, price, receiptNumber } = req.body;

    try {
        let newImagePath = null;

        // העלאת תמונה חדשה לפיירבייס אם קיים קובץ
        if (req.file) {
            newImagePath = await uploadImageToFirebase(req.file);

            // מחיקת תמונה ישנה מפיירבייס
            const getImagePathSql = 'SELECT image_path FROM Receipts WHERE receipt_id = ?';
            connection.query(getImagePathSql, [id], async (err, results) => {
                if (err) {
                    console.error("Error fetching current image path:", err);
                    return res.status(500).json({ error: "Failed to fetch current image path" });
                }

                if (results.length > 0 && results[0].image_path) {
                    try {
                        await deleteImageFromFirebase(results[0].image_path);
                        console.log("Old image deleted from Firebase");
                    } catch (error) {
                        console.error("Error deleting old image from Firebase:", error);
                    }
                }
            });
        }

        // עדכון הקבלה בטבלת Receipts
        const sql = `
            UPDATE Receipts 
            SET user_id = ?, category_id = ?, store_name = ?, purchase_date = ?, product_name = ?, price = ?, receipt_number = ?, warranty_expiration = ?, image_path = ?, reminder_days_before = ? 
            WHERE receipt_id = ?
        `;
        const params = [
            userId,
            categoryId || null,
            storeName,
            purchaseDate || null,
            productName,
            price || null,
            receiptNumber || null,
            warrantyExpiration || null,
            newImagePath || null,
            reminderDaysBefore || null,
            id
        ];

        connection.query(sql, params, (err) => {
            if (err) {
                console.error("Error updating receipt:", err);
                return res.status(500).json({ error: "Failed to update receipt" });
            }

            // אם התזכורת מעודכנת, לעדכן גם בטבלת Reminders
            if (reminderDaysBefore) {
                const daysBefore = parseInt(reminderDaysBefore, 10);
                const reminderDate = new Date(new Date(warrantyExpiration).getTime() - daysBefore * 24 * 60 * 60 * 1000);

                const updateReminderSql = `
                    INSERT INTO Reminders (user_id, receipt_id, reminder_days_before, reminder_date)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        reminder_days_before = VALUES(reminder_days_before),
                        reminder_date = VALUES(reminder_date)
                `;
                const reminderParams = [userId, id, daysBefore, reminderDate];

                connection.query(updateReminderSql, reminderParams, (err) => {
                    if (err) {
                        console.error("Error updating reminder in Reminders:", err);
                        return res.status(500).json({ error: "Failed to update reminder in Reminders" });
                    }
                    res.json({ message: 'Receipt and reminder updated successfully' });
                });
            } else {
                res.json({ message: 'Receipt updated successfully without reminder changes' });
            }
        });
    } catch (error) {
        console.error("Error updating receipt:", error);
        res.status(500).json({ error: "Failed to update receipt" });
    }
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

// נתיב לעדכון תזכורת בקבלה
app.put('/api/receipts/:id/reminder', middlewareToken.verifyToken, (req, res) => {
    const { id } = req.params; // מזהה הקבלה
    const { reminder_days_before } = req.body; // מספר הימים לתזכורת

    // בדיקה אם השדה קיים
    if (!reminder_days_before) {
        return res.status(400).json({ error: 'Reminder days before is required' });
    }

    // בדיקה אם המשתמש הוא 'user' בלבד (מנהל אינו מורשה)
    if (req.user.role !== 'user') {
        return res.status(403).json({ error: 'Unauthorized action' });
    }

    // עדכון השדה `reminder_days_before` בטבלת `Receipts`
    const updateReceiptSql = `
        UPDATE Receipts 
        SET reminder_days_before = ? 
        WHERE receipt_id = ? AND user_id = ?
    `;

    connection.query(updateReceiptSql, [reminder_days_before, id, req.user.userId], (err, result) => {
        if (err) {
            console.error("Error updating reminder_days_before in Receipts:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // אם לא נמצאו רשומות מתאימות
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Receipt not found or not authorized' });
        }

        // בדיקה אם קיימת תזכורת בטבלת `Reminders`
        const checkReminderSql = 'SELECT * FROM Reminders WHERE receipt_id = ?';
        connection.query(checkReminderSql, [id], (err, reminders) => {
            if (err) {
                console.error("Error checking reminders in Reminders:", err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (reminders.length > 0) {
                // עדכון תזכורת קיימת בטבלת `Reminders`
                const updateReminderSql = `
                    UPDATE Reminders 
                    SET reminder_date = DATE_SUB(warranty_expiration, INTERVAL ? DAY)
                    WHERE receipt_id = ?
                `;

                connection.query(updateReminderSql, [reminder_days_before, id], (err) => {
                    if (err) {
                        console.error("Error updating reminder in Reminders:", err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    res.json({ message: 'Reminder updated successfully' });
                });
            } else {
                // הוספת תזכורת חדשה לטבלת `Reminders`
                const insertReminderSql = `
                    INSERT INTO Reminders (receipt_id, reminder_date)
                    SELECT ?, DATE_SUB(warranty_expiration, INTERVAL ? DAY) 
                    FROM Receipts WHERE receipt_id = ? AND user_id = ?
                `;

                connection.query(insertReminderSql, [id, reminder_days_before, id, req.user.userId], (err) => {
                    if (err) {
                        console.error("Error inserting reminder in Reminders:", err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    res.json({ message: 'Reminder added successfully' });
                });
            }
        });
    });
});

// העברת קבלה לזבל
app.put('/api/receipts/:id/trash', middlewareToken.verifyToken, (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // מזהה המשתמש מתוך המידלוור

    // עדכון `is_deleted` ל-1 ושמירת תאריך ושעה נוכחיים ב-`deleted_at`, רק אם הקבלה שייכת למשתמש
    const sql = 'UPDATE Receipts SET is_deleted = 1, deleted_at = NOW() WHERE receipt_id = ? AND user_id = ?';
    connection.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error('Failed to move receipt to trash:', err);
            return res.status(500).json({ error: 'Failed to move receipt to trash' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Receipt not found or does not belong to the user' });
        }

        res.json({ message: 'Receipt moved to trash successfully' });
    });
});

// שחזור קבלה מהזבל
app.put('/api/receipts/restore/:id', middlewareToken.verifyToken, (req, res) => {
    const { id } = req.params;

    // אימות גיבוי לפענוח הטוקן
    let userId = req.userId;
    if (!userId) {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwtDecode(token);
        userId = decodedToken.user_id;
    }

    // בדיקת שחזור הקבלה
    const sql = 'UPDATE Receipts SET is_deleted = 0, deleted_at = NULL WHERE receipt_id = ? AND user_id = ?';
    connection.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error('שגיאה בשחזור הקבלה:', err);
            return res.status(500).json({ error: 'שחזור הקבלה נכשל' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'הקבלה לא נמצאה או אינה שייכת למשתמש' });
        }

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
app.delete('/api/trash/:id', middlewareToken.verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // מזהה המשתמש מתוך המידלוור

    // שליפת נתיב התמונה של הקבלה, ווידוא שהיא שייכת למשתמש
    const getImagePathSql = 'SELECT image_path FROM Receipts WHERE receipt_id = ? AND user_id = ?';
    connection.query(getImagePathSql, [id, userId], async (err, results) => {
        if (err) {
            console.error("Error fetching receipt image path:", err.message);
            return res.status(500).json({ error: 'Failed to fetch receipt image path' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Receipt not found or user not authorized' });
        }

        const imagePath = results[0].image_path;

        try {
            // מחיקת התמונה מפיירבייס אם יש imagePath
            if (imagePath) {
                await deleteImageFromFirebase(imagePath);
            }

            // מחיקת הקבלה ממסד הנתונים
            const deleteReceiptSql = 'DELETE FROM Receipts WHERE receipt_id = ? AND user_id = ?';
            connection.query(deleteReceiptSql, [id, userId], (err) => {
                if (err) {
                    console.error("Error deleting receipt:", err.message);
                    return res.status(500).json({ error: 'Failed to permanently delete receipt' });
                }
                res.json({ message: 'Receipt and related image deleted successfully' });
            });
        } catch (error) {
            console.error("Error deleting image from Firebase:", error.message);
            res.status(500).json({ error: 'Failed to delete image from Firebase' });
        }
    });
});

// שליפת כל הקבלות שבזבל
app.get('/api/trash', middlewareToken.verifyToken, (req, res) => {
    const userId = req.userId; // מזהה המשתמש שהופק על ידי המידלוור
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const sql = 'SELECT * FROM Receipts WHERE is_deleted = 1 AND user_id = ?';
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching trash receipts:", err);
            return res.status(500).json({ error: 'Failed to fetch trash receipts' });
        }
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
