const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    usertype: {
        type: String
    },

    employeeID: {
        type: String
    },

    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    displayName: {
        type: String
    },
    contact: {
        type: String
    },
    address: {
        type: String
    },
    bio: {
        type: String
    },
    dateJoined: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual("formattedDateJoined").get(function () {
    if (!this.dateJoined) {
        return "";
    }

    return this.dateJoined.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
