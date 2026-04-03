const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female"]
    },
    age: {
        type: Number,
        required: true
    },
    hdbApproved: {
        type: String,
        enum: ["Yes", "No"],
        default: "No"
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ["available", "pending", "adopted", "removed"],
        default: "available"
    },
    listingType: {
        type: String,
        enum: ["adoption", "rehome"],
        default: "adoption"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }
}, {
    timestamps: true
});

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;
