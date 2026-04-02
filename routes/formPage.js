const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/adopt-dog", authMiddleware.requireLogin, formController.showAdoptDogPage);
router.get("/give-up-dog", authMiddleware.requireLogin, formController.showGiveUpDogPage);
router.post("/adopt-dog", authMiddleware.requireLogin, formController.submitAdoptionRequest);
router.post("/give-up-dog", authMiddleware.requireLogin, formController.submitGiveUpRequest);

module.exports = router;    
