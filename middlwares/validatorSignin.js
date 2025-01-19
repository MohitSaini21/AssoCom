import Joi from "joi";
import validator from "validator"; // For sanitization

// Define the schema for sign-in validation
const signInSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Validate as a proper email
    .required()
    .messages({
      "string.email": "Please provide a valid email address.",
      "any.required": "Email is required.",
    }),
  password: Joi.string()
    .min(6) // Minimum length of 6 characters
    .max(15) // Maximum length of 15 characters
    .required()
    .messages({
      "string.min": "Password should be between 6 and 15 characters.",
      "string.max": "Password should be between 6 and 15 characters.",
      "any.required": "Password is required.",
    }),
});

// Middleware function for validation and sanitization
export const validateAndSanitizeSignInPayload = (req, res, next) => {
  // Sanitize inputs (e.g., trim spaces, escape HTML)
  req.body.email = validator.normalizeEmail(req.body.email); // Normalize email to lowercase

  // Validate the sanitized input
  const { error } = signInSchema.validate(req.body, { abortEarly: false });

  // If validation fails, return a 400 error with the validation messages
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({ errors: errorMessages });
  }

  // Proceed to the next middleware or route handler
  next();
};
