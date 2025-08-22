const mongoose = require("mongoose");
const env = require("node:process");


let URI = process.env.MONGODB_URI || "mongodb://localhost:27017/social_network";

const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
