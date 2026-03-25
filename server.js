require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const formRoutes = require("./routes/formPage");

const server = express();
const hostname = "127.0.0.1";
const port = 8000;

// View engine
server.set("view engine", "ejs");

// Middleware
server.use("/", express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));
server.use(express.json()); // important for AJAX requests

server.use(session({
  secret: "mypetappsecret",
  resave: false,
  saveUninitialized: false
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
server.use("/", authRoutes);
server.use("/", formRoutes);
server.use("/home-display", homeRoutes);
// Start server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});