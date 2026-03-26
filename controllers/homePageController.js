const Pet = require("../models/pet.js");
const Favourite = require("../models/favourite");
const User = require("../models/user");

exports.getAllPets = async (req, res) => {
  try {
    
    let favouritePetIds = [];
    let userId = req.session.userId; 

    if (userId) {
      // Get favourites for logged-in user
      const favourites = await Favourite.find({ user: userId });
      favouritePetIds = favourites.map(f => f.pet.toString());
    }

    // Get all pets
    const pets = await Pet.find();

    // If user has favourites, put favourite first that remaining pets
    const sortedPets = favouritePetIds.length
      ? [
          ...pets.filter(p => favouritePetIds.includes(p._id.toString())), // favourites first
          ...pets.filter(p => !favouritePetIds.includes(p._id.toString())) // remaining pets
        ]
      : pets; // no favourites → just all pets

    res.render("pet/home-display", {
      pets: sortedPets,
      favourites: favouritePetIds
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading pets");
  }
};

// toggle for favourite pet
exports.toggleFavourite = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const userId = req.session.userId;
    const petId = req.params.id;

    const favourite = await Favourite.findOne({ user: userId, pet: petId });
    // Delete a favourites data
    if (favourite) {
      await favourite.deleteOne();
    } else {
    // Create a favourites data
      await Favourite.create({ user: userId, pet: petId });
    }

    res.redirect("/home-display");
  } catch (err) {
    console.error(err);
    res.send("Error toggling favourite");
  }
};

// Get details for more info page
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