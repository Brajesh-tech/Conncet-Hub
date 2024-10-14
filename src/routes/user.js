const { userAuth } = require("../middlewear/Auth");

const express = require("express");

const userRouter = express.Router();

const ConnectionRequests = require("../models/connectionrequest")

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
    console.log(connectionRequest)

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
      const connectionRequests = await ConnectionRequest.find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);
      console.log(connectionRequests);
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

module.exports = userRouter;
