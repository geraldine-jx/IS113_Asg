const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    employeeID: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    isRegistered: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Employee", employeeSchema);