const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
module.exports = router;

router.get("/auth/mainpage", authController.showMainPage);
router.get("/auth/login", authController.showLoginPage);
router.get("/auth/register", authController.showRegisterPage);

router.post("/auth/register-user-process", authController.registerUser);
router.post("/userlogin-process", authController.loginUser);

router.post("/auth/register-admin-process", authController.registerAdmin);
router.post("/adminlogin-process", authController.loginAdmin);

