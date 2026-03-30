const express = require("express");
const router = express.Router();
const homePageController = require("../controllers/homePageController");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// GET homepage (full URL: /home-display)
router.get("/", homePageController.getAllPets);

// Toggle favourite (full URL: /home-display/pets/:id/toggleFavourite)
router.post("/pets/:id/toggleFavourite", homePageController.toggleFavourite);

// Get more info for a pet (full URL: /home-display/pets/:id)
router.get("/pets/:id",homePageController.getPetDetails)

// Admin give-up routes(Eashvar)
router.get("/admin/giveups/create", authMiddleware.requireAdmin, adminController.showCreateGiveUpForm);
router.post("/admin/giveups/create", authMiddleware.requireAdmin, adminController.createGiveUp);
router.get("/admin/giveups", authMiddleware.requireAdmin, adminController.showGiveUps);
router.get("/admin/giveups/details", authMiddleware.requireAdmin, adminController.showGiveUpDetails);
router.post("/admin/giveups/approve", authMiddleware.requireAdmin, adminController.approveGiveUp);
router.post("/admin/giveups/reject", authMiddleware.requireAdmin, adminController.rejectGiveUp);
router.post("/admin/giveups/delete", authMiddleware.requireAdmin, adminController.deleteGiveUp);

// Admin adoption routes (Matrix)
router.get("/admin/adoptions/create", authMiddleware.requireAdmin, adminController.showCreateAdoptionForm);
router.post("/admin/adoptions/create", authMiddleware.requireAdmin, adminController.createAdoption);
router.get("/admin/adoptions", authMiddleware.requireAdmin, adminController.showAdoptions);
router.get("/admin/adoptions/details", authMiddleware.requireAdmin, adminController.showAdoptionDetails);
router.post("/admin/adoptions/approve", authMiddleware.requireAdmin, adminController.approveAdoption);
router.post("/admin/adoptions/reject", authMiddleware.requireAdmin, adminController.rejectAdoption);
router.post("/admin/adoptions/delete", authMiddleware.requireAdmin, adminController.deleteAdoption);

module.exports = router;
 
