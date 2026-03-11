const express = require("express");
const router = express.Router();

// Redner display and update available dogs

router.get("/", (req, res) => {

    //change to get pets from database later
    const pets = [
        {name: "Max", breed: "Golden Retriever", age: 3, status: "Available"},
        {name: "Luna", breed: "Husky", age: 2, status: "Available"}
    ]

    res.render("home-display", { pets: pets })
})
module.exports = router;