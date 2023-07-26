const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bCrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let AllUser;
  try {
    AllUser = await User.find({}, "email name image");
  } catch (error) {
    return next(new HttpError("Fetching user failed please try again", 422));
  }

  res.json({ users: AllUser.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  console.log("Working Controller");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Something failed please try agin later other error",
      500
    );
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError("Email already exists", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bCrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "error was created while hashing the password",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed, please try again.", 500);
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Token creation failed.", 500);
    return next(error);
  }
  console.log("🚀 ~ file: users-controllers.js:84 ~ signup ~ createdUser.id:", createdUser.id,createdUser.email)

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  let exixtingUser;
  try {
    exixtingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Login failed please try agin later", 500);
    return next(error);
  }

  if (!exixtingUser) {
    const error = new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bCrypt.compare(password, exixtingUser.password);
  } catch (err) {
    const error = new HttpError(
      "error was created while Checking the password",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError("Invalid password", 500);
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: exixtingUser.id, email: exixtingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Token creation failed.", 500);
    return next(error);
  }

  res.status(201).json({
    userId: exixtingUser.id,
    email: exixtingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
