const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authenticate = require("../middleware/authenticate");


const router = express.Router();
const db = require("../db/connection");


//login route
router.post("/login", (req, res) => {
    const { email, password } = req.body;


    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "All the fields are required" });
    }


    try {
        const userQuery = "SELECT * FROM users WHERE email = ?"
        db.query(userQuery, [email], async (err, result) => {

            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ message: err.sqlMessage });
            }

            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({ message: "Login successful", token });


        })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})


//register route
router.post("/register", (req, res) => {
    const { name, phone, purpose, email, password } = req.body;

    //Validation
    if (!name || !phone || !purpose || !email || !password) {
        return res.status(400).json({ message: "All the fields are required" });
    }



    try {

        //checking for existing user
        const existingUser = "SELECT * FROM users WHERE email = ? OR phone = ?";

        db.query(existingUser, [email, phone], async (err, result) => {

            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ message: err.sqlMessage });
            }


            if (result.length > 0) {
                return res.status(400).json({ message: "Email or Phone already exists" });
            }


            //hashing password
            const hashedPassword = await bcrypt.hash(password, 10);

            //inserting new record
            const query = "INSERT INTO users ( name, phone, purpose, email, password) VALUES (?, ?, ?, ?, ?)";
            const user = [name, phone, purpose, email, hashedPassword];


            db.query(query, user, (err, result) => {

                if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).json({ message: err.sqlMessage });
                }

                // Generate token after user is created
                const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: "1h" });

                res.status(201).json({ message: "User created successfully", token }); // Return the token
            });
        });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})

// New endpoint to fetch user details by email
router.get("/user/details", authenticate, (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const userQuery = "SELECT name, phone, purpose, email FROM users WHERE email = ?";
    db.query(userQuery, [email], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ message: err.sqlMessage });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user: result[0] });
    });
});


module.exports = router;