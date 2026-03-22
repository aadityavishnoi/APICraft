const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    collectionName: {
        type: String,
        required: true,
        trim: true
    },

    fields: [{
        type: String,
        required: true
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

CollectionSchema.index(
    { userId: 1, collectionName: 1 },
    { unique: true }
);

module.exports = mongoose.model("Collection", CollectionSchema);