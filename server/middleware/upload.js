/**
 * Multer Upload Middleware
 * Handles multipart/form-data for file uploads and text fields.
 * Supports: profile images, restaurant images, booking attachments.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Ensure upload directories exist ──────────────────────────────────────────
const UPLOAD_BASE = path.join(__dirname, '..', 'uploads');
const UPLOAD_DIRS = {
  avatars: path.join(UPLOAD_BASE, 'avatars'),
  restaurants: path.join(UPLOAD_BASE, 'restaurants'),
  attachments: path.join(UPLOAD_BASE, 'attachments'),
};

Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Allowed MIME types ────────────────────────────────────────────────────────
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const DOC_MIME_TYPES   = ['application/pdf', 'text/plain', ...IMAGE_MIME_TYPES];

// ── Storage factory ───────────────────────────────────────────────────────────
const makeStorage = (destDir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

// ── File filter factory ───────────────────────────────────────────────────────
const makeFilter = (allowedTypes) => (_req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${file.mimetype}". Allowed: ${allowedTypes.join(', ')}`
      ),
      false
    );
  }
};

// ── Named upload instances ────────────────────────────────────────────────────

/** Avatar / profile-photo upload  (max 5 MB, images only) */
const uploadAvatar = multer({
  storage: makeStorage(UPLOAD_DIRS.avatars),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: makeFilter(IMAGE_MIME_TYPES),
});

/** Restaurant cover-image upload  (max 10 MB, images only) */
const uploadRestaurantImage = multer({
  storage: makeStorage(UPLOAD_DIRS.restaurants),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: makeFilter(IMAGE_MIME_TYPES),
});

/** General attachment upload  (max 20 MB, images + PDF + text) */
const uploadAttachment = multer({
  storage: makeStorage(UPLOAD_DIRS.attachments),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: makeFilter(DOC_MIME_TYPES),
});

/** Memory storage – for files that are processed in-memory (no disk write) */
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: makeFilter(IMAGE_MIME_TYPES),
});

// ── Error handler helper ──────────────────────────────────────────────────────
/**
 * Wraps a multer middleware so that MulterError and validation errors are
 * forwarded to Express error-handling middleware instead of crashing.
 *
 * Usage:
 *   router.post('/upload', handleUpload(uploadAvatar.single('avatar')), ctrl);
 */
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: 'File is too large. Please upload a smaller file.',
        LIMIT_FILE_COUNT: 'Too many files uploaded at once.',
        LIMIT_UNEXPECTED_FILE: `Unexpected field "${err.field}".`,
      };
      return res.status(400).json({
        success: false,
        message: messages[err.code] || `Upload error: ${err.message}`,
      });
    }

    // Custom validation errors (wrong MIME type, etc.)
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    next();
  });
};

// ── Convenience pre-wrapped middlewares ───────────────────────────────────────

/** Single avatar field, error-safe */
const avatarUpload = handleUpload(uploadAvatar.single('avatar'));

/** Single restaurant cover-image field, error-safe */
const restaurantImageUpload = handleUpload(uploadRestaurantImage.single('coverImage'));

/** Up to 5 attachment files, error-safe */
const attachmentUpload = handleUpload(uploadAttachment.array('attachments', 5));

module.exports = {
  // Raw multer instances (for custom .fields() / .array() combos)
  uploadAvatar,
  uploadRestaurantImage,
  uploadAttachment,
  uploadMemory,

  // Pre-wrapped, error-safe middlewares
  avatarUpload,
  restaurantImageUpload,
  attachmentUpload,

  // Generic wrapper for any multer middleware
  handleUpload,

  // Expose upload directories for use in controllers
  UPLOAD_DIRS,
};