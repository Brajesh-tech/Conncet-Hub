const express = require("express");
const connectDB = require("./src/config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const allowedOrigins = [
  "http://localhost:5173",
 "https://dreamy-unicorn-094506.netlify.app"
];

// Setup CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Allow preflight requests
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// Import routes
const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const requestRouter = require("./src/routes/requests");
const userRouter = require("./src/routes/user");
const intializeSocket = require("./src/utils/socket");
const chatRouter = require("./src/routes/chat");
const paymentRouter = require("./src/routes/Payment");

// Use routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", paymentRouter);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket or Socket.IO
intializeSocket(server);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
