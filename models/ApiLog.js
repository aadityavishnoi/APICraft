const mongoose = require("mongoose");
const { collection } = require("./Collection");

const apiLogSchema = new mongoose.Schema ({
    userId: String,
    collectionName: String,
    method: String,
    status: Number,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("ApiLog", apiLogSchema);