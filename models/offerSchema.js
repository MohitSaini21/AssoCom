import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Bid Schema definition
const bidSchema = new Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Reference to the Project collection
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User collection (worker who is bidding)
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Bid amount must be provided
    },
    description: {
      type: String,
      required: false, // Optional field for the worker to explain their bid
      maxlength: 500, // Limiting the description to 500 characters
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending", // Default status is 'pending'
    },
    dateSubmitted: {
      type: Date,
      default: Date.now, // Automatically set the submission time
    },
    deadline: {
      type: Date,
      required: true, // Worker must provide a completion deadline
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Creating the Bid model
const Bid = model("Bid", bidSchema);

export default Bid;
