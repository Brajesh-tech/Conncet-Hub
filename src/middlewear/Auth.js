const jwt = require("jsonwebtoken");
const User = require("../models/user");

// const userAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).send("Please Login!!");
//     }

//     const token = authHeader.split(" ")[1]; // Bearer <token>
//     const decodedObj = jwt.verify(token, "DEV@TINDER&7481");

//     const user = await User.findById(decodedObj._id);
//     if (!user) return res.status(401).send("User not found");

//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(401).send("ERROR: " + err.message);
//   }
// };


const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Please Login!!");
    }

    const token = authHeader.split(" ")[1];
    const decodedObj = jwt.verify(token, "DEV@TINDER&7481");
    console.log("Decoded Token:", decodedObj);

    const user = await User.findById(decodedObj._id);
    if (!user) return res.status(401).send("User not found");

    req.user = user;
    next();
  } catch (err) {
    console.log("Auth Error:", err.message);
    return res.status(401).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
