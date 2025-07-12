const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please Login!!");
    }

    const decodedObj = jwt.verify(token, "DEV@TINDER&7481");
    const user = await User.findById(decodedObj._id);
    
    if (!user) {
      return res.status(401).send("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send("ERROR: " + err.message);
  }
};
module.exports = {
  userAuth,
};
