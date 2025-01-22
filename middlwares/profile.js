import Joi from "joi";
import validator from "validator"; // For sanitization
import sanitizeHtml from "sanitize-html"; // To sanitize HTML tags and avoid XSS attacks

export const ValidatorUserProfile = (req, res, next) => {
  // Sanitize bio to prevent XSS attacks by removing any HTML tags
  req.body.bio = sanitizeHtml(req.body.bio, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  });
  req.body.bio = validator.trim(req.body.bio); // Trim any extra spaces from the bio

  // Function to sanitize IDs (trim any extra spaces)
  const sanitizeId = (id) => (id ? validator.trim(id) : id);

  // Sanitize and validate IDs, ensuring no extra spaces
  req.body.snapID = sanitizeId(req.body.snapID);
  req.body.instaID = sanitizeId(req.body.instaID);
  req.body.twitterID = sanitizeId(req.body.twitterID) || "";
  req.body.githubID = sanitizeId(req.body.githubID) || "";
  req.body.profilePicturePath = validator.trim(
    req.body.profilePicturePath || ""
  );

  // Define the Joi schema for validation
  const schema = Joi.object({
    bio: Joi.string()
      .max(300) // Bio cannot exceed 300 characters
      .required()
      .messages({
        "string.base": "Bio should be a string.",
        "string.max": "Bio cannot exceed 300 characters.",
        "any.required": "Bio is required.",
      }),

    snapID: Joi.string()
      .max(30) // Limit length to 30 characters
      .required()
      .messages({
        "string.base": "Snap ID must be a string.",
        "string.max": "Snap ID must not exceed 30 characters.",
        "any.required": "Snap ID is required.",
      }),

    instaID: Joi.string()
      .max(30) // Limit length to 30 characters
      .required()
      .messages({
        "string.base": "Instagram ID must be a string.",
        "string.max": "Instagram ID must not exceed 30 characters.",
        "any.required": "Instagram ID is required.",
      }),

    twitterID: Joi.string()
      .max(30) // Limit length to 30 characters
      .optional()
      .allow("")
      .messages({
        "string.base": "Twitter ID must be a string.",
        "string.max": "Twitter ID must not exceed 30 characters.",
      }),

    githubID: Joi.string()
      .max(30) // Limit length to 30 characters
      .optional()
      .allow("")
      .messages({
        "string.base": "GitHub ID must be a string.",
        "string.max": "GitHub ID must not exceed 30 characters.",
      }),

    profilePicturePath: Joi.string().optional().allow("").messages({
      "string.base": "Profile image path should be a string.",
      "string.empty": "Profile image path cannot be empty if provided.",
    }),
  });

  // Validate the request body against the schema
  const { error } = schema.validate(req.body, { abortEarly: false });

  // If validation fails, return a 400 status with error messages
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({ errors: errorMessages });
  }

  // If validation passes, continue to the next middleware or controller
  next();
};
