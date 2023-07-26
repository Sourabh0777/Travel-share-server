const HttpError = require("../models/http-error.js");
const jwt = require("jsonwebtoken");

module.exports = (req, rea, next) => {
  if (req.method === "OPTIONS") {
    next();
  }

  let token;

  try {
    token = req.headers.authorization.split(" ")[1];
  } catch (err) {
    const error = new HttpError("Error while split", 401);
    return next(error);
  }
  try {
    if (!token) {
      throw new Error("Authentication failed");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};
