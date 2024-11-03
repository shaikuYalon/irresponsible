import connection from "./db/connection.js";

const sqlScript = `
CREATE DATABASE IF NOT EXISTS warranty_management;
USE warranty_management;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Receipts (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    store_name VARCHAR(100),
    purchase_date DATE,
    product_name VARCHAR(100),
    warranty_expiration DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    receipt_id INT,
    reminder_date DATE NOT NULL,
    message TEXT,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receipt_id) REFERENCES Receipts(receipt_id) ON DELETE CASCADE
);
`;

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');

    connection.query(sqlScript, (error, results) => {
        if (error) throw error;
        console.log('Database and tables created successfully');
        connection.end();
    });
});
