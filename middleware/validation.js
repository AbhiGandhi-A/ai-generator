import { body, validationResult } from "express-validator"

export const validateRegister = [
  body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
]

export const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").exists().withMessage("Password required"),
  handleValidationErrors,
]

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}
