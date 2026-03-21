const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ 
            $or: [{ googleId }, { email }] 
        });

        if (user) {
            // Update googleId if not present (link existing email account)
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.json({
                message: "Login Successful!",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    usageCount: user.usageCount,
                    usageLimit: user.usageLimit
                }
            });
        } else {
            // New user - frontend must prompt for name and password
            return res.status(200).json({
                new_user: true,
                email,
                name, // Provide suggested name from Google
                googleId
            });
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Google Authentication Failed" });
    }
};

const signup = async (req, res) => {
    try {
        const { name, email, password, googleId } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                message: "User Already Exists!"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            googleId
        });

        await newUser.save();

        res.json({
            message: "User Created Successfully!"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error Creating User!"
        });
    }
}

const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({
                message: "User Not Found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({
                message: "Password Doesn't Match."
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
        message: "Login Successful!",
        token,
        user: {
        id: user._id,
        name: user.name,
        email: user.email,
        usageCount: user.usageCount,
        usageLimit: user.usageLimit
    },
});
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Login Failed"
        });
    }
};

const generateApiKey = async (req, res) => {
    try {
        const secretPart = crypto.randomBytes(32).toString('hex');
        const apiKey = `${req.user.id}.${secretPart}`;

        const user = await User.findById(req.user.id);

        const hashedKey = await bcrypt.hash(secretPart, 10);
        
        // Push to multiple keys array (the new architecture)
        user.apiKeys.push({
            name: req.body.name || `Key_${Date.now().toString(36)}`,
            keyHash: hashedKey,
            createdAt: new Date()
        });
        
        // Also update legacy single apiKey field for backward compatibility if needed
        user.apiKey = hashedKey;
        await user.save();

        res.json({
            message: "API Key Generated!",
            apiKey
        });
    } catch (error) {
        console.log(error);
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
            user.password = await bcrypt.hash(password, 10);
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
            id: user._id,
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