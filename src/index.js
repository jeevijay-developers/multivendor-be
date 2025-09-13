"use strict";
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const recachegoose = require("recachegoose");
const routes = require("./routes/routeLoader");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(routes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Setup recachegoose
    recachegoose(mongoose, {
      engine: "memory",
      ttl: 60,
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
// GET API
app.get("/", (req, res) => {
  res.send("This is a GET API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
