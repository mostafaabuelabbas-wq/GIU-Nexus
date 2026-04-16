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
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
    
});
const bcrypt = require("bcryptjs");

userSchema.pre("save", async function(next) {

    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

module.exports = mongoose.model("User", userSchema);