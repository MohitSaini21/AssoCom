import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Schema for assignment-based projects
const projectSchema = new Schema(
  {
    student_name: {
      type: String,
      required: true, // The student's name is mandatory
      trim: true, // Removes unnecessary whitespace
    },
    course_name: {
      type: String,
      required: true, // The course name is mandatory
      trim: true,
    },
    course_code: {
      type: String,
      required: true, // The course code is mandatory
      trim: true,
    },
    semester: {
      type: String,
      required: true, // The semester is mandatory
      trim: true,
    },
    assignment_title: {
      type: String,
      required: true, // The title of the assignment is mandatory
      trim: true,
    },
    assignment_type: {
      type: String,
      required: true, // The type of assignment is mandatory
      trim: true,
    },
    description: {
      type: String,
      required: true, // A detailed description of the project is mandatory
    },
    skills_required: {
      type: String,
      required: true, // Skills required for the project
      trim: true,
    },
    deadline: {
      type: Date,
      required: true, // The deadline for the project is mandatory
    },
    budget: {
      type: Number,
      default: 0, // Optional budget, default is 0 if not provided
    },
    preferred_language: {
      type: String,
      trim: true, // Optional field for the preferred language
    },
    payment_method: {
      type: String,
      required: true, // The payment method is mandatory
      trim: true,
    },
    is_urgent: {
      type: Boolean,
      default: false, // Optional field to indicate urgency
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who posted the project
      required: true, // The project must have a creator
    },
    bidsMade: {
      type: [mongoose.Schema.Types.ObjectId], // Array of ObjectIds
      ref: "User", // Reference to the user who made the bid
      unique: true, // Ensures that a user can only make one bid
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Model for the project schema
const Project = model("Project", projectSchema);

export default Project;
