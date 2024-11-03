require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // Adjust this based on your app's needs
    queueLimit: 0,
    connectTimeout: 10000,  // 10 seconds
    acquireTimeout: 10000,  // 10 seconds
});


// db.connect((err) => {
//     if (err) {
//         console.error("Error connecting to MySQL:", err.message);
//     } else {
//         console.log("Connected to MySQL database successfully.");
//     }
// });

module.exports = db;
