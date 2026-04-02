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
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    },
    username: {
        type: String
    },
    ownerName: {
        type: String
    },
    requestType: {
        type: String,
        enum: ["adopt", "rehome"],
        required: true,
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
        enum: ['Yes','No', 'yes', 'no', 'na']
    },
    photo: {
        type:String
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    housing: {
        type: String
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
