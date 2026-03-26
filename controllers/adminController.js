const PetRequest = require("../models/petRequest");

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
