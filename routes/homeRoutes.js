const express = require("express");
const router = express.Router();
const homePageController = require("../controllers/homePageController");

// GET homepage (full URL: /home-display/)
router.get("/", homePageController.getAllPets);

// Temporary route to add test pets (full URL: /home-display/add-test-pet)
router.get("/add-test-pet", homePageController.createPet);

// Toggle favourite for a pet (full URL: /home-display/pets/:id/toggleFavourite)
router.post("/pets/:id/toggleFavourite", homePageController.toggleFavourite);

module.exports = router;