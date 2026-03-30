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
router.get("/admin/listings", authMiddleware.requireAdmin, adminController.showAdoptionListings);
router.post("/admin/listings/delete", authMiddleware.requireAdmin, adminController.deleteAdoptionListing);

module.exports = router;
 
