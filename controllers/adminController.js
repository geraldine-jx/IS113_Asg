const PetRequest = require("../models/petRequest");
const Pet = require("../models/pet");
const Favourite = require("../models/favourite");

const escapeCsv = (value) => {
  const stringValue = value == null ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const calculateAnalytics = ({ pets, favourites, adoptionRequests }) => {
  // Track pets by id so favourite and adoption records can be mapped back to a breed/name.
  const petById = new Map();
  // Track demand metrics at the breed level for cards, insights, and breed charts.
  const breedStatsMap = new Map();
  // Track demand metrics at the individual pet level for "most applied pets".
  const petDemandMap = new Map();

  const ensureBreedStats = (breed) => {
    const normalizedBreed = (breed || "Unknown").trim() || "Unknown";
    if (!breedStatsMap.has(normalizedBreed)) {
      breedStatsMap.set(normalizedBreed, {
        breed: normalizedBreed,
        favourites: 0,
        views: 0,
        applications: 0,
        approved: 0
      });
    }
    return breedStatsMap.get(normalizedBreed);
  };

  pets.forEach((pet) => {
    petById.set(String(pet._id), pet);
    ensureBreedStats(pet.breed);
  });

  // Favourite records are the source of "most favourited breeds" and total view counts.
  // Each favourite stores the pet id plus a viewCount counter.
  favourites.forEach((favourite) => {
    const pet = petById.get(String(favourite.pet));
    const breedStats = ensureBreedStats(pet?.breed);
    breedStats.favourites += 1;
    breedStats.views += Number(favourite.viewCount || 0);
  });

  // Adoption requests are the source of "most applied pets" and adoption success rate.
  // We only pass in requestType = "adopt" records when calling this helper.
  adoptionRequests.forEach((request) => {
    const pet = request.petId ? petById.get(String(request.petId)) : null;
    const breed = pet?.breed || request.petBreed || "Unknown";
    const petLabel = pet?.name || request.petName || "Unknown Pet";
    const petKey = request.petId ? String(request.petId) : `${petLabel}:${breed}`;

    const breedStats = ensureBreedStats(breed);
    breedStats.applications += 1;

    if (request.status === "approved") {
      breedStats.approved += 1;
    }

    if (!petDemandMap.has(petKey)) {
      petDemandMap.set(petKey, {
        petKey,
        petName: petLabel,
        breed: breed || "Unknown",
        applications: 0,
        approved: 0
      });
    }

    const petDemand = petDemandMap.get(petKey);
    petDemand.applications += 1;

    if (request.status === "approved") {
      petDemand.approved += 1;
    }
  });

  const breedStats = Array.from(breedStatsMap.values())
    .map((item) => ({
      ...item,
      adoptionRate: item.applications > 0 ? (item.approved / item.applications) * 100 : 0
    }))
    .sort((a, b) => b.favourites - a.favourites || b.views - a.views || a.breed.localeCompare(b.breed));

  const petDemandStats = Array.from(petDemandMap.values())
    .sort((a, b) => b.applications - a.applications || a.petName.localeCompare(b.petName));

  const totalApplications = adoptionRequests.length;
  const totalApproved = adoptionRequests.filter((request) => request.status === "approved").length;
  const totalFavourites = favourites.length;
  const totalViews = favourites.reduce((sum, favourite) => sum + Number(favourite.viewCount || 0), 0);
  // Success rate = approved adoption requests / all adoption requests.
  const adoptionSuccessRate = totalApplications > 0 ? (totalApproved / totalApplications) * 100 : 0;

  const topFavouritedBreed = breedStats[0] || null;
  const topViewedBreed = [...breedStats].sort((a, b) => b.views - a.views || a.breed.localeCompare(b.breed))[0] || null;
  const bestAdoptionBreed = breedStats
    .filter((breed) => breed.applications > 0)
    .sort((a, b) => b.adoptionRate - a.adoptionRate || b.approved - a.approved || a.breed.localeCompare(b.breed))[0] || null;

  return {
    summary: {
      totalPets: pets.length,
      totalFavourites,
      totalViews,
      totalApplications,
      totalApproved,
      adoptionSuccessRate
    },
    insights: {
      topFavouritedBreed,
      topViewedBreed,
      bestAdoptionBreed
    },
    breedStats,
    petDemandStats
  };
};

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
      createdByAdmin: req.session.userId,
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
      .populate("createdByAdmin", "username displayName email")
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
      .populate("createdByAdmin", "username displayName email")
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
      createdByAdmin: req.session.userId,
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
      .populate("createdByAdmin", "username displayName email")
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
      .populate("createdByAdmin", "username displayName email")
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
      .populate("createdByAdmin", "username displayName email")
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

exports.showAnalyticsDashboard = async (req, res) => {
  try {
    // Fetch the three collections that drive the analytics page:
    // 1. Pet: source of pet names and breeds
    // 2. Favourite: source of favourites + view counters
    // 3. PetRequest (adopt only): source of application volume + approval outcomes
    const [pets, favourites, adoptionRequests] = await Promise.all([
      Pet.find().select("name breed status").lean(),
      Favourite.find().select("pet viewCount").lean(),
      PetRequest.find({ requestType: "adopt" }).select("petId petName petBreed status").lean()
    ]);

    const analytics = calculateAnalytics({ pets, favourites, adoptionRequests });

    res.render("admin/admin-analytics", analytics);
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load analytics dashboard");
  }
};

exports.downloadAnalyticsCsv = async (req, res) => {
  try {
    // Export uses the same aggregation path as the dashboard so CSV numbers
    // stay aligned with the cards/charts shown in the UI.
    const [pets, favourites, adoptionRequests] = await Promise.all([
      Pet.find().select("name breed status").lean(),
      Favourite.find().select("pet viewCount").lean(),
      PetRequest.find({ requestType: "adopt" }).select("petId petName petBreed status").lean()
    ]);

    const analytics = calculateAnalytics({ pets, favourites, adoptionRequests });

    const lines = [
      "section,metric,value",
      ["summary", "total_pets", analytics.summary.totalPets],
      ["summary", "total_favourites", analytics.summary.totalFavourites],
      ["summary", "total_views", analytics.summary.totalViews],
      ["summary", "total_adoption_applications", analytics.summary.totalApplications],
      ["summary", "total_approved_adoptions", analytics.summary.totalApproved],
      ["summary", "adoption_success_rate_percent", analytics.summary.adoptionSuccessRate.toFixed(2)]
    ].map((row) => Array.isArray(row) ? row.map(escapeCsv).join(",") : row);

    lines.push("");
    lines.push(["breed", "breed", "favourites", "views", "applications", "approved", "adoption_rate_percent"].map(escapeCsv).join(","));
    analytics.breedStats.forEach((breed) => {
      lines.push([
        "breed",
        breed.breed,
        breed.favourites,
        breed.views,
        breed.applications,
        breed.approved,
        breed.adoptionRate.toFixed(2)
      ].map(escapeCsv).join(","));
    });

    lines.push("");
    lines.push(["pet", "pet_name", "breed", "applications", "approved"].map(escapeCsv).join(","));
    analytics.petDemandStats.forEach((petDemand) => {
      lines.push([
        "pet",
        petDemand.petName,
        petDemand.breed,
        petDemand.applications,
        petDemand.approved
      ].map(escapeCsv).join(","));
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="pet-demand-analytics.csv"');
    res.send(lines.join("\n"));
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to export analytics CSV");
  }
};
