const express = require("express");
const { userAuth } = require("../middlewear/Auth");
const User = require("../models/user");


const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionrequest");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedstatus = ["ignored", "interested"];
      if (!allowedstatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type:" + status });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "user not found" });
      }

      const existingConnectionrequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionrequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists" });
      }

      const connectionRequst = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequst.save();

      res.json({
        message: req.user.firstName  +  "is"  +   status + "in"  +  toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR :" + err.message);
    }
  }
);

requestRouter.post("/request/review/:status/:requestId" , userAuth , async(req,res)=>{

  try{


    const logedinUser=req.user;
    const{status ,requestId}=req.params

    const allowedstatus=["accepted","rejected"]
    allowedstatus.includes(status);

    if(!allowedstatus){

      return res.status(400).json({message: "status not allowed"});
    };

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: logedinUser._id,
      status: "interested",
    });

    if(!connectionRequest){

      return res.status(404).json({message: " connection request not found"});
    }

    connectionRequest.status=status;
    const data = await connectionRequest.save();

    res.json({message: "connection request" + status , data});

  }catch(err){

    res.status(400).send("ERROR :" + err.message);

  }
})



module.exports = requestRouter;
