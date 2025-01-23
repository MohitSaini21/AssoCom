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
    Ntoken: {
      type: String,
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
      collegeImage: {
        type: String, // To store the path of the college image
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Pre-save middleware to set the college image based on the college name
userSchema.pre("save", function (next) {
  if (this.collegeName === "MIT Moradabad") {
    this.profile.collegeImage = "/images/mit.jpeg"; // Set the college image path for MIT
  } else if (
    this.collegeName === "Disha Institute of Science and Technology -[DIST]"
  ) {
    this.profile.collegeImage = "/images/diksha.jpeg"; // Set the college image path for Disha
  }
  next(); // Call the next middleware or save the document
});

// You can add methods here for token generation, validation, etc.
const User = mongoose.model("User", userSchema);

export default User;
