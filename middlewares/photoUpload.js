const path = require("path");
const multer = require("multer");

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../images"));
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
