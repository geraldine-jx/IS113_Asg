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

server.use("/home-display", home);


/* TO REDIRECT ROUTE FOR USER OR ADMIN TO THEIR PAGES*/ 
server.get("/auth/login", (req, res) => {
    const usertype = req.query.usertype;
    console.log(req.query);

    if (usertype === "user") {
        res.sendFile(path.join(__dirname, "public", "login-user.html"));
    } else if (usertype === "admin") {
        res.sendFile(path.join(__dirname, "public", "login-admin.html"));
    } else {
        res.send("Invalid user type");
    }
});

// LEAD TO REGISTER PAGE FOR ADMIN OR USER
server.get("/auth/register", (req, res) => {
    const usertype = req.query.usertype;

    if (usertype === "user") {
        res.sendFile(path.join(__dirname, "public", "register-user.html"));
    } else if (usertype === "admin") {
        res.sendFile(path.join(__dirname, "public", "register-admin.html"));
    } else {
        res.send("Invalid user type");
    }
});

const users = [];
console.log(users)


// USER REGISTRATION PAGE LOGIC
server.post("/auth/register-admin-process", (req, res) => {
    const fields = {
        usertype: "admin",
        employeeID: req.body.employeeID,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        displayName: req.body.displayName,
        contact: req.body.contact,
        address: req.body.address,
        bio: req.body.bio
    };

    const missingFields = [];

    for (const key in fields) {
        if (key !== "bio" && key !== "usertype" && fields[key] === "") {
            missingFields.push(`<li>${key}</li>`);
        }
    }

    if (missingFields.length > 0) {
        res.send(`
            <h1>Please fill in:</h1>
            <ul>${missingFields.join("")}</ul>
        `);
        return;
    }

    if (fields.password !== fields.confirmPassword) {
        res.send("Passwords must match!!");
        return;
    }

    users.push({
        usertype: fields.usertype,
        employeeID: fields.employeeID,
        username: fields.username,
        email: fields.email,
        password: fields.password,
        displayName: fields.displayName,
        contact: fields.contact,
        address: fields.address,
        bio: fields.bio
    });

    res.send("Admin registered successfully");
});

//ADMIN REGISTRATION PAGE LOGIC
server.post("/auth/register-admin-process", (req, res) => {
    const employeeIDList = ["0001", "0002", "0003"]         //DATA TO BE EXTRACTED FROM MONGODB
    
   const fields = {
        usertype: "admin",
        employeeID: req.body.employeeID,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        displayName: req.body.displayName,
        contact: req.body.contact,
        address: req.body.address,
        bio: req.body.bio
    };


    const missingFields = [];
    let found = false;

    for (let i = 0; i < employeeIDList.length; i++) {
        if (employeeIDList[i] === fields["employeeID"]) {
            found = true;
        }
    }
    if (!found) {
        res.send("Unable to sign up, EmployeeID not in list");
        return;
    }
    
     for (const key in fields) {
        if (key !== "bio" && key !== "usertype" && fields[key] === "") {
            missingFields.push(`<li>${key}</li>`);
        }
    }

    if (missingFields.length > 0) {
        res.send(`
            <h1>Please fill in:</h1>
            <ul>
                ${missingFields.join("")}
            </ul>
        `);
        return;
    }
    if(fields["password"] !== fields["confirmPassword"]){
        res.send("Passwords must match!!")
    } 

    
users.push({
        usertype: fields.usertype,
        employeeID: fields.employeeID,
        username: fields.username,
        email: fields.email,
        password: fields.password,
        displayName: fields.displayName,
        contact: fields.contact,
        address: fields.address,
        bio: fields.bio
    });
    
    res.send("Admin registered successfully");

});


//ADMIN LOGIN PROCESS 
server.post("/adminlogin-process", (req, res) => {
    const employeeID = req.body.employeeID;
    const username = req.body.username;
    const password = req.body.password;

    let found = false;

    for (let i = 0; i < users.length; i++) {
        if (
            users[i].usertype === "admin" &&
            users[i].employeeID === employeeID &&
            users[i].username === username &&
            users[i].password === password
        ) {
            found = true;
        }
    }

    if (found) {
        res.send("Login successful!");
    } else {
        res.send("User does not exist");
    }
}); 



//End of Express Router Code

const hostname = "127.0.0.1";
const port = 8000;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});