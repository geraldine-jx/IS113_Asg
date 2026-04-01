const path = require("path");
const User = require("../models/user");
const PetRequest = require("../models/petRequest");
const { Admin } = require("mongodb");


exports.showAdoptDogPage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views/form", "adopt-dog.html"));
  const petId = req.query.petId; // Get petId from query parameters
  res.render("form/adopt-dog", { petId }); // Pass petId to the EJS template
};

exports.showGiveUpDogPage = (req, res) => {
  //res.sendFile(path.join(__dirname, "..", "views/form", "give-up-dog.ejs"));
  res.render("form/give-up-dog");
};

// READ
exports.getUserDetails = async (req, res) => {
    try {
        console.log("Session userId:", req.session.userId);
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
// READ AND CREATE
exports.submitAdoptionRequest = async (req, res) => {
    try {
      const petId = req.params.id;
      const userId = req.session.userId;
      // const userId= req.body.userId;
      const username = req.body.username;
      const ownerName= req.body.ownerName;
      const contact = req.body.contact;
      const address= req.body.address;
      const email= req.body.email;
      const petName= req.body.petName;
      // const petId= req.body.petId;
      const housing = req.body.housing;
      const requestType= "adopt";
      const status= "pending";

      const newPet = {
        userId,
        username,
        ownerName,
        contact,
        address,
        email,
        petName,
        petId,
        housing,
        requestType: 'adopt',
        status: 'pending'

      }
      
      await PetRequest.addPet(newPet);
 
      console.log('request submitted successfully!');
      // return res.send('Request submitted successfully!');
      return res.redirect('/appointment');


  } catch (error){
    console.error(error);
    return res.status(500).send("Error submitting adoption request");
  };
};


// CREATE
exports.submitGiveUpRequest = async (req, res) => {
  try {      
    const userId = req.session.userId;
    const username = req.body.username;
    const ownerName= req.body.ownerName;
    const contact = req.body.contact;
    const address= req.body.address;
    const email= req.body.email;

    const petName= req.body.petName;
    const petBreed= req.body.petBreed;
    const petSize= req.body.petSize;
    const petAge= req.body.petAge;
    const petHdbApproved= req.body.petHdbApproved;
    const reason= req.body.reason;
    const details= req.body.details;
    const photo= req.body.photo;
    const requestType= "rehome";
    const status= "pending";


  const newPet = {
        userId,
        username,
        ownerName,
        contact,
        address,
        email,
        petName,
        petBreed,
        petSize,
        petAge,
        petHdbApproved,
        reason,
        details,
        photo,
        requestType: 'rehome',
        status: 'pending'
      }
  
 
    await PetRequest.addPet(newPet);
    
      console.log('request submitted successfully!');
      // return res.send('Request submitted successfully!');
      return res.redirect('/appointment');
  }catch (error){
    console.error(error);
  };
  
};

// UPDATE
exports.updateAdoptionRequest = async (req, res) => {
  const data = {
    userId: req.body.userId,
    petId: req.body.petId,
    petName: req.body.petName,
    housing: req.body.housing, 
    status: req.body.status
  };
  if (data.status !== "pending") {
      console.log("Request already processed, cannot update");
      return;
    };
  try{
    let updated = await PetRequest.findByIdAndUpdate({userId: req.body.userId, petId: req.body.petId},
                                                {petName: req.body.petName, housing: req.body.housing}
    );
    if (!updated) {
      console.log("Request not found");
        };

  }catch (error){
    console.error(error);
  };
  res.send("Adoption request updated!");

};

exports.updateGiveUpRequest = async (req, res) => {
  const data = {
    userId: req.body.userId,
    petId: req.body.petId,
    petName: req.body.petName,
    petBreed: req.body.petBreed,
    petSize: req.body.petSize,
    petAge: req.body.petAge,
    petHdbApproved: req.body.petHdbApproved,
    reason: req.body.reason,
    details: req.body.details,
    photo: req.body.photo,
    status: req.body.status
  };
  if (data.status !== "pending") {
      console.log("Request already processed, cannot update");
      return;
    };
  try{
    let updated = await PetRequest.findByIdAndUpdate({userId: req.body.userId, petId: req.body.petId},
                                                {petName: req.body.petName, petBreed: req.body.petBreed, 
                                                petSize: req.body.petSize, petAge: req.body.petAge, 
                                                petHdbApproved: req.body.petHdbApproved, reason: req.body.reason, 
                                                details: req.body.details, photo: req.body.photo}
    );
    if (!updated) {
      console.log("Request not found");

       };
  }catch (error){
    console.error(error);
  };
  res.send("Give up request updated!");
};  

// DELETE
exports.deleteAdoptionRequest = async (req, res) => {
  const data = {petId: req.body.petId, userId: req.body.userId,status: req.body.status
  };
  if (data.status !== "pending") {
      console.log("Request already processed, cannot delete");
      return;
    };
  try{
    let deleted = await PetRequest.findByIdAndDelete({userId: req.body.userId, petId: req.body.petId});
    if (!deleted) {
      console.log("Request not found");
   
       };
  }catch (error){
    console.error(error);
  };
  res.send("Adoption request deleted!");
};

exports.deleteGiveUpRequest = async (req, res) => {
  const data = {petId: req.body.petId, userId: req.body.userId,status: req.body.status};
  if (data.status !== "pending") {
      console.log("Request already processed, cannot delete");
      return;
    };
  try{
    let deleted = await PetRequest.findByIdAndDelete({userId: req.body.userId, petId: req.body.petId});
    if (!deleted) {
      console.log("Request not found");
   
       };
  }catch (error){
    console.error(error);
  };
  res.send("Give up request deleted!");
};