const express = require("express");
const {
  registerUser,
  UserProfile,
  loginUser,
  googleLogin,
  migrateCanvas,
} = require("../controllers/userController");
const authenticator = require("../middleware/auth");
const router = express.Router();

router.post("/register", registerUser);
router.get("/", authenticator, UserProfile);
router.post("/login", loginUser);
router.post("/google-login", googleLogin); 
router.post("/migrate-canvas", authenticator, migrateCanvas); 

module.exports = router;