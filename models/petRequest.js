const mongoose = require("mongoose");

const petRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet"
    },
    requestType: {
        type: String,
        enum: ["adopt", "rehome"],
        required: true
    },
    petName: {
        type: String
    },
    petBreed: {
        type: String
    },
    petAge: {
        type: Number
    },
    petSize: {
        type:String
    },
    petHdbApproved: {
        type: String,
        enum: ['Yes','No']
    },
    photo: {
        type:String
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    reason: {
        type: String
    },
    details: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    adminRemarks: {
        type: String
    }
}, {
    timestamps: true
});

const PetRequest = mongoose.model("PetRequest", petRequestSchema);

module.exports = PetRequest;
