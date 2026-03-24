require("dotenv").config({ path: "./config.env" });

const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");

const server = express();
const hostname = "localhost";
const port = 8000;

server.set("view engine", "ejs");
server.use(express.urlencoded({ extended: true }));

mongoose.set("strictQuery", true);

async function createSampleUser() {
    try {
        const existingUser = await User.findOne({ email: "valencia@gmail.com" });

        if (!existingUser) {
            await User.create({
                username: "valencia",
                email: "valencia@gmail.com",
                password: "123456",
                bio: "i love dogs",
                contact: "81234567",
                address: "singapore",
                dateJoined: "12/3/2026"
            });
            console.log("Sample user created");
        } else {
            console.log("Sample user already exists");
        }
    } catch (err) {
        console.log("Error creating sample user:", err.message);
    }
}

mongoose.connect(process.env.DB)
    .then(async () => {
        console.log("Connected to MongoDB");
        await createSampleUser();

        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err.message);
    });

server.get("/profile", async (req, res) => {
    try {
        const user = await User.findOne({ email: "valencia@gmail.com" });

        if (!user) {
            return res.send("User not found");
        }

        res.render("profile", {
            user,
            errors: [],
            success: null
        });
    } catch (err) {
        console.log("PROFILE ERROR:", err.message);
        res.send("Error loading profile: " + err.message);
    }
});

server.post("/profile", async (req, res) => {
    try {
        const { username, bio, contact, address } = req.body;
        const errors = [];

        const user = await User.findOne({ email: "valencia@gmail.com" });

        if (!user) {
            return res.send("User not found");
        }

        if (!username || username.trim() === "") {
            errors.push("Display name cannot be blank.");
        }

        if (!contact || contact.length !== 8 || 
            (contact[0] !== '8' && contact[0] !== '9')) {
            errors.push("Contact number must be an 8-digit Singapore number starting with 8 or 9.");
        }

        if (!address || address.trim() === "") {
            errors.push("Address cannot be blank.");
        }

        if (errors.length > 0) {
            return res.render("profile", {
                user: {
                    ...user.toObject(),
                    username,
                    bio,
                    contact,
                    address
                },
                errors,
                success: null
            });
        }

        user.username = username.trim();
        user.bio = bio;
        user.contact = contact;
        user.address = address.trim();

        await user.save();

        res.render("profile", {
            user,
            errors: [],
            success: "Profile updated successfully."
        });
    } catch (err) {
        console.log("UPDATE ERROR:", err.message);
        res.send("Error updating profile: " + err.message);
    }
});

server.post("/delete-account", async (req, res) => {
    try {
        const user = await User.findOneAndDelete({
            email: "valencia@gmail.com"
        });

        if (!user) {
            return res.send("User not found");
        }

        res.send("Account deleted successfully.");
    } catch (err) {
        console.log("DELETE ERROR:", err.message);
        res.send("Error deleting account: " + err.message);
    }
});

server.get("/", (req, res) => {
    res.redirect("/profile");
});