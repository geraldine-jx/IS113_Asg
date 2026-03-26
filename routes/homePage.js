const express = require("express");
const router = express.Router();

const Pet = require("../models/pet");
const authMiddleware = require("../middleware/authMiddleware");
const PetRequest = require("../models/petRequest");

// Home display

router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find();
    console.log(pets); //  check this
    res.render("pet/home-display", { pets });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});




// End of Eashvar's code (Admin give-up side)
module.exports = router;
