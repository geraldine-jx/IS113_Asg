const path = require("path");
const User = require("../models/user");

const getDuplicateFieldError = (error) => {
    if (error?.code !== 11000 || !error.keyPattern) {
        return null;
    }

    if (error.keyPattern.employeeID) {
        return "EmployeeID already exists";
    }

    if (error.keyPattern.username) {
        return "Username already exists";
    }

    return "A user with the same details already exists";
};

const formatDateJoinedForLog = (date) => {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

const escapeRegExp = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildMissingFieldsError = (missingFields) => {
    return `Please fill in:<ul>${missingFields.join("")}</ul>`;
};

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

    res.render("admin-view-users", {
        users,
        search,
        error: options.error || null,
        message: options.message || null
    });
};

exports.showMainPage = (req, res) => {
    res.sendFile(path.join(__dirname, "../views/mainpage.html"));
};

exports.showLoginPage = (req, res) => {
    const usertype = req.query.usertype;

    if (usertype === "user") {
        res.render("login-user", { error: null });
    } else if (usertype === "admin") {
        res.render("login-admin", { error: null });
    } else {
        res.send("Invalid user type");
    }
};

exports.showRegisterPage = (req, res) => {
    const usertype = req.query.usertype;

    if (usertype === "user") {
        res.render("register-user", { error: null });
    } else if (usertype === "admin") {
        res.render("register-admin", { error: null });
    } else {
        res.send("Invalid user type");
    }
};

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
        res.render("register-user", {
            error: buildMissingFieldsError(missingFields)
        });
        return;
    }

    if (fields.password !== fields.confirmPassword) {
        res.render("register-user", { error: "Passwords must match!!" });
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

        res.render("register-user", { error: errorMessage });
        return;
    }

    const newUser = new User({
        usertype: fields.usertype,
        username: fields.username,
        email: fields.email,
        password: fields.password,
        displayName: fields.displayName,
        contact: fields.contact,
        address: fields.address,
        bio: fields.bio,
        dateJoined: new Date()
    });

    try {
        await newUser.save();
        console.log(`User dateJoined: ${formatDateJoinedForLog(newUser.dateJoined)}`);
        res.render("login-user", { error: "User registered successfully. Please sign in." });
    } catch (error) {
        const duplicateFieldError = getDuplicateFieldError(error);

        if (duplicateFieldError) {
            res.render("register-user", { error: duplicateFieldError });
            return;
        }

        throw error;
    }
};

exports.loginUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === "" || password === "") {
        res.render("login-user", { error: "Please fill in all required fields." });
        return;
    }

    const foundUser = await User.findOne({
        usertype: "user",
        username: username
    });

    if (!foundUser) {
        res.render("login-user", { error: "User does not exist" });
        return;
    }

    if (foundUser.password !== password) {
        res.render("login-user", { error: "Wrong password" });
        return;
    }

    res.send("Login successful!");
    // later change to:
    // res.redirect("/user/home");
};

exports.showForgotPasswordPage = (req, res) => {
    res.render("forgot-password-user", { error: null, message: null });
};

exports.showAdminDashboardPage = (req, res) => {
    res.render("admin-dashboard");
};

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
        res.render("forgot-password-user", {
            error: buildMissingFieldsError(missingFields),
            message: null
        });
        return;
    }

    if (fields.newPassword !== fields.confirmPassword) {
        res.render("forgot-password-user", {
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
        res.render("forgot-password-user", {
            error: "No user matched the username and email provided",
            message: null
        });
        return;
    }

    foundUser.password = fields.newPassword;
    await foundUser.save();

    res.render("login-user", { error: "Password updated successfully. Please sign in." });
};

exports.registerAdmin = async (req, res) => {
    const employeeIDList = ["0001", "0002", "0003"];

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
        res.render("register-admin", {
            error: buildMissingFieldsError(missingFields)
        });
        return;
    }

    if (!employeeIDList.includes(fields.employeeID)) {
        res.render("register-admin", { error: "Unable to sign up, EmployeeID not in list" });
        return;
    }

    if (fields.password !== fields.confirmPassword) {
        res.render("register-admin", { error: "Passwords must match!!" });
        return;
    }

    const existingAdmin = await User.findOne({
        $or: [
            { employeeID: fields.employeeID },
            { username: fields.username },
            { email: fields.email }
        ]
    });

    if (existingAdmin) {
        let errorMessage = "Email already exists";

        if (existingAdmin.employeeID === fields.employeeID) {
            errorMessage = "EmployeeID already exists";
        } else if (existingAdmin.username === fields.username) {
            errorMessage = "Username already exists";
        }

        res.render("register-admin", { error: errorMessage });
        return;
    }

    const newAdmin = new User({
        usertype: fields.usertype,
        employeeID: fields.employeeID,
        username: fields.username,
        email: fields.email,
        password: fields.password,
        displayName: fields.displayName,
        contact: fields.contact,
        address: fields.address,
        bio: fields.bio,
        dateJoined: new Date()
    });

    try {
        await newAdmin.save();
        console.log(`Admin dateJoined: ${formatDateJoinedForLog(newAdmin.dateJoined)}`);
        res.render("login-admin", { error: "Admin registered successfully. Please sign in." });
    } catch (error) {
        const duplicateFieldError = getDuplicateFieldError(error);

        if (duplicateFieldError) {
            res.render("register-admin", { error: duplicateFieldError });
            return;
        }

        throw error;
    }
};

exports.loginAdmin = async (req, res) => {
    const employeeID = req.body.employeeID;
    const username = req.body.username;
    const password = req.body.password;

    if (employeeID === "" || username === "" || password === "") {
        res.render("login-admin", { error: "Please fill in all required fields." });
        return;
    }

    const foundAdmin = await User.findOne({
        usertype: "admin",
        employeeID: employeeID,
        username: username
    });

    if (!foundAdmin) {
        res.render("login-admin", { error: "User does not exist" });
        return;
    }

    if (foundAdmin.password !== password) {
        res.render("login-admin", { error: "Wrong password" });
        return;
    }

    res.redirect("/auth/admin/dashboard");
};

exports.showAdminUsersPage = async (req, res) => {
    await renderAdminUsersPage(res, {
        search: req.query.search || ""
    });
};

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
