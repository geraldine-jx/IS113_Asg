const path = require("path");

let adoptRequests = [];
let giveUpRequests = [];

exports.showAdoptDogPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "adopt-dog.html"));
};

exports.showGiveUpDogPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "give-up-dog.html"));
};

exports.submitAdoptionRequest = (req, res) => {
  const fields = {
    username: req.body.username,
    fullName: req.body.fullName,
    contactNo: req.body.contactNo,
    address: req.body.address,
    email: req.body.email,
    housing: req.body.housing
  };

  adoptRequests.push(fields);
  res.send("Adoption request submitted!");
};

exports.submitGiveUpRequest = (req, res) => {
  const fields = {
    name: req.body.name,
    breed: req.body.breed,
    size: req.body.size,
    age: req.body.age,
    hdbApproved: req.body.hdbApproved,
    description: req.body.description,
    photo: req.body.photo
  };

  giveUpRequests.push(fields);
  res.send("Give up request submitted!");
};