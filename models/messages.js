import mongoose from "mongoose"; // Import mongoose

// Define the Message Schema for text-only messages
const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId, // User reference
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId, // User reference
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 86400000, // Adds 24 hours in milliseconds to the current time
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["seen", "unseen"],
    default: "unseen",
  },
});

// Check if the model is already registered
const chatMessage = mongoose.model("chatMessage", chatMessageSchema);
// Create a TTL index to automatically delete documents after the time set in expiresAt
chatMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Export the model as default
export default chatMessage;
