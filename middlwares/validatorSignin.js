import Joi from "joi";

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
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long.",
      "any.required": "Password is required.",
    }),
});

// Middleware function
export const validateSignInPayload = (req, res, next) => {
  const { error } = signInSchema.validate(req.body, { abortEarly: false });

  // If validation fails, return a 400 error with the validation messages
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({ errors: errorMessages });
  }
  // Proceed to the next middleware or route handler
  next();
};
