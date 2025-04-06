const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const authPath = require("./Routes/auth");
const authPathV = require("./Routes/authV");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv");
dotenv.config();


// Local  Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB successfully");
  })
  .catch((error) => {
    console.log(`Failed to connect to MongoDB: ${error}`);
  })

// Online Connect to MongoDB

// Initialize app
const app = express();

app.use(express.static(path.resolve(__dirname, "pages")));
// middlewares
app.use(express.json());
app.use(logger);


// Login route form
app.get("/" , (req, res) => {
  res.sendFile(path.resolve(__dirname, "pages", "login.html"));
});

// Routes
app.use("/api/auth", authPath);
// vurnauble
app.use("/api/authV", authPathV);

// Error handler middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const Port = process.env.PORT || 9000;
app.listen(Port, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`http://localhost:${Port}`);
});