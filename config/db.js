const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected.");
  } catch (error) {
    console.log("Database Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
