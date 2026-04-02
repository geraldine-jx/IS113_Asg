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

exports.showManageRehomeRequestPage = async (req, res) => {
    const contactNo = req.body.contact;
    res.render("form/my-rehome-requests", { contactNo, message: [], success: '', existing: null});

};  

exports.showManageAdoptRequestPage = async (req, res) => {
    const contactNo = req.body.contact;
    res.render("form/my-adopt-requests", { contactNo, message: [], success: '', existing: null});

};

exports.showMyAdoptRequests = async (req, res) => {
    const userId = req.session.userId;
    try {
        const adoptList = await PetRequest.find({ userId: userId, requestType: 'adopt' });
        res.render("form/my-adopt-requests", { adoptList, message: [], success: '', existing: null });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving adopt requests");
    }
};  

exports.showMyRehomeRequests = async (req, res) => {
    const userId = req.session.userId;
    try {
        const giveupList = await PetRequest.find({ userId: userId, requestType: 'rehome' });
        res.render("form/my-rehome-requests", { giveupList, message: [], success: '', existing: null });
    } catch (error) {
        console.error(error);        
        res.status(500).send("Error retrieving give up requests");
    }
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
    return res.status(500).send("Error submitting give up request");
  };
  
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
    await PetRequest.updateOne({userId, petId}, {housing});

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
    // await PetRequest.updateOne({userId: req.body.userId, petId: req.body.petId},
    //                             {petName: req.body.petName}, {petBreed: req.body.petBreed}, 
    //                             {petSize: req.body.petSize}, {petAge: req.body.petAge}, 
    //                             {petHdbApproved: req.body.petHdbApproved}, {reason: req.body.reason}, 
    //                             {details: req.body.details}, {photo: req.body.photo});
      await PetRequest.updateOne({ userId, petId },
                                  {
                                    petName,
                                    petBreed,
                                    petSize,
                                    petAge,
                                    petHdbApproved,
                                    reason,
                                    details,
                                    photo
                                  }
  );
    res.send('Give up request successfully updated!');

  }catch (error){
    console.error(error);
    return res.status(500).send("Error updating give up request");
  };
};  

// DELETE
exports.deleteAdoptionRequest = async (req, res) => {
  const petId= req.body.petId;
  const userId= req.body.userId; 
  const status= req.body.status;

  let message = [];
  let success = "";
  if (status !== "pending") {
    console.log("Request already processed, cannot delete");
    return;
  };
  if (!petId){
    message.push("Please input a pet ID.");
    return res.render('form/manage-adopt-request', { petId, message, success, existing: null });
  }

  try{
    await PetRequest.deleteOne({userId: req.body.userId, petId: req.body.petId});
    res.send("Adoption request deleted!");
  }catch (error){
    console.error(error);
    res.status(500).send("Error deleting adoption request");
  };
};

exports.deleteGiveUpRequest = async (req, res) => {
  const petId= req.body.petId;
  const userId= req.body.userId; 
  const status= req.body.status;

  let message = [];
  let success = "";
  if (status !== "pending") {
    console.log("Request already processed, cannot delete");
    return;
  };
  if (!petId){
    message.push("Please input a pet ID.");
    return res.render('form/manage-rehome-request', { petId, message, success, existing: null });
  }

  try{
    await PetRequest.deleteOne({userId: req.body.userId, petId: req.body.petId});
    res.send("Give up request deleted!");
  }catch (error){
    console.error(error);
    res.status(500).send("Error deleting give up request");
  };
  };

