const Pet = require("../models/pet.js");
const User = require("../models/user");

// Get all pets for home page
exports.getAllPets = async (req, res) => {
    try {
        const allPets = await Pet.find();

        // Get user's favourites
        const user = await User.findById(req.session.userId);
        const favourites = user ? user.favourites.map(id => id.toString()) : [];

        // Sort pets: favourites first
        const sortedPets = [
            ...allPets.filter(p => favourites.includes(p._id.toString())), // favourites
            ...allPets.filter(p => !favourites.includes(p._id.toString())) // non-favourites
        ];

        // Render page
        res.render("pet/home-display", {
            pets: sortedPets,
            favourites
        });
    } catch (err) {
        console.error("Error loading pets:", err);
        res.send("Error loading pets");
    }
};

// Temporary route to add test pets
exports.createPet = async (req, res) => {
    console.log("createPet route hit");
    try {
        await Pet.insertMany([
            {
                name: "Milo",
                breed: "Shih Tzu",
                size: "Small",
                gender: "Male",
                age: 3,
                hdbApproved: "Yes",
                description: "Friendly and playful dog",
                image: "/images/milo.jpg",
                status: "available",
                listingType: "adoption"
            },
            {
                name: "Bella",
                breed: "Golden Retriever",
                size: "Large",
                gender: "Female",
                age: 2,
                hdbApproved: "Yes",
                description: "Loves kids and outdoor play",
                image: "/images/bella.jpg",
                status: "available",
                listingType: "adoption"
            },
            {
                name: "Charlie",
                breed: "Beagle",
                size: "Medium",
                gender: "Male",
                age: 4,
                hdbApproved: "No",
                description: "Very active and curious",
                image: "/images/charlie.jpg",
                status: "available",
                listingType: "rehome"
            }
        ]);

        res.send("Multiple pets added successfully!");
    } catch (err) {
        console.error(err);
        res.send("Error adding pets");
    }
};

// Toggle favourite for a pet
exports.toggleFavourite = async (req, res) => {
    const userId = req.session.userId;
    const petId = req.params.id;

    try {
        const user = await User.findById(userId);
        // if pet already in favourites, remove
        // if pet not in favourites, remove
        if (user.favourites.includes(petId)) {
            await User.findByIdAndUpdate(userId, { $pull: { favourites: petId } });
        } else {
            await User.findByIdAndUpdate(userId, { $addToSet: { favourites: petId } });
        }

        // Redirect/reload back to home page
        res.redirect("/home-display");
    } catch (err) {
        console.error(err);
        // show home page again if error
        res.redirect("/home-display"); 
    }
};

exports.getPetDetails = async (req, res) => {
    try {
        const petId = req.params.id;
        //find pet
        const pet = await Pet.findById(petId);
        const user = await User.findById(req.session.userId);
        const favourites = user ? user.favourites.map(id => id.toString()) : [];

        if (!pet) {
            return res.send("Pet not found");
        }
        
        res.render("pet/pet-details", { pet,favourites });
    } catch (err) {
        console.error(err);
        res.send("Error loading pet details");
    }
};