
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const devAuthStore = require('../utils/devAuthStore');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
const useDevAuthStore = () => global.__DEV_AUTH_STORE__ === true;

const buildCookieOptions = () => {
  const days = Number(process.env.JWT_COOKIE_DAYS || 7);
  return {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: days * 24 * 60 * 60 * 1000
  };
};

const sendAuthResponse = (res, statusCode, token, user) => {
  res.cookie('token', token, buildCookieOptions());
  res.status(statusCode).json({ success: true, token, user });
};

// @desc Register user
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { name, email, password, role } = req.body;
    if (useDevAuthStore()) {
      const user = await devAuthStore.createUser({ name, email, password, role });
      const token = generateToken(user._id);
      return sendAuthResponse(res, 201, token, user);
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
    const token = generateToken(user._id);
    return sendAuthResponse(res, 201, token, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) { next(error); }
};

// @desc Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    if (useDevAuthStore()) {
      const user = await devAuthStore.findUserByEmail(email);
      if (!user || !(await devAuthStore.verifyPassword(user, password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return sendAuthResponse(res, 200, token, devAuthStore.publicUser(user));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    return sendAuthResponse(res, 200, token, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) { next(error); }
};

// @desc Get current user
exports.getMe = async (req, res) => {
  if (useDevAuthStore()) {
    const user = await devAuthStore.findUserById(req.user._id);
    return res.json({ success: true, user: user ? devAuthStore.publicUser(user) : req.user });
  }

  res.json({ success: true, user: req.user });
};

// @desc Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    if (useDevAuthStore()) {
      const user = await devAuthStore.updateUser(req.user._id, { name, phone, address });
      return res.json({ success: true, user });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

// @desc Logout user
exports.logout = async (req, res) => {
  res.clearCookie('token', buildCookieOptions());
  res.json({ success: true, message: 'Logged out successfully' });
};
