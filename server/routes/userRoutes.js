const express = require('express');
const { registerUser, UserProfile, loginUser } = require('../controllers/userController');
const authenticator = require('../middleware/auth');
const router = express.Router();


router.post('/register', registerUser);
router.get('/',authenticator, UserProfile);
router.post('/login', loginUser);

module.exports = router;