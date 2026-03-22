const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Joi = require('joi');

const SALT_ROUNDS = 12;

const signupSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().max(200).required(),
    password: Joi.string().min(8).max(128).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().max(200).required(),
    password: Joi.string().min(1).max(128).required()
});

const signup = async (req, res) => {
    try {
        // ITEM 10: validate on signup
        const { error: validationError } = signupSchema.validate(req.body);
        if (validationError) return res.status(400).json({ message: validationError.details[0].message });

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                message: "User Already Exists!"
            });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.json({
            message: "User Created Successfully!"
        })
    } catch (error) {
        console.error("[signup]", error.message);
        res.status(500).json({
            message: "Error Creating User!"
        });
    }
}

const login = async(req, res) => {
    try {
        // ITEM 10: validate on login
        const { error: validationError } = loginSchema.validate(req.body);
        if (validationError) return res.status(400).json({ message: 'Invalid email or password.' });

        const { email, password } = req.body;

        // ITEM 9: Generic error message for both cases
        const GENERIC_ERROR = 'Invalid email or password.';
        const user = await User.findOne({ email });

        if (!user) {
            // Run a dummy bcrypt to prevent timing attacks using a statically valid hash map
            await bcrypt.compare(password || 'dummy', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
            return res.status(400).json({ message: GENERIC_ERROR });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: GENERIC_ERROR });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login Successful!",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                usageCount: user.usageCount,
                usageLimit: user.usageLimit
            },
        });
    } catch (error) {
        console.error("[login]", error.message);
        res.status(500).json({
            message: "Login Failed"
        });
    }
};

const generateApiKey = async (req, res) => {
    try {
        const secretPart = crypto.randomBytes(32).toString('hex');
        
        // ITEM 2: ensure we use the string ID
        const apiKey = `${req.user.id}.${secretPart}`;
        const user = await User.findById(req.user.id);

        const activeKeys = user.apiKeys.filter(k => !k.revoked).length;
        if (activeKeys >= 20) {
            return res.status(400).json({
                message: "Maximum of 20 active API keys allowed. Revoke or delete existing keys first."
            });
        }

        const hashedKey = await bcrypt.hash(secretPart, 10);
        const keyPrefix = secretPart.substring(0, 8); 
        
        user.apiKeys.push({
            name: req.body.name || `Key_${Date.now().toString(36)}`,
            keyHash: hashedKey,
            keyPrefix,
            createdAt: new Date()
        });
        
        await user.save();

        res.json({
            message: "API Key Generated!",
            apiKey
        });
    } catch (error) {
        console.error("[generateApiKey]", error.message);
        res.status(500).json({
            message: "Failed To Generate API Key!"
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            user.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        await user.save();
        res.json({ message: "Profile updated successfully" });
    } catch(err) {
        res.status(500).json({ message: "Failed to update profile" });
    }
};

const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: "Account deleted successfully" });
    } catch(err) {
        res.status(500).json({ message: "Failed to delete account" });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            usageCount: user.usageCount,
            usageLimit: user.usageLimit
        });
    } catch(err) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

module.exports = { signup, login, generateApiKey, updateUser, deleteAccount, getProfile };