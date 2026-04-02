
const express = require("express");
const formController = require("../controllers/formController");
const appointmentController = require("../controllers/appointmentController");  
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/give-up-dog", authMiddleware.requireLogin, formController.showGiveUpDogPage);
router.get("/adopt-dog", authMiddleware.requireLogin, formController.showAdoptDogPage);

router.get('/user-details', authMiddleware.requireLogin, formController.getUserDetails);

router.post("/adopt-dog", authMiddleware.requireLogin, formController.submitAdoptionRequest);
router.post("/give-up-dog", authMiddleware.requireLogin, formController.submitGiveUpRequest);

// Appointment page — shown after adoption form is submitted
router.get("/appointment", appointmentController.displayForm);
router.get('/manage-rehome-request', authMiddleware.requireLogin, formController.showManageRehomeRequestPage);
router.post('/manage-rehome-request', authMiddleware.requireLogin, formController.showManageRehomeRequestPage);

router.get('/manage-adopt-request', authMiddleware.requireLogin, formController.showManageAdoptRequestPage);
router.post('/manage-adopt-request', authMiddleware.requireLogin, formController.showManageAdoptRequestPage);

router.get('/my-adopt-requests', authMiddleware.requireLogin, formController.showMyAdoptRequests);
router.get('/my-rehome-requests', authMiddleware.requireLogin, formController.showMyRehomeRequests);

router.post("/update-adoption-request", authMiddleware.requireLogin, formController.updateAdoptionRequest);
router.post("/update-give-up-request", authMiddleware.requireLogin, formController.updateGiveUpRequest);

router.post("/delete-adopt-request", authMiddleware.requireLogin, formController.deleteAdoptionRequest);
router.post("/delete-giveup-request", authMiddleware.requireLogin, formController.deleteGiveUpRequest);

module.exports = router;

