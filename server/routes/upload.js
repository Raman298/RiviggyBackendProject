/**
 * routes/upload.js
 * File upload endpoints for avatars, restaurant images, and attachments.
 */

const express = require('express');
const path = require('path');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { avatarUpload, restaurantImageUpload, attachmentUpload, UPLOAD_DIRS } = require('../middleware/upload');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// ── POST /api/upload/avatar ──────────────────────────────────────────────────
/**
 * Upload user avatar image
 * Field: avatar (single file, max 5 MB)
 * Returns: { success, message, filePath }
 */
router.post('/avatar', protect, avatarUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Construct the file path relative to client
    const filePath = `/uploads/avatars/${req.file.filename}`;

    // Update user's avatar in database
    await User.findByIdAndUpdate(req.user._id, { avatar: filePath }, { new: true });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      filePath,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/upload/restaurant-image ────────────────────────────────────────
/**
 * Upload restaurant cover image
 * Requires: restaurantId in body
 * Field: coverImage (single file, max 10 MB)
 * Returns: { success, message, filePath }
 */
router.post('/restaurant-image', protect, restaurantImageUpload, async (req, res, next) => {
  try {
    const { restaurantId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    // Verify restaurant exists and user owns it
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload for this restaurant' });
    }

    // Construct the file path
    const filePath = `/uploads/restaurants/${req.file.filename}`;

    // Update restaurant's cover image
    await Restaurant.findByIdAndUpdate(restaurantId, { coverImage: filePath }, { new: true });

    res.json({
      success: true,
      message: 'Restaurant image uploaded successfully',
      filePath,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/upload/attachments ─────────────────────────────────────────────
/**
 * Upload multiple attachments (images, PDF, text)
 * Field: attachments (multiple files, up to 5, max 20 MB each)
 * Returns: { success, message, files }
 */
router.post('/attachments', protect, attachmentUpload, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Construct file paths for all uploaded files
    const files = req.files.map(file => ({
      filename: file.filename,
      filePath: `/uploads/attachments/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      originalName: file.originalname,
    }));

    res.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files,
    });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/upload/:filename ─────────────────────────────────────────────
/**
 * Delete an uploaded file
 * Param: filename (just the filename, not full path)
 * Returns: { success, message }
 */
router.delete('/:filename', protect, async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    // Try to delete from any of the upload directories
    let deleted = false;
    for (const [dirName, dirPath] of Object.entries(UPLOAD_DIRS)) {
      const fullPath = path.join(dirPath, filename);

      // Verify the file is actually in the upload directory
      if (!fullPath.startsWith(dirPath)) {
        continue; // Skip if path traversal detected
      }

      const fs = require('fs');
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
