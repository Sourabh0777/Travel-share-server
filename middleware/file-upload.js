const multer = require("multer");
const MY_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const uuid = require("uuid/v1");

// A function to which we can pass a  configuration object

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MY_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MY_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error("Invalid mime type");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
