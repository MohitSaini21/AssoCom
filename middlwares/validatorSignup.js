import Joi from "joi";
import validator from "validator"; // Import validator for sanitization
import sanitizeHtml from "sanitize-html"; // Import sanitize-html package to remove HTML tags

export const ValidatorSignup = (req, res, next) => {
  // Sanitize the incoming data

  // Sanitize the userName to remove any HTML tags and escape special characters
  req.body.userName = sanitizeHtml(req.body.userName, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  });

  // Trim any extra spaces in userName
  req.body.userName = validator.trim(req.body.userName); // Trim spaces

  // Now ensure the username is within the character limit
  // Limit userName length to 20 characters and trim extra characters if necessary
  req.body.userName = req.body.userName.substring(0, 20); // Set max length to 20 characters

  // Apply other sanitization methods for other fields (email, password, etc.)
  req.body.email = validator.trim(req.body.email); // Trim spaces from the email
  req.body.email = validator.normalizeEmail(req.body.email); // Normalize email (lowercase, remove extra spaces)

  req.body.role = validator.trim(req.body.role); // Trim spaces in the role

  const schema = Joi.object({
    userName: Joi.string().min(6).max(20).required().messages({
      "string.base": "User Name should be a string",
      "string.min": "User Name should have at least 6 characters",
      "string.max": "User Name should have at most 20 characters",
      "any.required": "User Name is required",
    }),
    email: Joi.string()
      .email({ tlds: { allow: false } }) // Validate as a proper email
      .required()
      .messages({
        "string.base": "Email should be a string",
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    password: Joi.string().min(6).max(15).required().messages({
      "string.base": "Password should be a string",
      "string.min": "Password should be between 6 and 15 characters.",
      "string.max": "Password should be between 6 and 15 characters.",
      "any.required": "Password is required",
    }),
    role: Joi.string().valid("worker", "client").required().messages({
      "string.base": "Role should be a string",
      "any.only": "Role must be either 'worker' or 'client'",
      "any.required": "Role is required",
    }),
    college: Joi.string()
      .valid(
        "MIT Moradabad",
        "Disha Institute of Science and Technology -[DIST]"
      )
      .required()
      .messages({
        "string.base": "college should be a string",
        "any.only": "college must be From Given Category",
        "any.required": "college is required",
      }),
  });

  // Validate the request body after sanitization
  const { error } = schema.validate(req.body, { abortEarly: false });

  // If validation fails, return a 400 error with the validation messages
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    console.log(errorMessages); // Logging error messages
    return res.status(400).json({ errors: errorMessages });
  }

  // If validation passes, proceed to the next middleware or controller
  next();
};
