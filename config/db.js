import mongoose from "mongoose";
// import User from "../models/userSchema.js";

const url = process.env.MONGO_URL || "mongodb://localhost:27017/AssingmentCom"; // MongoDB URL from environment variable

export const ConnectDB = async () => {
  try {
    // // Drop the existing index on githubId (if it exists)
    // await User.collection.dropIndex("githubId_1");
    // console.log("Index dropped successfully!");

    // // Create a new index with sparse option
    // await User.createIndexes();
    // console.log("Index created successfully!");

    // Connect to MongoDB
    await mongoose.connect(url, {
      useNewUrlParser: true, // Use the new URL parser
      useUnifiedTopology: true, // Use the new unified topology engine
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error in DB connection or index creation:", error.message);
    process.exit(1); // Exit the process if connection fails
  }
};
