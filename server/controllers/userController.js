const User = require('../models/userModal');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const validator = require('validator'); 

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("Request body:", req.body);

        // Validate email and password
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ message: "Password must be strong (include uppercase, lowercase, numbers, and symbols)." });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        // Generate JWT Token (valid for 1 hour)
        // const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

        res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const UserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id); 
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, UserProfile };
