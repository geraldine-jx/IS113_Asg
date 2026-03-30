const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");

router.get("/adopt-dog", formController.showAdoptDogPage);
router.get("/give-up-dog", formController.showGiveUpDogPage);
router.post("/review-adoption-app", formController.submitAdoptionRequest);
router.post("/giveups", formController.submitGiveUpRequest);

module.exports = router;