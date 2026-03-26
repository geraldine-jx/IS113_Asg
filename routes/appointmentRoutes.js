const express = require('express');
// path to controller
const appointmentController = require('../controllers/appointment-controller');
// sub application
const router = express.Router();

router.get("/", appointmentController.displayForm);
router.post("/process-form", appointmentController.createAppointment);
router.get("/appointment-list", appointmentController.showAppointments);
router.post("/update-appointment", appointmentController.updateAppointment);
router.post("/delete-appointment", appointmentController.deleteAnAppointment);
// export
module.exports = router;
//finds list books will be forwarded to books-controller.js
// then punch req to book-model.js
// send back to controller
// controller will as the view to display-book.ejs