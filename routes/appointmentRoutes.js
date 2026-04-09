const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// user fills up form --> POST to process-form
router.get("/appointment", authMiddleware.requireLogin, appointmentController.displayForm);
// user looks up, edits, cancel appt --> POST to find/update/delete to fetch and display
router.get("/manageappointment", authMiddleware.requireLogin, appointmentController.showManageAppointment);
router.post("/process-form", authMiddleware.requireLogin, appointmentController.createAppointment);
router.post("/updateappointment", authMiddleware.requireLogin, appointmentController.updateAppointment);
router.post("/deleteappointment", authMiddleware.requireLogin, appointmentController.deleteAnAppointment);
router.post("/findappointment", authMiddleware.requireLogin, appointmentController.loadAppointmentForUpdate);
// user enters contact number to view appointment --> POST to myappointment results to fetch and display it
router.get("/myappointment", authMiddleware.requireLogin, appointmentController.showMyAppointmentForm);
router.post("/myappointment", authMiddleware.requireLogin, appointmentController.showMyAppointmentResult);
// export
module.exports = router;
