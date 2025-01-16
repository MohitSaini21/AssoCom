import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Feedback schema definition
const feedbackSchema = new Schema(
  {
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the 'User' model
      required: true, // Ensure the userId is provided
    },
    feedback: {
      type: String,
      required: true, // Ensure feedback is provided
      trim: true, // Trim any extra spaces around the feedback
    },
    rating: {
      type: Number,
      required: true, // Ensure rating is provided
      min: 1, // Minimum rating value
      max: 5, // Maximum rating value
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Feedback model using the schema
const Feedback = model("Feedback", feedbackSchema);

export default Feedback;
