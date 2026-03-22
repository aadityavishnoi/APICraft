const mongoose = require("mongoose");

const apiLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    collectionName: String,
    method: String,
    status: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// efficiently query logs by user and sort by newest
apiLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ApiLog", apiLogSchema);