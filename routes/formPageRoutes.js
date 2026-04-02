
const express = require("express");
//const path = require("path");
const formController = require("../controllers/formController");
const appointmentController = require("../controllers/appointmentController");  

const router = express.Router();

router.get("/give-up-dog", formController.showGiveUpDogPage);
router.get("/adopt-dog", formController.showAdoptDogPage);

router.get('/user-details', formController.getUserDetails);

router.post("/adopt-dog", formController.submitAdoptionRequest);
router.post("/give-up-dog", formController.submitGiveUpRequest);

// Appointment page — shown after adoption form is submitted
router.get("/appointment", appointmentController.displayForm);
router.get('/manage-rehome-request', formController.showManageRehomeRequestPage);
router.post('/manage-rehome-request', formController.showManageRehomeRequestPage);

router.get('/manage-adopt-request', formController.showManageAdoptRequestPage);
router.post('/manage-adopt-request', formController.showManageAdoptRequestPage);

router.get('/my-adopt-requests', formController.showMyAdoptRequests);
router.get('/my-rehome-requests', formController.showMyRehomeRequests);

router.post("/update-adoption-request", formController.updateAdoptionRequest);
router.post("/update-give-up-request", formController.updateGiveUpRequest);

router.post("/delete-adopt-request", formController.deleteAdoptionRequest);
router.post("/delete-giveup-request", formController.deleteGiveUpRequest);

module.exports = router;

