const express = require("express");
const { validatesignupData } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

// SIGNUP ROUTE
authRouter.post("/signup", async (req, res) => {
  try {
    validatesignupData(req);

    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.status(201).json({
      message: "User Added successfully!",
      token, // send token in response
      data: savedUser,
    });
  } catch (err) {
    res.status(400).send("Error saving the user: " + err.message);
  }
});

// LOGIN ROUTE
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });

    if (!user) throw new Error("email_Id is not valid!");

    const isPasswordValid = await user.verifyPassword(password);

    if (!isPasswordValid) throw new Error("Password incorrect!");

    const token = await user.getJWT();
    console.log(token) ;

    res.json({
      message: "Login successful!",
      token, // send token in response
      data: user,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// LOGOUT ROUTE (Client can just delete token from localStorage)
authRouter.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = authRouter;
