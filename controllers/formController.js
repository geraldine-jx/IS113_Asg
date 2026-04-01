const path = require("path");
const User = require("../models/user");
const PetRequest = require("../models/petRequest.js");


exports.showAdoptDogPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "adopt-dog.html"));
};

exports.showGiveUpDogPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "give-up-dog.html"));
};

exports.showManageRehomeRequestPage = async (req, res) => {
    const contactNo = req.body.contact;
    res.render("form/my-rehome-requests", { userId, message: [], success: '', existing: null});

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
      const username = req.body.username;
      const displayName= req.body.displayName;
      const contact = req.body.contact;
      const address= req.body.address;
      const email= req.body.email;
      const petName= req.body.petName;
      const housing = req.body.housing;
      const requestType= "adopt";
      const status= "pending";

      const newPet = {
        userId,
        username,
        displayName,
        contact,
        address,
        email,
        petName,
        petId,
        housing,
        requestType: 'adopt',
        status: 'pending'

      }
      
      await PetRequest.create(newPet);
 
      console.log('request submitted successfully!');
      // return res.send('Request submitted successfully!');
      return res.redirect('/appointment');


  } catch (error){
    console.error(error);
    return res.status(500).send("Error submitting adoption request");
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
  try {      
    const userId = req.session.userId;
    const username = req.body.username;
    const displayName= req.body.displayName;
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
        displayName,
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
  
 
    await PetRequest.create(newPet);
    
    console.log('Request submitted successfully!');
    // return res.send('Request submitted successfully!');
    return res.redirect('/appointment');
  }catch (error){
    console.error(error);
    return res.status(500).send("Error submitting give up request");
  };

  res.send("Give up request submitted!");
};

// UPDATE
exports.updateAdoptionRequest = async (req, res) => {
  const userId= req.body.userId;
  const petId= req.body.petId;
  const housing= req.body.housing;
  const status= req.body.status;
  

  if (status !== "pending") {
      console.log("Request already processed, cannot update");
      return;
    };
  try{
    await PetRequest.updateOne({userId: req.body.userId, petId: req.body.petId}, {housing: req.body.housing});

    res.send('Adoption request successfully updated!');
    

  }catch (error){
    console.error(error);
    return res.status(500).send("Error updating adoption request");
  };


};

exports.updateGiveUpRequest = async (req, res) => {

  const userId= req.body.userId;
  const petId= req.body.petId;
  const petName= req.body.petName;
  const petBreed= req.body.petBreed;
  const petSize= req.body.petSize;
  const petAge= req.body.petAge;
  const petHdbApproved= req.body.petHdbApproved;
  const reason= req.body.reason;
  const details= req.body.details;
  const photo= req.body.photo;
  const status= req.body.status


  let message = [];
  let success = "";

  if (!petName) {
    message.push("Please input a pet name.");
  }

  if (!petBreed) {
    message.push("Please input a pet breed.");
  }

  if (!petSize) {
    message.push("Please input a pet size.");
  }

  if (!petAge) {
    message.push("Please input a pet age.");
  }

  if (!petHdbApproved) {
    message.push("Please specify if the pet is HDB approved.");
  }
  
  if (!reason) {
    message.push("Please input a reason.");
  } 

  if (!details) { 
    message.push("Please input some details.");
  }


  if (message.length > 0) {
      return res.render("appointment/manage-rehome-request", { contact, message, success, existing: null });
  }

  if (status !== "pending") {
      console.log("Request already processed, cannot update");
      return;
    };
  try{
    await PetRequest.updateOne({userId: req.body.userId, petId: req.body.petId},
                                {petName: req.body.petName}, {petBreed: req.body.petBreed}, 
                                {petSize: req.body.petSize}, {petAge: req.body.petAge}, 
                                {petHdbApproved: req.body.petHdbApproved}, {reason: req.body.reason}, 
                                {details: req.body.details}, {photo: req.body.photo});
    res.send('Give up request successfully updated!');

  }catch (error){
    console.error(error);
    return res.status(500).send("Error updating give up request");
  };
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