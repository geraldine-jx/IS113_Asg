const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const router = express.Router();

router.get("/appointment", appointmentController.displayForm);
router.get("/manage-appointment", appointmentController.showManageAppointment);
router.post("/process-form", appointmentController.createAppointment);
router.get("/appointment-list", appointmentController.showAppointments);
router.post("/update-appointment", appointmentController.updateAppointment);
router.post("/delete-appointment", appointmentController.deleteAnAppointment);

module.exports = router;
//finds list books will be forwarded to books-controller.js
// then punch req to book-model.js
// send back to controller
// controller will as the view to display-book.ejs