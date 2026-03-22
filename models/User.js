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
        default: Date.now
    },

    apiKey: {
        type: String,
    },

    apiKeys: [{
        name: String,
        keyHash: String,
        keyPrefix: String,
        permissions: {
            type: [String],
            enum: ['read', 'write', 'delete'],
            default: ['read', 'write', 'delete']
        },
        createdAt: { type: Date, default: Date.now },
        lastUsed: { type: Date },
        requestCount: { type: Number, default: 0 },
        revoked: { type: Boolean, default: false }
    }],

    usageCount: {
        type: Number,
        default: 0
    },
    usageLimit: {
        type: Number,
        default: 1000
    }
});

module.exports = mongoose.model("User", userSchema);