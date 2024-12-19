import express from "express";
import connection from "./db/connection.js"; // ייבוא החיבור לבסיס הנתונים
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const tokenSecret = process.env.JWT_SECRET;

const router = express.Router(); // יצירת נתיב (router) לניהול בקשות API

// רישום משתמש
router.post("/register", (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  const hashPassword = bcryptjs.hashSync(password, 10); // הצפנת הסיסמה

  const sql = `INSERT INTO Users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)`;
  const values = [firstName, lastName, username, email, hashPassword];

  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: "User registered successfully",
      user: { user_id: results.insertId, username }, // החזרת user_id ו-username
    });
  });
});

// התחברות משתמש
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT user_id, username, role, password FROM Users WHERE username = ?`; // הוספת עמודת role
  const values = [username];

  connection.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      const hashedPassword = results[0].password;
      if (bcryptjs.compareSync(password, hashedPassword)) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
      delete results[0].password;
      const user = results[0];

      const token = jwt.sign(
        { user_id: user.user_id, username: user.username, role: user.role },
        tokenSecret,
        { expiresIn: "12h" }
      );

      res.json({ message: "Login successful", token }); // החזרת userId, username, ו-role
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });
});

export default router;
