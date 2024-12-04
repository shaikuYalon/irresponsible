import express from "express";
import connection from "./db/connection.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// פונקציה כללית לניהול שגיאות
const handleError = (res, message, error = null, statusCode = 500) => {
    if (error) console.error(message, error.message);
    res.status(statusCode).json({ success: false, error: message });
};

// מסלול: שליפת משתמשים
app.get("/api/admin/users", (req, res) => {
    const sql = `
        SELECT user_id, first_name, last_name, username, email, created_at 
        FROM users
        WHERE role != 'admin'
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            return handleError(res, "Failed to fetch users", err);
        }
        res.json({ success: true, users: results });
    });
});

// מסלול: מידע על קניות של משתמש
app.get('/api/admin/user-purchases', (req, res) => {
    const { user_id, year, start_date, end_date } = req.query;

    if (!user_id) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    let query = `
        SELECT 
            r.store_name,
            r.purchase_date,
            r.product_name,
            r.warranty_expiration,
            r.price,
            r.receipt_number,
            c.category_name,  
            r.created_at,
            r.is_deleted,
            r.image_path
        FROM receipts r
        LEFT JOIN categories c ON r.category_id = c.category_id
        WHERE r.user_id = ?
    `;
    const params = [user_id];

    if (year) {
        if (isNaN(year)) {
            return res.status(400).json({ success: false, error: "Year must be a valid number" });
        }
        query += ' AND YEAR(r.purchase_date) = ?';
        params.push(year);
    }

    if (start_date && end_date) {
        if (isNaN(Date.parse(start_date)) || isNaN(Date.parse(end_date))) {
            return res.status(400).json({ success: false, error: "Invalid date format" });
        }
        query += ' AND r.purchase_date BETWEEN ? AND ?';
        params.push(start_date, end_date);
    }

    query += ' ORDER BY r.purchase_date DESC';

    connection.query(query, params, (err, results) => {
        if (err) {
            return handleError(res, "Failed to fetch user purchases", err);
        }
        res.json({ success: true, purchases: results });
    });
});

// מסלול: ניתוח הוצאות לפי חודשים
app.get('/api/admin/purchase-analysis/monthly', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const query = `
        SELECT 
            MONTH(purchase_date) AS month, 
            SUM(price) AS total_spent, 
            COUNT(*) AS total_receipts
        FROM receipts
        WHERE user_id = ?
        GROUP BY MONTH(purchase_date)
        ORDER BY month;
    `;

    connection.query(query, [user_id], (err, results) => {
        if (err) {
            return handleError(res, "Failed to fetch monthly analysis", err);
        }
        res.json({ success: true, monthlyData: results });
    });
});

// מסלול: ניתוח הוצאות לפי שנים
app.get('/api/admin/purchase-analysis/yearly', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const query = `
        SELECT 
            YEAR(purchase_date) AS year, 
            SUM(price) AS total_spent, 
            COUNT(*) AS total_receipts
        FROM receipts
        WHERE user_id = ?
        GROUP BY YEAR(purchase_date)
        ORDER BY year;
    `;

    connection.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Error fetching yearly analysis:", err);
            return res.status(500).json({ success: false, error: "Failed to fetch yearly analysis" });
        }
        res.json({ success: true, yearlyData: results });
    });
});


// מסלול: פילוח מחירים לפי קטגוריות
app.get('/api/admin/purchase-analysis/category', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const query = `
        SELECT 
            (SELECT category_name 
             FROM categories 
             WHERE categories.category_id = receipts.category_id) AS category_name,
            COUNT(receipts.receipt_id) AS total_purchases,
            SUM(receipts.price) AS total_spent
        FROM receipts
        WHERE receipts.user_id = ?
        GROUP BY receipts.category_id
        ORDER BY total_spent DESC;
    `;

    connection.query(query, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Failed to fetch category analysis" });
        }
        res.json({ success: true, categories: results });
    });
});


// מסלול: דירוג חנויות מובילות
app.get('/api/admin/purchase-analysis/topStores', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const query = `
        SELECT 
            store_name, 
            COUNT(receipt_id) AS total_purchases, 
            SUM(price) AS total_spent,
            AVG(price) AS avg_price_per_receipt
        FROM receipts
        WHERE user_id = ?
        GROUP BY store_name
        ORDER BY total_spent DESC;
    `;

    connection.query(query, [user_id], (err, results) => {
        if (err) {
            return handleError(res, "Failed to fetch top store rankings", err);
        }
        res.json({ success: true, topStores: results });
    });
});

// הפעלת השרת
app.listen(5001, () => {
    console.log("Admin server running on port 5001");
});
