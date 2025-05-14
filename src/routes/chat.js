const express = require("express");
 const { userAuth } = require("../middlewear/Auth");
 const { Chat } = require("../models/chat");
 
 const chatRouter = express.Router();
 
 chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
   const { targetUserId } = req.params;
   const userId = req.user._id;
 
   try {
     let chat = await Chat.findOne({
       participants: { $all: [userId, targetUserId] },
     }).populate({
       path: "messages.senderId",
       select: "firstName lastName",
     });
     if (!chat) {
       chat = new Chat({
         participants: [userId, targetUserId],
         messages: [],
       });
       await chat.save();
     }
     res.json(chat);
   } catch (err) {
     console.error(err);
   }
 });

 chatRouter.delete("/chatDelete/:targetUserId", userAuth, async (req, res) => {  

    const { targetUserId } = req.params;
    const userId = req.user._id;
  
    try {
      const chat = await Chat.findOneAndDelete({
        participants: { $all: [userId, targetUserId] },
      });
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json({ message: "Chat deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  
  

 })
 
// Soft delete all messages for the logged-in user
// chatRouter.delete("/deleteAllMessages/:targetUserId", userAuth, async (req, res) => {
//   const { targetUserId } = req.params;
//   const userId = req.user._id; // Logged-in user ID

//   try {
//     const chat = await Chat.findOne({
//       participants: { $all: [userId, targetUserId] },
//     });

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     // Remove messages only for the logged-in user
//     chat.messages = chat.messages.filter((msg) => msg.senderId.toString() !== userId);

//     await chat.save();

//     res.json({ message: "Your messages have been deleted from the database." });
//   } catch (err) {
//     console.error("Error deleting messages:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });





 module.exports = chatRouter;