// Main area to facilitate the Pets platform
const express = require("express");
<<<<<<< Updated upstream
=======
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const formRoutes = require("./routes/formPage");
const appointmentRoutes = require("./routes/appointmentRoutes");

>>>>>>> Stashed changes
const server = express();
const path = require("path");

server.set("view engine", "ejs");

server.use("/", express.static(path.join(__dirname, "public")))
server.use(express.urlencoded({ extended: true }));

//Start of Express Router Code

const home = require("./routes/homePage");

server.use("/home-display", home);


//End of Express Router Code

const hostname = "127.0.0.1";
const port = 8000;

<<<<<<< Updated upstream
=======
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
server.use("/", appointmentRoutes);

// Start server
>>>>>>> Stashed changes
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});