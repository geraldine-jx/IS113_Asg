const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get("/appointment", authMiddleware.requireLogin, appointmentController.displayForm);
router.get("/manageappointment", authMiddleware.requireLogin, appointmentController.showManageAppointment);
router.post("/process-form", authMiddleware.requireLogin, appointmentController.createAppointment);
router.post("/updateappointment", authMiddleware.requireLogin, appointmentController.updateAppointment);
router.post("/deleteappointment", authMiddleware.requireLogin, appointmentController.deleteAnAppointment);
router.post("/findappointment", authMiddleware.requireLogin, appointmentController.loadAppointmentForUpdate);
router.get("/myappointment", authMiddleware.requireLogin, appointmentController.showMyAppointmentForm);
router.post("/myappointment", authMiddleware.requireLogin, appointmentController.showMyAppointmentResult);
// export
module.exports = router;
