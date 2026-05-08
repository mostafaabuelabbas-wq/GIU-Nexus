const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "giu-nexus/profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
    const err = new Error("Only jpg, jpeg, and png images are allowed");
    err.statusCode = 400;
    return cb(err, false);
  }
  cb(null, true);
};

const _multer = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// Wraps multer so MulterError instances are normalised to { success, message }
// before reaching the central error handler.
const upload = {
  single: (fieldName) => (req, res, next) => {
    _multer.single(fieldName)(req, res, (err) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        err.statusCode = 400;
        err.message = "Image must be 2 MB or smaller";
      } else if (!err.statusCode) {
        err.statusCode = 400;
      }
      next(err);
    });
  },
};

module.exports = upload;
