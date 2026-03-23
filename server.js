// Main area to facilitate the Pets platform
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const home = require("./routes/homePage");

const server = express();
const hostname = "127.0.0.1";
const port = 8000;

server.set("view engine", "ejs");

server.use("/", express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

server.use("/", authRoutes);
server.use("/home-display", home);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
