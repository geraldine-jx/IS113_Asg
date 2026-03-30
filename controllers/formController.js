const path = require("path");
const User = require("../models/user");
const PetRequest = require("../models/petRequest.js");


exports.showAdoptDogPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "adopt-dog.html"));
};

exports.showGiveUpDogPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "give-up-dog.html"));
};

// READ AND CREATE
exports.submitAdoptionRequest = async (req, res) => {
  const data = {
    userId: req.body.userId,
    ownerName: req.body.ownerName,
    contactNo: req.body.contactNo,
    address: req.body.address,
    email: req.body.email,
    petName: req.body.petName,
    petId: req.body.petId,
    housing: req.body.housing
  };

  try{
    let pet = await PetRequest.create(data);
    
  }catch (error){
    console.error(error);
  }

  res.send("Adoption request submitted!");
};

// CREATE
exports.submitGiveUpRequest = async (req, res) => {
  const data = {
    userId: req.body.userId,
    ownerName: req.body.ownerName,
    petName: req.body.petName,
    petBreed: req.body.petBreed,
    petSize: req.body.petSize,
    petAge: req.body.petAge,
    petHdbApproved: req.body.petHdbApproved,
    reason: req.body.reason,
    details: req.body.details,
    photo: req.body.photo
  };

  try{
    const pet = await PetRequest.addPet(data);
    
    if (!pet){
      console.log("Failed to create pet request");
    };
    
  }catch (error){
    console.error(error);
  };

  res.send("Give up request submitted!");
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