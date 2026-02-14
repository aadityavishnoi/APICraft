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
        default: Date.now()
    }
});

module.exports = mongoose.model("Collection", CollectionSchema);