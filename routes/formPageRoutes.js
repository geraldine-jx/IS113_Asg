const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/give-up-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/form/give-up-dog.html"));
});

router.get("/adopt-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/form/adopt-dog.html"));
});

module.exports = router;
