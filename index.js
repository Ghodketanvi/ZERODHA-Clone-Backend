require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const User = require("./model/User"); // your mongoose User model

const uri = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB connection
mongoose.connect(uri)
  .then(() => console.log("DB connected!"))
  .catch((err) => console.error("DB connection error:", err));

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// JWT Signup/Login routes using User model and hashing (as in previous message)

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

// Your protected and other API routes

module.exports = app;
