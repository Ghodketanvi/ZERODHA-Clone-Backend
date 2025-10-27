require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Replace these with your actual model paths
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

// Simple User model for auth (needs to exist in ./model/User.js)
const User = require("./model/User"); 

const uri = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB once at server start
mongoose.connect(uri)
  .then(() => console.log("DB connected!"))
  .catch((err) => console.error("DB connection error:", err));

// Home route for Vercel check
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// --- All Holdings Route ---
app.get("/allHoldings", async (req, res) => {
  try {
    const allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- All Positions Route ---
app.get("/allPositions", async (req, res) => {
  try {
    const allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Signup Route ---
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    res.json({ message: "User registered!" });
  } catch (err) {
    res.status(400).json({ error: "User already exists!" });
  }
});

// --- Login Route ---
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    // Create and send JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- JWT Middleware Example ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- Protected Route Example ---
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.username}! This is a protected route.` });
});

// ---- For Vercel: Export app, not app.listen! ----
module.exports = app;
