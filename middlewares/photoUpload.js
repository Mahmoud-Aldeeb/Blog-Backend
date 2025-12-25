const path = require("path");
const fs = require("fs");
const multer = require("multer");

const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? "/tmp" : path.join(__dirname, "../images");
// Ensure local directory exists
if (!isVercel && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

const photoUpload = multer({
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

module.exports = photoUpload;
