import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["client", "worker"],
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values to be inserted without violating the unique constraint
    },

    verifiedEmailToken: {
      type: String,
    },
    verifiedEmailTokenExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Profile Information
    profile: {
      bio: {
        type: String,
        default: "Tell us about yourself!",
      },
      profilePicture: {
        type: String, // URL or path to the profile picture
        default: "/profileImages/DefaultProfileImage.jpeg",
      },
      location: {
        type: String, // City or country of the user
      },
      contactNumber: {
        type: String, // Phone number
      },
    },
    // Worker-specific fields
    worker: {
      skills: {
        type: [String], // Array of skills for workers (e.g., "Web Development", "Graphic Design")
      },

      experience: {
        type: String, // Years of experience or description of experience
      },
      portfolio: {
        type: String, // URL to the worker's portfolio or previous work
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// You can add methods here for token generation, validation, etc.

const User = mongoose.model("users", userSchema);

export default User;
