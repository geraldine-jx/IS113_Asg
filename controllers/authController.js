const bcrypt = require("bcrypt");  //import bcrypt
const User = require("../models/user"); //get db data from mongo

const Employee = require("../models/employees"); //get employee data from mongo

//USER LOGIN LOGIC
exports.loginUser = async (req, res) => {
    const username = req.body.username; 
    const password = req.body.password;

    if (username === "" || password === "") {   //if fields empty
        res.render("user/login-user", { error: "Please fill in all required fields." });
        return;
    }

    const foundUser = await User.findOne({      // looks inside the users collection finds the first document where username
        usertype: "user",
        username: username
    });

    if (!foundUser) {
        res.render("user/login-user", { error: "User does not exist" });    
        return;
    }

    const isMatch = await bcrypt.compare(password, foundUser.password); //if user correct, check hasehd pw 

    if (!isMatch) {
        res.render("user/login-user", { error: "Wrong password" });     // if isMatch is wrong
        return;
    }

    req.session.userId = foundUser._id;     //stores the logged-in user’s ID
    req.session.usertype = foundUser.usertype;  //stores the user’s role, such as user or admin
    res.redirect("/home-display");          //sends the user to the home page
};

//When user tries to register with credentials alredy exists
const getDuplicateFieldError = (error) => {
    if (error?.code !== 11000 || !error.keyPattern) {
        return null;
    }

    if (error.keyPattern.username) {
        return "Username already exists";
    }

    return "A user with the same details already exists";
};

//Format date into a readable style for user info
const formatDateJoinedForLog = (date) => {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

//admin user search: accepts any other symbols inside search and still search like any normal text
/*This is usually used before new RegExp(...) when searching user input, 
so users cannot accidentally or intentionally turn their search text into regex syntax.
In short:
without it: user input can break or alter regex matching
with it: user input is treated as plain text*/

const escapeRegExp = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildMissingFieldsError = (missingFields) => {            //ejs display for missing field error 
    return `Please fill in:<ul>${missingFields.join("")}</ul>`;
};


// -----------------------------
// function for admin page
// -----------------------------
// This function loads the admin "view users" page.
// It can also handle search results and messages.
const renderAdminUsersPage = async (res, options = {}) => {     
    // Get search text and remove extra spaces
    const search = options.search ? options.search.trim() : "";

    // Only show normal users, not admins
    const filter = { usertype: "user" };

    // If admin typed something in the search bar,
    // search by username or display name
    if (search !== "") {
        const searchPattern = new RegExp(escapeRegExp(search), "i");
        filter.$or = [
            { username: searchPattern },
            { displayName: searchPattern }
        ];
    }

    // Find matching users and sort them alphabetically by username
    const users = await User.find(filter).sort({ username: 1 });

    // Render the admin page and pass the data to EJS
    res.render("admin/admin-view-users", {
        users,
        search,
        error: options.error || null,
        message: options.message || null
    });
};


// Redirects user to the main landing page
exports.showMainPage = (req, res) => {
    res.redirect("/index.html");
};


// Shows the correct login page depending on user type
exports.showLoginPage = (req, res) => {
    const usertype = req.query.usertype;

    if (usertype === "user") {
        res.render("user/login-user", { error: null });
    } else if (usertype === "admin") {
        res.render("user/login-admin", { error: null });
    } else {
        res.send("Invalid user type");
    }
};


// Shows the correct register page depending on user type
exports.showRegisterPage = (req, res) => {
    const usertype = req.query.usertype;

    if (usertype === "user") {
        res.render("user/register-user", { error: null });
    } else if (usertype === "admin") {
        // Admins are not allowed to self-register here
        res.status(404).send("Admin registration is not available");
    } else {
        res.send("Invalid user type");
    }
};


// Handles user registration
exports.registerUser = async (req, res) => {
    // Collect all form input into one object
    const fields = {
        usertype: "user",
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

    // Check for empty required fields
    // bio is optional, usertype is already fixed as "user"
    for (const key in fields) {
        if (key !== "bio" && key !== "usertype" && fields[key] === "") {
            missingFields.push(`<li>${key}</li>`);
        }
    }

    // If any required field is missing, show error
    if (missingFields.length > 0) {
        res.render("user/register-user", {
            error: buildMissingFieldsError(missingFields)
        });
        return;
    }

    // Make sure password and confirm password are the same
    if (fields.password !== fields.confirmPassword) {
        res.render("user/register-user", { error: "Passwords must match!!" });
        return;
    }

    // Check if username or email already exists in database
    const existingUser = await User.findOne({
        $or: [
            { username: fields.username },
            { email: fields.email }
        ]
    });

    if (existingUser) {
        let errorMessage = "Email already exists";

        // If duplicate username is found, show that message instead
        if (existingUser.username === fields.username) {
            errorMessage = "Username already exists";
        }

        res.render("user/register-user", { error: errorMessage });
        return;
    }

    // Hash password before saving for security
    const hashedPassword = await bcrypt.hash(fields.password, 10);

    // Create new user document
    const newUser = new User({
        usertype: fields.usertype,
        username: fields.username,
        email: fields.email,
        password: hashedPassword,
        displayName: fields.displayName,
        contact: fields.contact,
        address: fields.address,
        bio: fields.bio,
        dateJoined: new Date()
    });

    try {
        // Save new user into database
        await newUser.save();

        // Log the join date in readable format
        console.log(`User dateJoined: ${formatDateJoinedForLog(newUser.dateJoined)}`);

        // Send user to login page after successful registration
        res.render("user/login-user", { error: "User registered successfully. Please sign in." });
    } catch (error) {
        // Handle duplicate key error nicely
        const duplicateFieldError = getDuplicateFieldError(error);

        if (duplicateFieldError) {
            res.render("user/register-user", { error: duplicateFieldError });
            return;
        }

        // Throw unknown errors
        throw error;
    }
};


// Shows forgot password page
exports.showForgotPasswordPage = (req, res) => {
    res.render("user/forgot-password-user", { error: null, message: null });
};


// Shows admin dashboard page
exports.showAdminDashboardPage = async (req, res) => {
    // Find admin using the logged-in session userId
    const admin = await Employee.findOne({
        _id: req.session.userId
    }).lean();

    // Use displayName if available, otherwise username, otherwise default to "Admin"
    const adminName = admin?.displayName || admin?.username || "Admin";

    res.render("admin/admin-dashboard", { adminName });
};


// Handles user password reset
exports.resetUserPassword = async (req, res) => {
    const fields = {
        username: req.body.username,
        email: req.body.email,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword
    };

    const missingFields = [];

    // Check if any field is empty
    for (const key in fields) {
        if (fields[key] === "") {
            missingFields.push(`<li>${key}</li>`);
        }
    }

    // Show error if there are missing fields
    if (missingFields.length > 0) {
        res.render("user/forgot-password-user", {
            error: buildMissingFieldsError(missingFields),
            message: null
        });
        return;
    }

    // Make sure both new passwords match
    if (fields.newPassword !== fields.confirmPassword) {
        res.render("user/forgot-password-user", {
            error: "Passwords must match!!",
            message: null
        });
        return;
    }

    // Find the user by username and email
    const foundUser = await User.findOne({
        usertype: "user",
        username: fields.username,
        email: fields.email
    });

    // If user not found, show error
    if (!foundUser) {
        res.render("user/forgot-password-user", {
            error: "No user matched the username and email provided",
            message: null
        });
        return;
    }

    // Hash the new password and save it
    foundUser.password = await bcrypt.hash(fields.newPassword, 10);
    await foundUser.save();

    // Redirect user back to login page
    res.render("user/login-user", { error: "Password updated successfully. Please sign in." });
};


// Handles admin login
exports.loginAdmin = async (req, res) => {
    // Get employeeID and password from form
    const employeeID = (req.body.employeeID || "").trim();
    const password = req.body.password || "";

    // Make sure both fields are filled in
    if (employeeID === "" || password === "") {
        return res.render("user/login-admin", {
            error: "Please enter your Employee ID and password."
        });
    }

    // Check if employee exists in approved employee list
    const approvedEmployee = await Employee.findOne({
        employeeID: employeeID
    });

    if (!approvedEmployee) {
        return res.render("user/login-admin", {
            error: "EmployeeID was not found in the approved employee list"
        });
    }

    // Check if this admin account has a password set
    if (!approvedEmployee.password) {
        return res.render("user/login-admin", {
            error: "This admin account does not have a password configured in the employees collection."
        });
    }

    let isMatch = false;

    // If password already starts with "$2", it means it is already hashed with bcrypt
    if (approvedEmployee.password.startsWith("$2")) {
        isMatch = await bcrypt.compare(password, approvedEmployee.password);    // awaits for the real hashed result 
    } else {
        // Otherwise compare plain text password (if password in database saved is in plain text initially)
        isMatch = password === approvedEmployee.password;

        // If plain text password matches, hash it and save it for better security
        if (isMatch) {
            approvedEmployee.password = await bcrypt.hash(password, 10);
            await approvedEmployee.save();
        }
    }

    // If password is wrong, show error
    if (!isMatch) {
        return res.render("user/login-admin", {
            error: "Wrong password"
        });
    }

    // Save admin details into session after successful login
    req.session.userId = approvedEmployee._id;
    req.session.usertype = "admin";
    req.session.adminName = approvedEmployee.displayName || approvedEmployee.username;

    // Redirect admin to dashboard
    res.redirect("/auth/admin/dashboard");
};


// Shows admin page with all users
exports.showAdminUsersPage = async (req, res) => {
    await renderAdminUsersPage(res, {
        search: req.query.search || ""
    });
};


// Deletes a selected user
exports.deleteUser = async (req, res) => {
    const userId = req.body.userId;
    const search = req.body.search || "";

    // If no user was selected, show error
    if (!userId) {
        await renderAdminUsersPage(res, {
            search,
            error: "No user was selected for deletion"
        });
        return;
    }

    // Find and delete the user by ID
    // Only delete if the account is a normal user
    const deletedUser = await User.findOneAndDelete({
        _id: userId,
        usertype: "user"
    });

    // If no matching user is found, show error
    if (!deletedUser) {
        await renderAdminUsersPage(res, {
            search,
            error: "User not found or already deleted"
        });
        return;
    }

    // Reload page with success message
    await renderAdminUsersPage(res, {
        search,
        message: `User ${deletedUser.username} deleted successfully`
    });
};


// Logs the user out
exports.logout = (req, res) => {
    // Destroy the current session
    req.session.destroy((err) => {
        if (err) {
            return res.send("Unable to log out");
        }

        // Redirect back to user login page after logout
        res.redirect("/auth/login?usertype=user");
    });
};
