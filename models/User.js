const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: String,

    email: {
        type: String,
        unique: true
    },

    password: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now()
    },

    apiKey: {
        type: String,
    },

    usageCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("User", userSchema);