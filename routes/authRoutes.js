const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/auth/mainpage", authController.showMainPage);
router.get("/auth/login", authController.showLoginPage);
router.get("/auth/register", authController.showRegisterPage);
router.get("/auth/user/forgot-password", authController.showForgotPasswordPage);
router.get("/auth/admin/dashboard", authController.showAdminDashboardPage);
router.get("/auth/admin/users", authController.showAdminUsersPage);

router.post("/auth/register-user-process", authController.registerUser);
router.post("/userlogin-process", authController.loginUser);
router.post("/auth/user/forgot-password", authController.resetUserPassword);

router.post("/auth/register-admin-process", authController.registerAdmin);
router.post("/adminlogin-process", authController.loginAdmin);
router.post("/auth/admin/users/delete", authController.deleteUser);

module.exports = router;
