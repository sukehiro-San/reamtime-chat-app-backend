const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Message = require("../models/message");
const { jwtSecret } = require("../config/jwt");

router.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(401)
        .json({ error: "User already exists with this email or username" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    // Respond with the token and user details
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /login - Authenticate a user and return a JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    // Respond with the token and user details
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Message api
router.post("/messages", async (req, res) => {
  try {
    const { name, username, email, message, room, date, time } = req.body;

    const newMessage = new Message({
      name,
      username,
      email,
      message,
      room,
      date,
      time,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage); // Send the saved message back in the response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating message" });
  }
});
// get messages by Email Marketing category
router.get("/messages/:room", async (req, res) => {
  try {
    const roomName = req.params.room; // Get the room name from the URL parameter

    const messages = await Message.find({ room: roomName }).sort({
      date: -1,
      time: -1,
    }); // Find messages in the specified room and sort by date and time in descending order

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});
module.exports = router;
