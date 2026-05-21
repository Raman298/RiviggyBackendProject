// Backend Service Layer - Business Logic
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ERRORS, SUCCESS } = require('../constants/httpStatus');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data (email, password, name, phone)
   * @returns {Object} User and token
   */
  async registerUser(userData) {
    try {
      const { email, password, name, phone } = userData;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        throw {
          status: HTTP_STATUS.CONFLICT,
          message: ERRORS.VALIDATION.EMAIL_EXISTS,
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      user = new User({
        email,
        password: hashedPassword,
        name,
        phone,
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        success: true,
        message: SUCCESS.REGISTER,
        user: { id: user._id, email: user.email, name: user.name },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Object} User and token
   */
  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw {
          status: HTTP_STATUS.UNAUTHORIZED,
          message: ERRORS.AUTH.INVALID_CREDENTIALS,
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw {
          status: HTTP_STATUS.UNAUTHORIZED,
          message: ERRORS.AUTH.INVALID_CREDENTIALS,
        };
      }

      const token = this.generateToken(user._id);

      return {
        success: true,
        message: SUCCESS.LOGIN,
        user: { id: user._id, email: user.email, name: user.name },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {string} userId
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    });
  }

  /**
   * Verify token
   * @param {string} token
   * @returns {Object} Decoded token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw {
        status: HTTP_STATUS.UNAUTHORIZED,
        message: ERRORS.AUTH.UNAUTHORIZED,
      };
    }
  }
}

module.exports = new AuthService();
