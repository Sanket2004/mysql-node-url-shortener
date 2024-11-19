require("dotenv").config();
const mysql = require("mysql2");

// Create a connection pool
const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // Adjust this based on your app's needs
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000, // 10 seconds
});

// Test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to MySQL:", err.message);
    } else {
        console.log("Connected to MySQL database successfully.");
        connection.release(); // Release the connection back to the pool
    }
});

module.exports = db;
