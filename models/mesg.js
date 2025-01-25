import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Message Schema definition
const messageSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User collection (who the message is for)
      required: true,
    },
    idUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User collection (who is sending or acting on the message)
      required: true,
    },
    messageContent: {
      type: String, // Content will store the full message (including date if necessary)
      required: true, // Content must be provided.
    },
    status: {
      type: String,
      enum: ["unseen", "seen"], // Status can be 'unseen' or 'seen'
      default: "unseen", // Default status is 'unseen'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Default is 24 hours from now
    },
    purpose: {
      type: String,
      enum: ["accepted", "rejected", "visited","offer"], // Purpose can be 'accepted', 'rejected', or 'visited'
      required: true, // Purpose must be provided
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a TTL index to automatically delete messages after the expiration time
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Creating the Message model
const Message = model("Message", messageSchema);

export default Message;
