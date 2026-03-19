// Main area to facilitate the Pets platform
require("dotenv").config();
const express = require("express");
const server = express();
const path = require("path");
const mongoose = require("mongoose");
<<<<<<< Updated upstream
const authRoutes = require("./routes/authRoutes");
=======

//connect mongoose database
mongoose.connect("your_connection_string_here")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
>>>>>>> Stashed changes

server.set("view engine", "ejs");

server.use("/", express.static(path.join(__dirname, "public")))
server.use(express.urlencoded({ extended: true }));


// JQ PARTTTT
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

server.use("/", authRoutes);
// END OF JQ PARTTT
//Start of Express Router Code

const home = require("./routes/homePage");

server.get("/give-up-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "give-up-dog.html"));
});

server.get("/adopt-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "adopt-dog.html"));
});

server.get("/profile/update", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "profile.html"));
});


server.use("/home-display", home);
let user = {
    username: "valencia",
    email: "valencia@gmail.com",
    displayName: "val",
    bio: "i love dogs",
    contact: "81234567",
    address: "singapore",
    dateJoined: "12/3/2026"
};

server.get("/profile", (req, res) => {
    res.sendFile(__dirname + "/public/profile.html");
});

server.post("/profile/update", (req, res) => {
    let { displayName, bio, contact, address } = req.body;
    let errors = [];

    if (!displayName || displayName.trim() === "") {
        errors.push("Display Name cannot be blank.");
    }

    contact = (contact || "").replaceAll(" ", "");

    if (!(contact.startsWith("8") || contact.startsWith("9")) || contact.length !== 8) {
        errors.push("Contact must be a Singapore mobile number (8 digits starting with 8 or 9)");
    }

    if (!address || address.trim() === "") {
        errors.push("Address cannot be blank.");
    }

    if (errors.length > 0) {
        return res.send(`
            <h2>Validation Errors</h2>
            <ul>
                ${errors.map(e => `<li>${e}</li>`).join("")}
            </ul>
            <a href="/profile">Go Back</a>
        `);
    }

    user.displayName = displayName;
    user.bio = bio;
    user.contact = contact;
    user.address = address;

    res.send(`
        <h2>Profile updated successfully!</h2>
        <a href="/profile">Back to Profile</a>
    `);
});

//End of Express Router Code

const hostname = "127.0.0.1";
const port = 8000;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});