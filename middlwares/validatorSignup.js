import Joi from "joi";

export const ValidatorSignup = (req, res, next) => {
  // Define the validation schema using Joi
  const schema = Joi.object({
    userName: Joi.string().min(6).max(20).required().messages({
      "string.base": "Full Name should be a string",
      "string.min": "Full Name should have at least 6 characters",
      "string.max": "Full Name should have at most 20 characters",
      "any.required": "Full Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "Email should be a string",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.base": "Password should be a string",
      "string.min": "Password should have at least 6 characters",
      "any.required": "Password is required",
    }),
    role: Joi.string().valid("worker", "client").required().messages({
      "string.base": "Role should be a string",
      "any.only": "Role must be either 'worker' or 'client'",
      "any.required": "Role is required",
    }),
  });

  // Validate the request body
  const { error } = schema.validate(req.body, { abortEarly: false });
  // If validation fails, return a 400 error with the validation messages
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({ errors: errorMessages });
  }

  // If validation passes, proceed to the next middleware or controller
  next();
};
