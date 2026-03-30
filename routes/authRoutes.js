const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userprofileController = require("../controllers/userprofileController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authController.showMainPage);
router.get("/mainpage", authController.showMainPage);

router.get("/auth/login", authController.showLoginPage);
router.get("/auth/register", authController.showRegisterPage);
router.get("/auth/user/forgot-password", authController.showForgotPasswordPage);

router.get("/auth/admin/dashboard", authMiddleware.requireAdmin, authController.showAdminDashboardPage);
router.get("/auth/admin/users", authMiddleware.requireAdmin, authController.showAdminUsersPage);

router.post("/auth/register-user-process", authController.registerUser);
router.post("/auth/userlogin-process", authController.loginUser);
router.post("/auth/user/forgot-password", authController.resetUserPassword);

router.post("/auth/adminlogin-process", authController.loginAdmin);
router.post("/register-user-process", authController.registerUser);
router.post("/userlogin-process", authController.loginUser);
router.post("/adminlogin-process", authController.loginAdmin);

router.post("/auth/admin/users/delete", authMiddleware.requireAdmin, authController.deleteUser);

router.get("/profile", authMiddleware.requireLogin, userprofileController.showProfilePage);
router.post("/profile/update", authMiddleware.requireLogin, userprofileController.updateProfile);
router.post("/profile/change-password", authMiddleware.requireLogin, userprofileController.changePassword);
router.post("/profile/delete", authMiddleware.requireLogin, userprofileController.deleteUser);

router.get("/auth/logout", authController.logout);

module.exports = router;
