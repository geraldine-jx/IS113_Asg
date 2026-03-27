const PetRequest = require("../models/petRequest");

//Eashvar's Code:

// CREATE: show admin create give-up form
exports.showCreateGiveUpForm = (req, res) => {
  res.render("admin/giveup-create", {
    error: null,
    formData: {
      ownerName: "",
      petName: "",
      petBreed: "",
      petAge: "",
      petSize: "",
      petHdbApproved: "No",
      photo: "",
      contact: "",
      address: "",
      details: ""
    }
  });
};

// CREATE: admin creates rehome request on behalf of an owner
exports.createGiveUp = async (req, res) => {
  const formData = {
    ownerName: (req.body.ownerName || "").trim(),
    petName: (req.body.petName || "").trim(),
    petBreed: (req.body.petBreed || "").trim(),
    petAge: (req.body.petAge || "").trim(),
    petSize: (req.body.petSize || "").trim(),
    petHdbApproved: req.body.petHdbApproved === "Yes" ? "Yes" : "No",
    photo: (req.body.photo || "").trim(),
    contact: (req.body.contact || "").trim(),
    address: (req.body.address || "").trim(),
    details: (req.body.details || "").trim()
  };

  const errors = [];

  if (formData.ownerName === "") {
    errors.push("Owner name is required.");
  }

  if (formData.petName === "") {
    errors.push("Pet name is required.");
  }

  if (formData.petBreed === "") {
    errors.push("Pet breed is required.");
  }

  if (formData.petAge === "" || Number.isNaN(Number(formData.petAge)) || Number(formData.petAge) < 0) {
    errors.push("Pet age must be a valid number.");
  }

  if (formData.petSize === "") {
    errors.push("Pet size is required.");
  }

  if (formData.contact === "") {
    errors.push("Contact is required.");
  }

  if (formData.address === "") {
    errors.push("Address is required.");
  }

  if (errors.length > 0) {
    return res.status(400).render("admin/giveup-create", {
      error: errors.join("<br>"),
      formData
    });
  }

  try {
    await PetRequest.create({
      userId: req.session.userId,
      ownerName: formData.ownerName,
      requestType: "rehome",
      petName: formData.petName,
      petBreed: formData.petBreed,
      petAge: Number(formData.petAge),
      petSize: formData.petSize,
      petHdbApproved: formData.petHdbApproved,
      photo: formData.photo,
      contact: formData.contact,
      address: formData.address,
      details: formData.details,
      status: "pending"
    });

    res.redirect("/home-display/admin/giveups");
  } catch (err) {
    console.log(err);
    res.status(500).render("admin/giveup-create", {
      error: "Unable to create give-up request.",
      formData
    });
  }
};

// READ: view all rehome requests
exports.showGiveUps = async (req, res) => {
  try {
    const submissions = await PetRequest.find({ requestType: "rehome" })
      .populate("userId", "username displayName email")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/giveups", {
      submissions,
      error: null,
      message: null
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load give-up submissions");
  }
};

// READ: view one rehome request
exports.showGiveUpDetails = async (req, res) => {
  try {
    const submission = await PetRequest.findOne({
      _id: req.query.id,
      requestType: "rehome"
    })
      .populate("userId", "username displayName email contact address")
      .populate("approvedBy", "username displayName")
      .lean();

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    res.render("admin/giveup-details", { submission });
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load submission details");
  }
};

// UPDATE: approve submission
exports.approveGiveUp = async (req, res) => {
  try {
    const submission = await PetRequest.findOneAndUpdate(
      { _id: req.body.id, requestType: "rehome" },
      { status: "approved", approvedBy: req.session.userId },
      { new: true }
    );

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    res.redirect("/home-display/admin/giveups");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to approve submission");
  }
};

// UPDATE: reject submission
exports.rejectGiveUp = async (req, res) => {
  try {
    const submission = await PetRequest.findOneAndUpdate(
      { _id: req.body.id, requestType: "rehome" },
      { status: "rejected", approvedBy: req.session.userId },
      { new: true }
    );

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    res.redirect("/home-display/admin/giveups");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to reject submission");
  }
};

// DELETE: remove listing
exports.deleteGiveUp = async (req, res) => {
  try {
    const deletedSubmission = await PetRequest.findOneAndDelete({
      _id: req.body.id,
      requestType: "rehome"
    });

    if (!deletedSubmission) {
      return res.status(404).send("Submission not found");
    }

    res.redirect("/home-display/admin/giveups");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete submission");
  }
};
//End of Eashvar's Code
