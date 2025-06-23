const express = require("express");
const connectDB = require("./src/config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
require("dotenv").config();


app.use(cors({
  origin: [  "http://localhost:5173",
  "https://tiny-shortbread-3a2d79.netlify.app/"],
  credentials :true,
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const requestRouter = require("./src/routes/requests");
const userRouter = require("./src/routes/user");
const intializeSocket = require("./src/utils/socket");
const chatRouter = require("./src/routes/chat");
const paymentRouter = require("./src/routes/Payment");



app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", paymentRouter);

const server =http.createServer(app)


intializeSocket(server);



// // Get user by email
// app.get("/user", async (req, res) => {
//   const userEmail = req.body.emailId;

//   try {
//     console.log(userEmail);
//     const user = await User.findOne({ emailId: userEmail });
//     if (!user) {
//       res.status(404).send("User not found");
//     } else {
//       res.send(user);
//     }

//     // const users = await User.find({ emailId: userEmail });
//     // if (users.length === 0) {
//     //   res.status(404).send("User not found");
//     // } else {
//     //   res.send(users);
//     // }
//   } catch (err) {
//     res.status(400).send("Something went wrong ");
//   }
// });

// // Feed API - GET /feed - get all the users from the database
// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send(users);
//   } catch (err) {
//     res.status(400).send("Something went wrong ");
//   }
// });

// // Detele a user from the database
// app.delete("/user", async (req, res) => {
//   const userId = req.body.userId;
//   try {
//     const user = await User.findByIdAndDelete({ _id: userId });
//     //const user = await User.findByIdAndDelete(userId);
//     res.send("User deleted successfully");
//   } catch (err) {
//     res.status(400).send("Something went wrong ");
//   }
// });

// // Update data of the user
// app.patch("/user/:userId", async (req, res) => {
//   const userId = req.params?.userId;
//   const data = req.body;
//   try {
//     const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

//     const isUpdateAllowed = Object.keys(data).every((k) =>
//       ALLOWED_UPDATES.includes(k)
//     );

//     if (!isUpdateAllowed) {
//       throw new Error("update not allowed");
//     }

//     if (data.skills.length > 10) {
//       throw new Error("data not should be grater than 10");
//     }

//     const user = await User.findByIdAndUpdate({ _id: userId }, data, {
//       returnDocument: "after",
//       runValidators: true,
//     });
//     console.log(user);
//     res.send("User updated successfully");
//   } catch (err) {
//     res.status(400).send("UPDATE FAILED:" + err.message);
//   }
// });

connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });
