const express = require("express");
const { validatesignupData } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  //   Creating a new instance of the User model

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

const savedUser =  await user.save();
const token = await savedUser.getJWT();

res.cookie("token", token, {
  expires: new Date(Date.now() + 8 * 3600000),
});
    res.json({message:"User Added successfully!" , data:savedUser});
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("email_Id is not valid !");
    }
    const ispasswordValid = await user.verifyPassword(password);

    if (ispasswordValid) {
      const token = await user.getJWT();

      // Add the token and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Password incorrect !");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.send("log out succefully");
});


module.exports = authRouter;
