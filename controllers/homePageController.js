const Pet = require("../models/pet.js");
const Favourite = require("../models/favourite");
const User = require("../models/user");

// Get user favourite
async function getUserFavourites(userId) {
  return await Favourite.find({ user: userId });
}

// Toggle favourite status
async function toggleFavouriteStatus(userId, petId) {
  const favourite = await Favourite.findOne({ user: userId, pet: petId });
  if (favourite) {
    await Favourite.findByIdAndDelete(favourite._id);
    return false; 
  } else {
    await Favourite.create({ user: userId, pet: petId });
    return true;
  }
}

// Increase view count for pet in favourite
async function incrementViewCount(userId, petId) {
  const fav = await Favourite.findOneAndUpdate(
    { user: userId, pet: petId },
    { $inc: { viewCount: 1 } },
    { new: true } //return the updated document instead of the original one.
  );
  return fav;
}
 
//For reccomendation,get pet with top view count
async function getTopFavouritePet(favDocs) {
  if (!favDocs || favDocs.length === 0) return null;

  let topFav = favDocs[0];
  for (let i = 1; i < favDocs.length; i++) {
    if (favDocs[i].viewCount > topFav.viewCount) {
      topFav = favDocs[i];
    }
  }
  return await Pet.findById(topFav.pet);
}

//homepage
exports.getAllPets = async (req, res) => {
  try {
    //make sure user is logged in
    const userId = req.session.userId;
    if (!userId) return res.redirect("/");

    const favourites = await getUserFavourites(userId);
    // creates a new array that contains only the pet IDs (as strings) from the favourites array.
    const favouritePetIds = favourites.map(f => f.pet.toString());
    const pets = await Pet.find();
    // If > 0 → do sorting. If 0 → just use pets as-is
    const sortedPets = favouritePetIds.length
      ? [
        // creates a new array using [...]
          ...pets.filter(p => favouritePetIds.includes(p._id.toString())), // favourites first
          ...pets.filter(p => !favouritePetIds.includes(p._id.toString())) // remaining pets
        ]
      : pets; // no favourites → just all pets
    
    const recommendedPet = await getTopFavouritePet(favourites);

    res.render("pet/home-display", {pets: sortedPets,favourites: favouritePetIds,recommendedPet}
    );
  } catch (err) {
    console.error(err);
    res.send("Error loading pets");
  }
};

// Toggle for favourite pet
exports.toggleFavourite = async (req, res) => {
  try {
    const userId = req.session.userId;
    const petId = req.params.id;
    await toggleFavouriteStatus(userId, petId);

    res.redirect("/home-display");
  } catch (err) {
    console.error(err);
    res.send("Error toggling favourite");
  }
};

// Get details for more info page
exports.getPetDetails = async (req, res) => {
  try {
    const petId = req.params.id; // From URL
    const userId = req.session.userId; //From sesssion

    const pet = await Pet.findById(petId);
    if (!pet) return res.send("Pet not found");

    let favourites = [];
    let viewCount = null;

    if (userId) {
      const favDocs = await getUserFavourites(userId);
      favourites = favDocs.map(f => f.pet.toString());

      // Check if this pet is a favourite
      const fav = await incrementViewCount(userId, petId);
      if (fav) {
        viewCount = fav.viewCount; 
        }
    }

    res.render("pet/pet-details", {pet,favourites,viewCount}
    );
  } catch (err) {
    console.error(err);
    res.send("Error loading pet details");
  }
};


