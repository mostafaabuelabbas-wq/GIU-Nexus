const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    profilePicture: {
        type: String
    },

    bio: {
        type: String
    },
    skills: {
        type: [String],
        default: []
    },

});

module.exports = mongoose.model("User", userSchema);