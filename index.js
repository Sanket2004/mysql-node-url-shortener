require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require("./db/connection");
const authRoutes = require("./auth/auth");
const urlRoutes = require("./shorten_urls/url");


const app = express();
app.use(express.json());

// Enable CORS
app.use(cors());

// Or specify allowed origins:
app.use(cors({ origin: 'http://localhost:5173' }));

//Root endpoint
app.get('/', (req, res) => {
    res.json("This is the backend.");
});

app.use("/auth", authRoutes); //All auth endpoints

app.use("/url", urlRoutes); // All URL shortening endpoints




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend is running on port ${PORT}`);
});
