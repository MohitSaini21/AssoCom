import Joi from "joi";
import validator from "validator"; // For sanitization
import sanitizeHtml from "sanitize-html"; // To sanitize HTML tags and avoid XSS attacks

export const ValidatorProject = (req, res, next) => {
  // Sanitize the incoming data to prevent XSS attacks
  req.body.student_name = sanitizeHtml(req.body.student_name, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  });
  req.body.student_name = validator.trim(req.body.student_name); // Trim extra spaces

  req.body.course_name = sanitizeHtml(req.body.course_name, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.course_name = validator.trim(req.body.course_name); // Trim extra spaces

  req.body.course_code = sanitizeHtml(req.body.course_code, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.course_code = validator.trim(req.body.course_code);

  req.body.semester = sanitizeHtml(req.body.semester, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.semester = validator.trim(req.body.semester);

  req.body.assignment_title = sanitizeHtml(req.body.assignment_title, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.assignment_title = validator.trim(req.body.assignment_title);

  req.body.assignment_type = sanitizeHtml(req.body.assignment_type, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.assignment_type = validator.trim(req.body.assignment_type);

  req.body.description = sanitizeHtml(req.body.description, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.description = validator.trim(req.body.description);

  req.body.skills_required = sanitizeHtml(req.body.skills_required, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.skills_required = validator.trim(req.body.skills_required);

  req.body.deadline = validator.trim(req.body.deadline); // Trim spaces around date
  req.body.budget = validator.trim(req.body.budget); // Trim spaces around the budget field
  req.body.preferred_language = sanitizeHtml(req.body.preferred_language, {
    allowedTags: [],
    allowedAttributes: {},
  });
  req.body.preferred_language = validator.trim(req.body.preferred_language);

  req.body.payment_method = sanitizeHtml(req.body.payment_method, {
    allowedTags: [],
    allowedAttributes: {},
  });

  req.body.is_urgent = req.body.is_urgent === "on"; // Convert checkbox value to a boolean
  console.log(req.body.course_name);

  // Define Joi schema for validation
  const schema = Joi.object({
    student_name: Joi.string().max(100).required().messages({
      "string.base": "Student Name should be a string",
      "string.max": "Student Name should not exceed 50 characters",
      "any.required": "Student Name is required",
    }),

    course_name: Joi.string().max(100).allow("").optional().messages({
      "string.base": "Course Name should be a string",
      "string.max": "Course Name should not exceed 100 characters",
    }),

    course_code: Joi.string().max(100).allow("").optional().messages({
      "string.base": "Course Code should be a string",
      "string.max": "Course Code should not exceed 50 characters",
    }),

    semester: Joi.string().max(100).required().messages({
      "string.base": "Semester should be a string",
      "string.max": "Semester should not exceed 50 characters",
      "any.required": "Semester is required",
    }),

    assignment_title: Joi.string().max(100).required().messages({
      "string.base": "Assignment Title should be a string",
      "string.max": "Assignment Title should not exceed 100 characters",
      "any.required": "Assignment Title is required",
    }),

    assignment_type: Joi.string().max(100).allow("").optional().messages({
      "string.base": "Assignment Type should be a string",
      "string.max": "Assignment Type should not exceed 50 characters",
    }),

    description: Joi.string().max(600).required().messages({
      "string.base": "Description should be a string",
      "string.max": "Description should not exceed 600 characters",
      "any.required": "Description is required",
    }),

    skills_required: Joi.string().max(100).required().messages({
      "string.base": "Skills Required should be a string",
      "string.max": "Skills Required should not exceed 100 characters",
      "any.required": "Skills Required is required",
    }),

    deadline: Joi.date().required().messages({
      "date.base": "Deadline must be a valid date",
      "any.required": "Deadline is required",
    }),

    budget: Joi.number().max(10000).min(100).required().messages({
      "number.base": "Budget should be a valid number",
      "number.max": "Budget should not exceed 10,000",
      "number.min": "Budget should be at least 100",
      "any.required": "Budget is required",
    }),

    preferred_language: Joi.string().max(100).required().messages({
      "string.base": "Preferred Language should be a string",
      "string.max": "Preferred Language should not exceed 100 characters",
      "any.required": "Preferred Language is required",
    }),

    payment_method: Joi.string()
      .valid("cash", "paytamGateWay", "BarterSystem")
      .required()
      .messages({
        "string.base": "Payment Method should be a string",
        "any.only":
          "Payment Method should be one of 'cash', 'paytamGateWay', or 'BarterSystem'",
        "any.required": "Payment Method is required",
      }),

    is_urgent: Joi.boolean().required().messages({
      "boolean.base": "Is Urgent flag should be a boolean",
      "any.required": "Is Urgent flag is required",
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
