import Joi from "joi";
import validator from "validator"; // For sanitization
import sanitizeHtml from "sanitize-html"; // To sanitize HTML tags and avoid XSS attacks

export const ValidatorBid = (req, res, next) => {
  console.log("hii There how areiou ");
  // Sanitize incoming data to prevent XSS attacks
  req.body.description = sanitizeHtml(req.body.description, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  });
  req.body.description = validator.trim(req.body.description); // Trim extra spaces

  // Ensure the deadline is a valid date and format it
  const deadline = validator.trim(req.body.deadline);
  if (!validator.isDate(deadline)) {
    return res
      .status(400)
      .json({ errors: ["Invalid date format for deadline"] });
  }

  // Validate the data using Joi
  const schema = Joi.object({
    amount: Joi.number()
      .min(100) // Ensure the amount is not less than 100
      .required()
      .messages({
        "number.base": "Amount should be a number",
        "number.min": "Amount must be at least 100",
        "any.required": "Amount is required",
      }),

    description: Joi.string()
      .max(300) // Ensure description is at least 600 characters
      .required()
      .messages({
        "string.base": "Description should be a string",
        "string.min": "Description must  not be at more than 300 characters",
        "any.required": "Description is required",
      }),

    deadline: Joi.date()
      .iso() // Ensure the deadline is in ISO format
      .required()
      .messages({
        "date.base": "Deadline must be a valid date",
        "any.required": "Deadline is required",
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
