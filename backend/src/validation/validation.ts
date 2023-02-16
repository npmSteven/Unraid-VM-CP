import { check } from "express-validator";

export const checkUsername = check('username')
  .exists()
  .isLength({ min: 3, max: 16 })
  .withMessage('Username must be between 3 and 16 characters long');

export const checkPassword = check('password')
  .exists()
  .isLength({ min: 6, max: 255 })
  .withMessage('Password must be between 6 and 255 characters long');

export const checkUUID = (fieldName) => check(fieldName)
  .notEmpty()
  .withMessage(`${fieldName} is required`)
  .isUUID(4)
  .withMessage(`${fieldName} is not a valid UUID`);
  