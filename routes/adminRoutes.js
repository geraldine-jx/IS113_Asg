const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin give-up routes
router.get("/admin/giveups/create", authMiddleware.requireAdmin, adminController.showCreateGiveUpForm);
router.post("/admin/giveups/create", authMiddleware.requireAdmin, adminController.createGiveUp);
router.get("/admin/giveups", authMiddleware.requireAdmin, adminController.showGiveUps);
router.get("/admin/giveups/details", authMiddleware.requireAdmin, adminController.showGiveUpDetails);
router.post("/admin/giveups/approve", authMiddleware.requireAdmin, adminController.approveGiveUp);
router.post("/admin/giveups/reject", authMiddleware.requireAdmin, adminController.rejectGiveUp);
router.post("/admin/giveups/delete", authMiddleware.requireAdmin, adminController.deleteGiveUp);
router.get("/admin/listings", authMiddleware.requireAdmin, adminController.showAdoptionListings);
router.post("/admin/listings/delete", authMiddleware.requireAdmin, adminController.deleteAdoptionListing);

// Admin adoption routes
router.get("/admin/adoptions/create", authMiddleware.requireAdmin, adminController.showCreateAdoptionForm);
router.post("/admin/adoptions/create", authMiddleware.requireAdmin, adminController.createAdoption);
router.get("/admin/adoptions", authMiddleware.requireAdmin, adminController.showAdoptions);
router.get("/admin/adoptions/details", authMiddleware.requireAdmin, adminController.showAdoptionDetails);
router.post("/admin/adoptions/approve", authMiddleware.requireAdmin, adminController.approveAdoption);
router.post("/admin/adoptions/reject", authMiddleware.requireAdmin, adminController.rejectAdoption);
router.post("/admin/adoptions/delete", authMiddleware.requireAdmin, adminController.deleteAdoption);
router.get("/admin/adoptions/approved", authMiddleware.requireAdmin, adminController.showApprovedAdoptions);
router.get("/admin/analytics", authMiddleware.requireAdmin, adminController.showAnalyticsDashboard);
router.get("/admin/analytics/export", authMiddleware.requireAdmin, adminController.downloadAnalyticsCsv);

module.exports = router;
