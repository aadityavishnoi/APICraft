const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    collectionName: {
        type: String,
        required: true
    },

    fields: [String],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// CAT1-A: Prevent duplicate collection names per user at the DB level
CollectionSchema.index({ userId: 1, collectionName: 1 }, { unique: true });

module.exports = mongoose.model("Collection", CollectionSchema);