// Backend Validators - Centralized validation logic
const { body, validationResult } = require('express-validator');

// Validation middleware factory
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  };
};

// Reusable validators
module.exports = {
  validateLogin: () => [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],

  validateRegister: () => [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
  ],

  validateOrder: () => [
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  ],

  validate,
};
