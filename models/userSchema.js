import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["client", "worker"],
    },
    collegeName: {
      type: String,
      enum: [
        "MIT Moradabad",
        "Disha Institute of Science and Technology -[DIST]",
      ],
    },
    userName: {
      type: String,
      required: true,
      unique: true,
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
        default: "I am student",
      },
      profilePicture: {
        type: String, // URL or path to the profile picture
        default: "/profileImages/DefaultProfileImage.jpeg",
      },

      contactNumber: {
        type: String, // Phone number
      },
      snapID: {
        type: String,
      },
      instaID: {
        type: String,
      },
      twitterID: {
        type: String,
      },
      githubID: {
        type: String,
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// You can add methods here for token generation, validation, etc.
const User = mongoose.model("User", userSchema);

export default User;
