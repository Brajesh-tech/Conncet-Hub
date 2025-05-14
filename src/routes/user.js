const { userAuth } = require("../middlewear/Auth");

const express = require("express");

const userRouter = express.Router();
const User = require("../models/user")

const ConnectionRequests = require("../models/connectionrequest")
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";


userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInuser = req.user;

    const connectionRequest = await ConnectionRequests.find({
      toUserId: loggedInuser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName photoUrl age gender about skills"
    );

    res.json({
        messsage:"Data fetched succesfully",
        data:connectionRequest,
    })
  } catch (err) {
    res.status(400).send("ERROR:" + err.messsage);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
      const loggedInUser = req.user;
      const connectionRequests = await ConnectionRequests.find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);
      const data = connectionRequests.map((row) => {
        if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
          return row.toUserId;
        }
        return row.fromUserId;
      });
      res.json({ data });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });


  userRouter.get("/feed", userAuth, async (req, res) => {
    try {
      const loggedInUser = req.user;
      const page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      limit = limit > 50 ? 50 : limit;
      const skip = (page - 1) * limit;
      const connectionRequests = await ConnectionRequests.find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      }).select("fromUserId  toUserId");
      const hideUsersFromFeed = new Set();
      connectionRequests.forEach((req) => {
        hideUsersFromFeed.add(req.fromUserId.toString());
        hideUsersFromFeed.add(req.toUserId.toString());
      });
      const users = await User.find({
        $and: [
          { _id: { $nin: Array.from(hideUsersFromFeed) } },
          { _id: { $ne: loggedInUser._id } },
        ],
      })
        .select(USER_SAFE_DATA)
        .skip(skip)
        .limit(limit);
      res.json({ data: users });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


  // userRouter.get("/search", async (req, res) => {
  //   try {
  //     const { name } = req.query;  // Get the search name from query parameter
  //     const page = parseInt(req.query.page) || 1;
  //     let limit = parseInt(req.query.limit) || 10;
  //     limit = limit > 50 ? 50 : limit;  // Limit the number of results to avoid overload
  //     const skip = (page - 1) * limit;  // Skip users based on the page number
  
  //     // If name parameter is provided, search based on firstName or lastName
  //     let userQuery = {};
  //     if (name) {
  //       userQuery = {
  //         $or: [
  //           { firstName: { $regex: name, $options: 'i' } }, // Case-insensitive search on firstName
  //           { lastName: { $regex: name, $options: 'i' } }    // Case-insensitive search on lastName
  //         ]
  //       };
  //     }
  
  //     // Log the final query to debug
  //     console.log("Final User Query:", JSON.stringify(userQuery, null, 2));
  
  //     // Fetch users based on the name query and pagination
  //     const users = await User.find(userQuery)
  //       .select("firstName lastName emailId skills photoUrl") // Customize the fields you want to return
  //       .skip(skip)
  //       .limit(limit);
  
  //     res.json({ data: users });
  //   } catch (err) {
  //     res.status(400).json({ message: err.message });
  //   }
  // });
  

  userRouter.get("/search", userAuth, async (req, res) => {
    try {
      const { name } = req.query;  // Get the search name from the query parameter
      const page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      limit = limit > 50 ? 50 : limit;  // Limit the number of results to avoid overload
      const skip = (page - 1) * limit;  // Skip users based on the page number
  
      // If the name parameter is provided, search based on firstName or lastName
      let userQuery = {};
      if (name) {
        userQuery = {
          $or: [
            { firstName: { $regex: name, $options: 'i' } }, // Case-insensitive search on firstName
            { lastName: { $regex: name, $options: 'i' } }    // Case-insensitive search on lastName
          ]
        };
      }
  
      // Get the logged-in user (from the userAuth middleware)
      const loggedInUser = req.user;
  
      // Log the final query to debug
      console.log("Final User Query:", JSON.stringify(userQuery, null, 2));
  
      // Fetch users based on the query and pagination, excluding the logged-in user
      const users = await User.find({
        ...userQuery,
        _id: { $ne: loggedInUser._id } // Exclude the logged-in user from the search results
      })
        .select("firstName lastName emailId skills photoUrl") // Fields to return in the response
        .skip(skip)
        .limit(limit);
  
      // Respond with the found users
      res.json({ data: users });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  

module.exports = userRouter;
