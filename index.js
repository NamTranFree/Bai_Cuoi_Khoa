const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");

dbConnect();

app.use(cors());
app.use(express.json());

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "images"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, sameSite: "lax" }
}));

// API routes
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);

// Login endpoint
app.post("/admin/login", async (request, response) => {
  try {
    const User = require("./db/userModel");
    const { login_name, password } = request.body;
    
    if (!login_name) {
      return response.status(400).json({ error: "login_name is required" });
    }
    if (!password) {
      return response.status(400).json({ error: "password is required" });
    }
    
    const user = await User.findOne({ login_name });
    if (!user) {
      return response.status(400).json({ error: "Invalid login_name or password" });
    }
    
    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return response.status(400).json({ error: "Invalid login_name or password" });
    }
    
    request.session.userId = user._id;
    response.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Registration endpoint
app.post("/user", async (request, response) => {
  try {
    const User = require("./db/userModel");
    const { login_name, password, first_name, last_name, location, description, occupation } = request.body;
    
    // Validate required fields
    if (!login_name) {
      return response.status(400).json({ error: "login_name is required" });
    }
    if (!password) {
      return response.status(400).json({ error: "password is required" });
    }
    if (!first_name) {
      return response.status(400).json({ error: "first_name is required" });
    }
    if (!last_name) {
      return response.status(400).json({ error: "last_name is required" });
    }
    
    // Check if login_name already exists
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return response.status(400).json({ error: "login_name already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      login_name,
      password: hashedPassword,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || ""
    });
    
    await newUser.save();
    
    response.json({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Photo upload endpoint
app.post("/photos/new", upload.single("photo"), async (request, response) => {
  try {
    const Photo = require("./db/photoModel");
    const description = (request.body.description || "").trim();

    if (!request.file) {
      return response.status(400).json({ error: "No file uploaded" });
    }

    const newPhoto = new Photo({
      file_name: request.file.filename,
      description,
      date_time: new Date(),
      user_id: request.session.userId,
      comments: [],
    });

    await newPhoto.save();

    response.json({
      _id: newPhoto._id,
      file_name: newPhoto.file_name,
      description: newPhoto.description,
      date_time: newPhoto.date_time,
      user_id: newPhoto.user_id,
      comments: [],
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Logout endpoint
app.post("/admin/logout", (request, response) => {
  if (!request.session.userId) {
    return response.status(400).json({ error: "No user logged in" });
  }
  request.session.destroy((err) => {
    if (err) {
      return response.status(400).json({ error: "Logout failed" });
    }
    response.json({ message: "Logged out successfully" });
  });
});

// Serve static files from public folder (for bundled React app)
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// SPA fallback - serve index.html for any unmatched route
app.get("*", (request, response) => {
  response.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(8082, () => {
  console.log("server listening on port 8082");
});
