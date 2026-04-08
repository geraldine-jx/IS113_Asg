const bcrypt = require("bcrypt");
const User = require("../models/user");
const Employee = require("../models/employees");

// User authentication

// Authenticate a normal user and start a session.
exports.loginUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === "" || password === "") {
        res.render("user/login-user", { error: "Please fill in all required fields." });
        return;
    }

    const foundUser = await User.findOne({
        usertype: "user",
        username: username
    });

    if (!foundUser) {
        res.render("user/login-user", { error: "User does not exist" });
        return;
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);

    if (!isMatch) {
        res.render("user/login-user", { error: "Wrong password" });
        return;
    }

    req.session.userId = foundUser._id;
    req.session.usertype = foundUser.usertype;
    res.redirect("/home-display");
};

// Shared helpers

// Map Mongo duplicate-key errors into simple UI messages.
const getDuplicateFieldError = (error) => {
    if (error?.code !== 11000 || !error.keyPattern) {
        return null;
    }

    if (error.keyPattern.username) {
        return "Username already exists";
    }

    return "A user with the same details already exists";
};

// Format dateJoined for console logs only.
const formatDateJoinedForLog = (date) => {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

// Escape user input before building a regex search.
const escapeRegExp = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Build one shared HTML error string for missing form fields.
const buildMissingFieldsError = (missingFields) => {
    return `Please fill in:<ul>${missingFields.join("")}</ul>`;
};

// Load and render the admin user list, with optional search and flash messages.
const renderAdminUsersPage = async (res, options = {}) => {
    const search = options.search ? options.search.trim() : "";
    const filter = { usertype: "user" };

    if (search !== "") {
        const searchPattern = new RegExp(escapeRegExp(search), "i");
        filter.$or = [
            { username: searchPattern },
            { displayName: searchPattern }
        ];
    }

    const users = await User.find(filter).sort({ username: 1 });

    res.render("admin/admin-view-users", {
        users,
        search,
        error: options.error || null,
        message: options.message || null
    });
};

// Public auth pages

// Main landing page now points to the public index file.
exports.showMainPage = (req, res) => {
    res.redirect("/index.html");
};

// Show the correct login page based on the requested user type.
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

// Only normal users can self-register; admin registration is disabled.
exports.showRegisterPage = (req, res) => {
    const usertype = req.query.usertype;

    if (usertype === "user") {
        res.render("user/register-user", { error: null });
    } else if (usertype === "admin") {
        res.status(404).send("Admin registration is not available");
    } else {
        res.send("Invalid user type");
    }
};

// User account actions

// Validate, create, and save a new normal user account.
exports.registerUser = async (req, res) => {
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

    for (const key in fields) {
        if (key !== "bio" && key !== "usertype" && fields[key] === "") {
            missingFields.push(`<li>${key}</li>`);
        }
    }

    if (missingFields.length > 0) {
        res.render("user/register-user", {
            error: buildMissingFieldsError(missingFields)
        });
        return;
    }

    if (fields.password !== fields.confirmPassword) {
        res.render("user/register-user", { error: "Passwords must match!!" });
        return;
    }

    const existingUser = await User.findOne({
        $or: [
            { username: fields.username },
            { email: fields.email }
        ]
    });

    if (existingUser) {
        let errorMessage = "Email already exists";

        if (existingUser.username === fields.username) {
            errorMessage = "Username already exists";
        }

        res.render("user/register-user", { error: errorMessage });
        return;
    }

    const hashedPassword = await bcrypt.hash(fields.password, 10);
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
        await newUser.save();
        console.log(`User dateJoined: ${formatDateJoinedForLog(newUser.dateJoined)}`);
        res.render("user/login-user", { error: "User registered successfully. Please sign in." });
    } catch (error) {
        const duplicateFieldError = getDuplicateFieldError(error);

        if (duplicateFieldError) {
            res.render("user/register-user", { error: duplicateFieldError });
            return;
        }

        throw error;
    }
};

// Show the user password-reset form.
exports.showForgotPasswordPage = (req, res) => {
    res.render("user/forgot-password-user", { error: null, message: null });
};

// Load the signed-in admin's name for the dashboard.
exports.showAdminDashboardPage = async (req, res) => {
    const admin = await Employee.findOne({
        _id: req.session.userId
    }).lean();

    const adminName = admin?.displayName || admin?.username || "Admin";

    res.render("admin/admin-dashboard", { adminName });
};

// Reset a user's password after verifying username and email.
exports.resetUserPassword = async (req, res) => {
    const fields = {
        username: req.body.username,
        email: req.body.email,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword
    };

    const missingFields = [];

    for (const key in fields) {
        if (fields[key] === "") {
            missingFields.push(`<li>${key}</li>`);
        }
    }

    if (missingFields.length > 0) {
        res.render("user/forgot-password-user", {
            error: buildMissingFieldsError(missingFields),
            message: null
        });
        return;
    }

    if (fields.newPassword !== fields.confirmPassword) {
        res.render("user/forgot-password-user", {
            error: "Passwords must match!!",
            message: null
        });
        return;
    }

    const foundUser = await User.findOne({
        usertype: "user",
        username: fields.username,
        email: fields.email
    });

    if (!foundUser) {
        res.render("user/forgot-password-user", {
            error: "No user matched the username and email provided",
            message: null
        });
        return;
    }

    foundUser.password = await bcrypt.hash(fields.newPassword, 10);
    await foundUser.save();

    res.render("user/login-user", { error: "Password updated successfully. Please sign in." });
};

// Admin authentication and admin user management

// Authenticate an admin using the employees collection only.
exports.loginAdmin = async (req, res) => {
    const employeeID = (req.body.employeeID || "").trim();
    const password = req.body.password || "";

    if (employeeID === "" || password === "") {
        return res.render("user/login-admin", {
            error: "Please enter your Employee ID and password."
        });
    }

    const approvedEmployee = await Employee.findOne({
        employeeID: employeeID
    });

    if (!approvedEmployee) {
        return res.render("user/login-admin", {
            error: "EmployeeID was not found in the approved employee list"
        });
    }

    if (!approvedEmployee.password) {
        return res.render("user/login-admin", {
            error: "This admin account does not have a password configured in the employees collection."
        });
    }

    let isMatch = false;

    if (approvedEmployee.password.startsWith("$2")) {
        isMatch = await bcrypt.compare(password, approvedEmployee.password);
    } else {
        isMatch = password === approvedEmployee.password;

        if (isMatch) {
            approvedEmployee.password = await bcrypt.hash(password, 10);
            await approvedEmployee.save();
        }
    }

    if (!isMatch) {
        return res.render("user/login-admin", {
            error: "Wrong password"
        });
    }

    req.session.userId = approvedEmployee._id;
    req.session.usertype = "admin";
    req.session.adminName = approvedEmployee.displayName || approvedEmployee.username;

    res.redirect("/auth/admin/dashboard");
};

// Show the admin user-management page.
exports.showAdminUsersPage = async (req, res) => {
    await renderAdminUsersPage(res, {
        search: req.query.search || ""
    });
};

// Delete one normal user from the admin user-management page.
exports.deleteUser = async (req, res) => {
    const userId = req.body.userId;
    const search = req.body.search || "";

    if (!userId) {
        await renderAdminUsersPage(res, {
            search,
            error: "No user was selected for deletion"
        });
        return;
    }

    const deletedUser = await User.findOneAndDelete({
        _id: userId,
        usertype: "user"
    });

    if (!deletedUser) {
        await renderAdminUsersPage(res, {
            search,
            error: "User not found or already deleted"
        });
        return;
    }

    await renderAdminUsersPage(res, {
        search,
        message: `User ${deletedUser.username} deleted successfully`
    });
};

// Destroy the session and return to the login entry point.
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send("Unable to log out");
        }
        res.redirect("/auth/login?usertype=user");
    });
};
