const jwt = require("jsonwebtoken");
const User = require("../models/User");
const devAuthStore = require("../utils/devAuthStore");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const tokenFromCookie = req.cookies && req.cookies.token ? req.cookies.token : null;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (global.__DEV_AUTH_STORE__ === true) {
      const devUser = await devAuthStore.findUserById(decoded.id);
      if (!devUser) return res.status(401).json({ success: false, message: "User not found" });
      req.user = devAuthStore.publicUser(devUser);
      return next();
    }

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Admin access required" });
};

module.exports = { protect, adminOnly };
