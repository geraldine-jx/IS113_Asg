const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/give-up-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/form/give-up-dog.html"));
});

router.get("/adopt-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/form/adopt-dog.html"));
});

router.post("/submit-adoption-request", formController.submitAdoptionRequest);
router.post("/submit-give-up-request", formController.submitGiveUpRequest);

router.post("/update-adoption-request", formController.updateAdoptionRequest);
router.post("/update-give-up-request", formController.updateGiveUpRequest);

router.post("/delete-adoption-request", formController.deleteAdoptionRequest);
router.post("/delete-give-up-request", formController.deleteGiveUpRequest);

module.exports = router;
