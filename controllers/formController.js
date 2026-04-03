const User = require("../models/user");
const Pet = require("../models/pet");
const PetRequest = require("../models/petRequest");

const normalizeContact = (value = "") => value.replaceAll(" ", "").trim();

const buildAdoptFormData = (body = {}) => ({
  housing: body.housing || "",
  housingOther: body.housingOther || ""
});

const buildGiveUpFormData = (body = {}) => ({
  petName: body.petName || "",
  petBreed: body.petBreed || "",
  petSize: body.petSize || "",
  petAge: body.petAge || "",
  petHdbApproved: body.petHdbApproved || "No",
  details: body.details || "",
  reason: body.reason || "",
  photo: body.photo || ""
});

const renderAdoptPage = (res, options = {}) => {
  res.render("form/adopt-dog", {
    petId: options.petId || "",
    petName: options.petName || "",
    error: options.error || null,
    formData: options.formData || buildAdoptFormData()
  });
};

const renderGiveUpPage = (res, options = {}) => {
  res.render("form/give-up-dog", {
    error: options.error || null,
    message: options.message || [],
    success: options.success || "",
    formData: options.formData || buildGiveUpFormData()
  });
};

const renderManageAdoptPage = (res, options = {}) => {
  res.render("form/manage-adopt-request", {
    existing: options.existing || null,
    message: options.message || [],
    success: options.success || ""
  });
};

const renderManageRehomePage = (res, options = {}) => {
  res.render("form/manage-rehome-request", {
    existing: options.existing || null,
    message: options.message || [],
    success: options.success || ""
  });
};

exports.showAdoptDogPage = async (req, res) => {
  const petId = req.query.petId || "";

  if (!petId) {
    return renderAdoptPage(res, {
      error: "Please choose a pet from the home page before submitting an adoption request."
    });
  }

  try {
    const pet = await Pet.findById(petId).lean();

    if (!pet) {
      return renderAdoptPage(res, {
        error: "Selected pet was not found."
      });
    }

    renderAdoptPage(res, {
      petId: pet._id.toString(),
      petName: pet.name
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading adoption form");
  }
};

exports.showGiveUpDogPage = (req, res) => {
  renderGiveUpPage(res);
};

exports.showManageRehomeRequestPage = async (req, res) => {
  const contact = normalizeContact(req.body?.contact || "");

  if (contact === "") {
    return renderManageRehomePage(res);
  }

  try {
    const existing = await PetRequest.findOne({
      userId: req.session.userId,
      requestType: "rehome",
      contact
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!existing) {
      return renderManageRehomePage(res, {
        message: ["No give-up request found for this contact number."]
      });
    }

    renderManageRehomePage(res, { existing });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading give up request");
  }
};

exports.showManageAdoptRequestPage = async (req, res) => {
  const contact = normalizeContact(req.body?.contact || "");

  if (contact === "") {
    return renderManageAdoptPage(res);
  }

  try {
    const existing = await PetRequest.findOne({
      userId: req.session.userId,
      requestType: "adopt",
      contact
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!existing) {
      return renderManageAdoptPage(res, {
        message: ["No adoption request found for this contact number."]
      });
    }

    renderManageAdoptPage(res, { existing });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading adoption request");
  }
};

exports.showMyAdoptRequests = async (req, res) => {
  try {
    const adoptList = await PetRequest.find({
      userId: req.session.userId,
      requestType: "adopt"
    }).sort({ createdAt: -1 });

    res.render("form/my-adopt-requests", { adoptList, success: "" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving adopt requests");
  }
};

exports.showMyRehomeRequests = async (req, res) => {
  try {
    const giveupList = await PetRequest.find({
      userId: req.session.userId,
      requestType: "rehome"
    }).sort({ createdAt: -1 });

    res.render("form/my-rehome-requests", { giveupList, success: "" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving give up requests");
  }
};

exports.getUserDetails = async (req, res) => {
  try {
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

exports.submitAdoptionRequest = async (req, res) => {
  try {
    const userId = req.session.userId;
    const username = (req.body.username || "").trim();
    const ownerName = (req.body.ownerName || "").trim();
    const contact = normalizeContact(req.body.contact || "");
    const address = (req.body.address || "").trim();
    const email = (req.body.email || "").trim();
    const petId = (req.body.petId || "").trim();
    const housing = req.body.housing === "others"
      ? (req.body.housingOther || "").trim()
      : (req.body.housing || "").trim();

    const pet = petId ? await Pet.findById(petId).lean() : null;

    if (!userId || !pet || !contact || !address || !email || !housing) {
        return renderAdoptPage(res, {
            petId,
            petName: pet?.name || "",
        error: "Please complete all required fields before submitting the adoption request.",
        formData: buildAdoptFormData(req.body)
        });
    }

    req.session.pendingAdoptionRequest = {
      userId,
      username,
      ownerName,
      contact,
      address,
      email,
      petName: pet.name,
      petId: pet._id,
      housing,
      requestType: "adopt",
      status: "pending"
    };

    res.redirect("/appointment");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error submitting adoption request");
  }
};

exports.submitGiveUpRequest = async (req, res) => {
  try {
    const userId = req.session.userId;
    const username = (req.body.username || "").trim();
    const ownerName = (req.body.ownerName || "").trim();
    const contact = normalizeContact(req.body.contact || "");
    const address = (req.body.address || "").trim();
    const email = (req.body.email || "").trim();
    const petName = (req.body.petName || "").trim();
    const petBreed = (req.body.petBreed || "").trim();
    const petSize = (req.body.petSize || "").trim().toUpperCase();
    const petAge = (req.body.petAge || "").trim();
    const normalizedApproval = (req.body.petHdbApproved || "").trim().toLowerCase();
    const petHdbApproved = normalizedApproval === "yes" ? "Yes" : normalizedApproval === "no" ? "No" : "";
    const reason = (req.body.reason || "").trim();
    const details = (req.body.details || "").trim();
    const photo = (req.body.photo || "").trim();
    const numericPetAge = Number(petAge);

    if (!userId || !ownerName || !contact || !email || !address || !petName || !petBreed || !petSize || !petAge || !petHdbApproved) {
      return renderGiveUpPage(res, {
        error: "Please complete all required fields before submitting the give-up request.",
        formData: buildGiveUpFormData({
          ...req.body,
          petSize,
          petHdbApproved: petHdbApproved || req.body.petHdbApproved
        })
      });
    }

    if (!["S", "M", "L"].includes(petSize)) {
      return renderGiveUpPage(res, {
        error: "Pet size must be S, M, or L.",
        formData: buildGiveUpFormData({
          ...req.body,
          petSize,
          petHdbApproved
        })
      });
    }

    if (!Number.isFinite(numericPetAge) || numericPetAge < 0) {
      return renderGiveUpPage(res, {
        error: "Pet age must be a valid non-negative number.",
        formData: buildGiveUpFormData({
          ...req.body,
          petSize,
          petHdbApproved
        })
      });
    }

    req.session.pendingGiveUpRequest = {
      userId,
      username,
      ownerName,
      contact,
      address,
      email,
      petName,
      petBreed,
      petSize,
      petAge: numericPetAge,
      petHdbApproved,
      reason,
      details,
      photo,
      requestType: "rehome",
      status: "pending"
    };

    res.redirect("/appointment");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error submitting give up request");
  }
};

exports.updateAdoptionRequest = async (req, res) => {
  const requestId = req.body.id;
  const housing = req.body.housing === "others"
    ? (req.body.housingOther || "").trim()
    : (req.body.housing || "").trim();

  if (!requestId || !housing) {
    return renderManageAdoptPage(res, {
      message: ["Please load a request and provide a housing value before updating."]
    });
  }

  try {
    const request = await PetRequest.findOne({
      _id: requestId,
      userId: req.session.userId,
      requestType: "adopt"
    }).lean();

    if (!request) {
      return renderManageAdoptPage(res, {
        message: ["Adoption request not found."]
      });
    }

    if (request.status !== "pending") {
      return renderManageAdoptPage(res, {
        existing: request,
        message: ["Only pending requests can be updated."]
      });
    }

    await PetRequest.updateOne({ _id: requestId }, { housing });
    const updated = await PetRequest.findById(requestId).lean();

    renderManageAdoptPage(res, {
      existing: updated,
      success: "Adoption request updated successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating adoption request");
  }
};

exports.updateGiveUpRequest = async (req, res) => {
  const requestId = req.body.id;
  const petName = (req.body.petName || "").trim();
  const petBreed = (req.body.petBreed || "").trim();
  const petSize = (req.body.petSize || "").trim();
  const petAge = (req.body.petAge || "").trim();
  const petHdbApproved = (req.body.petHdbApproved || "").trim();
  const reason = (req.body.reason || "").trim();
  const details = (req.body.details || "").trim();
  const photo = (req.body.photo || "").trim();

  const message = [];

  if (!requestId) message.push("Please load a request before updating.");
  if (!petName) message.push("Please input a pet name.");
  if (!petBreed) message.push("Please input a pet breed.");
  if (!petSize) message.push("Please input a pet size.");
  if (!petAge) message.push("Please input a pet age.");
  if (!petHdbApproved) message.push("Please specify if the pet is HDB approved.");
  if (!reason) message.push("Please input a reason.");
  if (!details) message.push("Please input some details.");

  if (message.length > 0) {
    return renderManageRehomePage(res, { message });
  }

  try {
    const request = await PetRequest.findOne({
      _id: requestId,
      userId: req.session.userId,
      requestType: "rehome"
    }).lean();

    if (!request) {
      return renderManageRehomePage(res, {
        message: ["Give-up request not found."]
      });
    }

    if (request.status !== "pending") {
      return renderManageRehomePage(res, {
        existing: request,
        message: ["Only pending requests can be updated."]
      });
    }

    await PetRequest.updateOne(
      { _id: requestId },
      {
        petName,
        petBreed,
        petSize,
        petAge: Number(petAge),
        petHdbApproved,
        reason,
        details,
        photo
      }
    );

    const updated = await PetRequest.findById(requestId).lean();
    renderManageRehomePage(res, {
      existing: updated,
      success: "Give-up request updated successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating give up request");
  }
};

exports.deleteAdoptionRequest = async (req, res) => {
  const requestId = req.body.id;

  if (!requestId) {
    return renderManageAdoptPage(res, {
      message: ["Please load a request before deleting."]
    });
  }

  try {
    const request = await PetRequest.findOne({
      _id: requestId,
      userId: req.session.userId,
      requestType: "adopt"
    }).lean();

    if (!request) {
      return renderManageAdoptPage(res, {
        message: ["Adoption request not found."]
      });
    }

    if (request.status !== "pending") {
      return renderManageAdoptPage(res, {
        existing: request,
        message: ["Only pending requests can be deleted."]
      });
    }

    await PetRequest.deleteOne({ _id: requestId });
    renderManageAdoptPage(res, {
      success: "Adoption request deleted successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting adoption request");
  }
};

exports.deleteGiveUpRequest = async (req, res) => {
  const requestId = req.body.id;

  if (!requestId) {
    return renderManageRehomePage(res, {
      message: ["Please load a request before deleting."]
    });
  }

  try {
    const request = await PetRequest.findOne({
      _id: requestId,
      userId: req.session.userId,
      requestType: "rehome"
    }).lean();

    if (!request) {
      return renderManageRehomePage(res, {
        message: ["Give-up request not found."]
      });
    }

    if (request.status !== "pending") {
      return renderManageRehomePage(res, {
        existing: request,
        message: ["Only pending requests can be deleted."]
      });
    }

    await PetRequest.deleteOne({ _id: requestId });
    renderManageRehomePage(res, {
      success: "Give-up request deleted successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting give up request");
  }
};
