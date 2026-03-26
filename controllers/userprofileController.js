const bcrypt = require("bcrypt");
const User = require("../models/user");

exports.showProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.send("User not found");
    }

    res.render("user/profile", {
      user,
      error: null,
      message: null
    });
  } catch (err) {
    res.send(err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.send("User not found");
    }

    let { displayName, bio, contact, address } = req.body;
    const errors = [];

    if (!displayName || displayName.trim() === "") {
      errors.push("Display Name cannot be blank.");
    }

    contact = (contact || "").replaceAll(" ", "");

    if (!(contact.startsWith("8") || contact.startsWith("9")) || contact.length !== 8) {
      errors.push("Contact must be a Singapore mobile number.");
    }

    if (!address || address.trim() === "") {
      errors.push("Address cannot be blank.");
    }

    if (errors.length > 0) {
      return res.render("user/profile", {
        user: {
          ...user.toObject(),
          displayName,
          bio,
          contact,
          address
        },
        error: errors.join("<br>"),
        message: null
      });
    }

    user.displayName = displayName.trim();
    user.bio = bio;
    user.contact = contact;
    user.address = address.trim();

    await user.save();

    res.render("user/profile", {
      user,
      error: null,
      message: "Profile updated successfully."
    });
  } catch (err) {
    res.send(err.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.send("User not found");
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const errors = [];

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      errors.push("Please fill in all password fields.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      errors.push("Current password is incorrect.");
    }

    if (newPassword !== confirmNewPassword) {
      errors.push("New passwords do not match.");
    }

    if (newPassword === currentPassword) {
      errors.push("New password must be different from current password.");
    }

    if (errors.length > 0) {
      return res.render("user/profile", {
        user,
        error: errors.join("<br>"),
        message: null
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.render("user/profile", {
      user,
      error: null,
      message: "Password changed successfully."
    });
  } catch (err) {
    res.send(err.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.send("User not found");
    }

    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.render("user/profile", {
        user,
        error: "Please enter your current password.",
        message: null
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.render("user/profile", {
        user,
        error: "Current password is incorrect. Account not deleted.",
        message: null
      });
    }

    await User.findByIdAndDelete(user._id);

    req.session.destroy(() => {
      res.redirect("/mainpage");
    });
  } catch (err) {
    res.send(err.message);
  }
};