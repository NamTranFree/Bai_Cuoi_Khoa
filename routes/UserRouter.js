const express = require("express");
const User = require("../db/userModel");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

// Get all users
router.get("/", isAuthenticated, async (request, response) => {
  try {
    const users = await User.find().select("-password");
    response.json(users);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Get user by ID
router.get("/:userId", isAuthenticated, async (request, response) => {
  try {
    const user = await User.findById(request.params.userId).select("-password");
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }
    response.json(user);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Create new user
router.post("/", isAuthenticated, async (request, response) => {
  try {
    const user = new User(request.body);
    await user.save();
    response.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

module.exports = router;