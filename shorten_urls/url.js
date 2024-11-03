const express = require("express");
const crypto = require("crypto");
const db = require("../db/connection");
const authenticate = require("../middleware/authenticate");

const router = express.Router();


//Fetch all the records
router.get("/", authenticate, (req, res) => {

    console.log(req.user);

    const fetchAllQuery = "SELECT * FROM urls WHERE userEmail = ?";
    db.query(fetchAllQuery, req.user.email, (err, results) => {
        if (err) {
            console.error("Error fetching URLs:", err);
            return res.status(500).json({ message: err.sqlMessage });
        }
        res.status(201).json(results);

    });
});

//Create short url
router.post("/shorten", authenticate, (req, res) => {

    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ message: "URL is required" });
    }

    const shortCode = crypto.randomBytes(4).toString("hex");
    const userEmail = req.user.email;

    const insertQuery = "INSERT INTO urls (userEmail, originalUrl, shortCode, visits, createdAt) VALUES (?, ?, ?, ?, Now())";
    const values = [userEmail, originalUrl, shortCode, 0];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error("Error inserting URL:", err);
            return res.status(500).json({ message: err.sqlMessage });
        }

        const shortUrl = `${req.protocol}://${req.get("host")}/url/${shortCode}`;
        res.status(201).json({ shortUrl });
    });
});


// Visit short URL
router.get("/:shortCode", (req, res) => {
    const { shortCode } = req.params;
    const query = "SELECT originalUrl, status FROM urls WHERE shortCode = ?"; // Include status in the query

    db.query(query, [shortCode], (err, result) => {
        if (err) {
            console.error("Error retrieving URL:", err);
            return res.status(500).json({ message: err.sqlMessage });
        }

        // Check if the result is an empty array
        if (result.length === 0) {
            return res.status(404).json({ message: "URL not found" });
        }

        const originalUrl = result[0].originalUrl;
        const status = result[0].status;

        // Check the status of the URL
        if (status === 0) {
            return res.status(403).json({ message: "Link is inactive" }); // Changed to 403 Forbidden
        } else {
            // Update visit count
            const updateVisit = "UPDATE urls SET visits = visits + 1 WHERE shortCode = ?";
            db.query(updateVisit, [shortCode], (err) => {
                if (err) {
                    console.error("Error updating visits count:", err);
                    return res.status(500).json({ message: err.sqlMessage });
                }


                // Redirect after updating the visits
                res.redirect(originalUrl);
            });
        }
    });
});



// Update status endpoint
router.put("/:shortCode/status", (req, res) => {
    const { shortCode } = req.params;
    const { status } = req.body;

    // SQL query to update the status
    const updateStatus = "UPDATE urls SET status = ? WHERE shortCode = ?";

    db.query(updateStatus, [status, shortCode], (err, result) => {
        if (err) {
            console.error("Error updating status:", err);
            return res.status(500).json({ message: err.sqlMessage || "Database update failed" });
        }

        res.status(200).json({ message: "Status updated successfully" });
    });
});

router.delete('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const deleteUrl = "DELETE FROM urls WHERE shortCode = ?";

    db.query(deleteUrl, [shortCode], (err, result) => {
        if (err) {
            console.error("Error deleting URL:", err);
            return res.status(500).json({
                message: err.sqlMessage || "Database deletion failed"
            });
        }
        // Optional: Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "URL not found" });
        }
        res.status(200).json({ message: "URL deleted successfully" });
    });
});





module.exports = router;