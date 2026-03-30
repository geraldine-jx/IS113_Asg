const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
    user: {
        type: String,
        ref: "User",
        required: true
    },
    pet: { 
        type: String,
        ref: "Pet",
        required: true
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// prevent duplicate favouriting same pet twice
favouriteSchema.index({ user: 1, pet: 1 }, { unique: true });
const Favourite = mongoose.model("Favourite", favouriteSchema);

module.exports = Favourite;
