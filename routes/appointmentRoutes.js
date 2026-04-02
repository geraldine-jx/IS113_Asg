const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const router = express.Router();

router.get("/appointment", appointmentController.displayForm);
router.get("/manageappointment", appointmentController.showManageAppointment);
router.post("/process-form", appointmentController.createAppointment);
router.post("/updateappointment", appointmentController.updateAppointment);
router.post("/deleteappointment", appointmentController.deleteAnAppointment);
router.post("/findappointment", appointmentController.loadAppointmentForUpdate);
router.get("/myappointment", appointmentController.showMyAppointmentForm);
router.post("/myappointment", appointmentController.showMyAppointmentResult);
// export
module.exports = router;
//finds list books will be forwarded to books-controller.js
// then punch req to book-model.js
// send back to controller
// controller will as the view to display-book.ejs