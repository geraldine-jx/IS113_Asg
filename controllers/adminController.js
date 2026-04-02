const PetRequest = require("../models/petRequest");
const Pet = require("../models/pet");
const Appointment = require("../models/appointment");

const buildCreateFormData = (body = {}) => ({
  ownerName: (body.ownerName || "").trim(),
  petName: (body.petName || "").trim(),
  petBreed: (body.petBreed || "").trim(),
  petAge: (body.petAge || "").trim(),
  petSize: (body.petSize || "").trim(),
  petHdbApproved: body.petHdbApproved === "Yes" ? "Yes" : "No",
  photo: (body.photo || "").trim(),
  contact: (body.contact || "").trim(),
  email: (body.email || "").trim(),
  address: (body.address || "").trim(),
  details: (body.details || "").trim()
});

const getAdminRemarks = (body = {}) => (body.adminRemarks || "").trim();

//Eashvar's Code:

// CREATE: show admin create give-up form
exports.showCreateGiveUpForm = (req, res) => {
  res.render("admin/giveup-create", {
    error: null,
    formData: buildCreateFormData()
  });
};

// CREATE: admin creates rehome request on behalf of an owner
exports.createGiveUp = async (req, res) => {
  const formData = buildCreateFormData(req.body);

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

  if (formData.email === "") {
    errors.push("Email is required.");
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
      email: formData.email,
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
    const adminRemarks = getAdminRemarks(req.body);
    const submission = await PetRequest.findOne({
      _id: req.body.id,
      requestType: "rehome"
    });

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    if (submission.status !== "pending") {
      return res.status(400).send("Only pending submissions can be approved");
    }

    let listing = null;

    if (submission.petId) {
      listing = await Pet.findById(submission.petId);
    }

    if (!listing) {
      listing = await Pet.create({
        name: submission.petName || "Unnamed Pet",
        breed: submission.petBreed || "Unknown Breed",
        size: submission.petSize || "Unknown Size",
        age: Number.isFinite(submission.petAge) ? submission.petAge : 0,
        hdbApproved: submission.petHdbApproved === "Yes" ? "Yes" : "No",
        description: submission.details || "",
        image: submission.photo || "",
        status: "available",
        listingType: "rehome",
        createdBy: req.session.userId
      });
    }

    submission.status = "approved";
    submission.approvedBy = req.session.userId;
    submission.adminRemarks = adminRemarks;
    submission.petId = listing._id;
    await submission.save();

    res.redirect("/home-display/admin/giveups");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to approve submission");
  }
};

// UPDATE: reject submission
exports.rejectGiveUp = async (req, res) => {
  try {
    const submission = await PetRequest.findOne({
      _id: req.body.id,
      requestType: "rehome"
    });

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    if (submission.status !== "pending") {
      return res.status(400).send("Only pending submissions can be rejected");
    }

    submission.status = "rejected";
    submission.approvedBy = req.session.userId;
    submission.adminRemarks = getAdminRemarks(req.body);
    await submission.save();

    if (submission.appointmentId) {
      await Appointment.deleteAppointmentById(submission.appointmentId);
    }

    if (submission.contact) {
      await Appointment.deleteAppointmentsByContactAndType(submission.contact, "Give Up");
    }

    res.redirect("/home-display/admin/giveups");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to reject submission");
  }
};

// READ: view all adoption listings
exports.showAdoptionListings = async (req, res) => {
  try {
    const listings = await Pet.find()
      .populate("createdBy", "username displayName email")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/adoption-listings", {
      listings
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load adoption listings");
  }
};

// DELETE: remove an adoption listing
exports.deleteAdoptionListing = async (req, res) => {
  try {
    const deletedListing = await Pet.findByIdAndDelete(req.body.id);

    if (!deletedListing) {
      return res.status(404).send("Listing not found");
    }

    await PetRequest.updateMany(
      { petId: deletedListing._id },
      { $unset: { petId: 1 } }
    );

    res.redirect("/home-display/admin/listings");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete adoption listing");
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

    if (deletedSubmission.appointmentId) {
      await Appointment.deleteAppointmentById(deletedSubmission.appointmentId);
    }

    if (deletedSubmission.contact) {
      await Appointment.deleteAppointmentsByContactAndType(deletedSubmission.contact, "Give Up");
    }

    if (deletedSubmission.petId) {
      await Pet.findByIdAndDelete(deletedSubmission.petId);
    }

    res.redirect("/home-display/admin/giveups");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete submission");
  }
};
//End of Eashvar's Code

// Start of Matrix's code

// ─── ADOPTION REQUEST CRUD (Admin) ───────────────────────────────────────────

// CREATE: show admin create adoption form
exports.showCreateAdoptionForm = (req, res) => {
  res.render("admin/admin-adoption-create", {
    error: null,
    formData: {
      ownerName: "",
      petName: "",
      petId: "",
      contact: "",
      email: "",
      address: "",
      housing: "",
      details: ""
    }
  });
};

// CREATE: admin creates adoption request on behalf of an owner
exports.createAdoption = async (req, res) => {
  const formData = {
    ownerName: (req.body.ownerName || "").trim(),
    petName:   (req.body.petName   || "").trim(),
    petId:     (req.body.petId     || "").trim(),
    contact:   (req.body.contact   || "").trim(),
    email:     (req.body.email     || "").trim(),
    address:   (req.body.address   || "").trim(),
    housing:   (req.body.housing   || "").trim(),
    details:   (req.body.details   || "").trim()
  };

  const errors = [];

  if (formData.ownerName === "") errors.push("Owner name is required.");
  if (formData.petName   === "") errors.push("Pet name is required.");
  if (formData.contact   === "") errors.push("Contact is required.");
  if (formData.email     === "") errors.push("Email is required.");
  if (formData.address   === "") errors.push("Address is required.");
  if (formData.housing   === "") errors.push("Housing type is required.");

  if (errors.length > 0) {
    return res.status(400).render("admin/admin-adoption-create", {
      error: errors.join("<br>"),
      formData
    });
  }

  try {
    await PetRequest.create({
      userId:      req.session.userId,
      ownerName:   formData.ownerName,
      requestType: "adopt",
      petName:     formData.petName,
      petId:       formData.petId || undefined,
      contact:     formData.contact,
      email:       formData.email,
      address:     formData.address,
      housing:     formData.housing,
      details:     formData.details,
      status:      "pending"
    });

    res.redirect("/home-display/admin/adoptions");
  } catch (err) {
    console.log(err);
    res.status(500).render("admin/admin-adoption-create", {
      error: "Unable to create adoption request.",
      formData
    });
  }
};

// READ: view all adoption requests
exports.showAdoptions = async (req, res) => {
  try {
    const submissions = await PetRequest.find({ requestType: "adopt" })
      .populate("userId", "username displayName email")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/admin-adoption", {
      submissions,
      error: null,
      message: null
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load adoption submissions");
  }
};

// READ: view one adoption request
exports.showAdoptionDetails = async (req, res) => {
  try {
    const submission = await PetRequest.findOne({
      _id: req.query.id,
      requestType: "adopt"
    })
      .populate("userId", "username displayName email contact address")
      .populate("approvedBy", "username displayName")
      .lean();

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    res.render("admin/admin-adoption-details", { submission });
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load submission details");
  }
};

// READ: view all approved adoption requests
exports.showApprovedAdoptions = async (req, res) => {
  try {
    const submissions = await PetRequest.find({ 
      requestType: "adopt",
      status: "approved" 
    })
      .populate("userId", "username displayName email")
      .populate("approvedBy", "username displayName")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/admin-approved-adoptions", {
      submissions,
      error: null,
      message: null
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load approved adoption requests");
  }
};

// UPDATE: approve adoption request
exports.approveAdoption = async (req, res) => {
  try {
    const submission = await PetRequest.findOne({
      _id: req.body.id,
      requestType: "adopt"
    });

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    if (submission.status !== "pending") {
      return res.status(400).send("Only pending submissions can be approved");
    }

    // Update the pet's status to adopted
    if (submission.petId) {
      await Pet.findByIdAndUpdate(submission.petId, { status: "adopted" });

      await PetRequest.updateMany(
        {
          petId: submission.petId,
          requestType: "adopt",
          _id: { $ne: submission._id },
          status: "pending"
        },
        {
          status: "rejected",
          adminRemarks: "Another adoption request for this pet was approved."
        }
      );
    }

    submission.status = "approved";
    submission.approvedBy = req.session.userId;
    await submission.save();

    res.redirect("/home-display/admin/adoptions");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to approve submission");
  }
};

// UPDATE: reject adoption request
exports.rejectAdoption = async (req, res) => {
  try {
    const submission = await PetRequest.findOne({
      _id: req.body.id,
      requestType: "adopt"
    });

    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    if (submission.status !== "pending") {
      return res.status(400).send("Only pending submissions can be rejected");
    }

    submission.status = "rejected";
    submission.approvedBy = req.session.userId;
    await submission.save();

    res.redirect("/home-display/admin/adoptions");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to reject submission");
  }
};

// DELETE: remove adoption request
exports.deleteAdoption = async (req, res) => {
  try {
    const deleted = await PetRequest.findOneAndDelete({
      _id: req.body.id,
      requestType: "adopt"
    });

    if (!deleted) {
      return res.status(404).send("Submission not found");
    }

    // If the deleted request was approved, revert the pet status back to available
    if (deleted.status === "approved" && deleted.petId) {
      await Pet.findByIdAndUpdate(deleted.petId, { status: "available" });
    }

    res.redirect("/home-display/admin/adoptions");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete submission");
  }
};
