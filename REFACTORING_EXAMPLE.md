// Example: Refactored Controller using Service Layer Pattern
// BEFORE: Business logic mixed in controller
// AFTER: Clean separation with services

// server/controllers/authController.js (REFACTORED)
const authService = require('../services/authService');
const { HTTP_STATUS, ERRORS } = require('../constants/httpStatus');
const { validate, validateLogin, validateRegister } = require('../validators/authValidator');

// Middleware to apply validation
const validateLoginRequest = validate(validateLogin());
const validateRegisterRequest = validate(validateRegister());

exports.register = [
  validateRegisterRequest,
  async (req, res) => {
    try {
      const result = await authService.registerUser(req.body);
      res.cookie('token', result.token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, message: error.message || ERRORS.AUTH.UNAUTHORIZED });
    }
  }
];

exports.login = [
  validateLoginRequest,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);
      res.cookie('token', result.token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, message: error.message || ERRORS.AUTH.UNAUTHORIZED });
    }
  }
];

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Logout successful' });
};

exports.getCurrentUser = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// OLD APPROACH (Anti-pattern - DO NOT USE):
/*
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // ❌ Business logic mixed in controller
    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ message: 'Email exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword, name, phone });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '7d' });
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
*/

// BENEFITS OF REFACTORED APPROACH:
// ✅ Business logic isolated in service
// ✅ Validation separated in validators
// ✅ Constants used for messages
// ✅ Error handling standardized
// ✅ Reusable across different endpoints
// ✅ Easy to test services independently
// ✅ Clear data flow: Route -> Validation -> Controller -> Service -> Model
