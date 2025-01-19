import Joi from "joi";
import validator from "validator"; // For sanitization
import sanitizeHtml from "sanitize-html"; // To sanitize HTML tags and avoid XSS attacks

export const ValidatorFeedback = (req, res, next) => {
  // Sanitize the incoming data to prevent XSS attacks
  req.body.feedback = sanitizeHtml(req.body.feedback, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  });
  req.body.feedback = validator.trim(req.body.feedback); // Trim extra spaces

  // Ensure the rating is valid
  req.body.rating = validator.trim(req.body.rating); // Trim extra spaces

  // Validate the data using Joi
  const schema = Joi.object({
    feedback: Joi.string()
      .max(3000) // Limit feedback to 3000 characters
      .min(1) // Ensure feedback is not empty
      .required()
      .messages({
        "string.base": "Feedback should be a string",
        "string.max": "Feedback should not exceed 3000 characters",
        "string.min": "Feedback should not be empty",
        "any.required": "Feedback is required",
      }),

    rating: Joi.number().integer().min(1).max(5).required().messages({
      "number.base": "Rating should be a valid number",
      "number.integer": "Rating should be an integer",
      "number.min": "Rating must be between 1 and 5",
      "number.max": "Rating must be between 1 and 5",
      "any.required": "Rating is required",
    }),
  });

  // Validate the request body after sanitization
  const { error } = schema.validate(req.body, { abortEarly: false });

  // If validation fails, return a 400 error with the validation messages
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({ errors: errorMessages });
  }

  // If validation passes, proceed to the next middleware or controller
  next();
};
