const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { userAuth } = require("../middlewear/Auth");

const passwordRouter = express.Router();

passwordRouter.post("/resetPassword", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    // Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // Check if oldPassword and newPassword are exactly the same (plain-text)
    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ msg: "New password cannot be the same as old password" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      msg: "Password reset successfully",
      data: {
        _id: user._id,
        emailId: user.emailId,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

module.exports = passwordRouter;
