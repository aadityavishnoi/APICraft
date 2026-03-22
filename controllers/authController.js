const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Joi = require('joi');
const admin = require('firebase-admin');

try {
    admin.initializeApp({
        projectId: 'apicraft-ce0a0'
    });
} catch(err) {
    if (!/already exists/.test(err.message)) {
        console.error('Firebase admin init error', err.stack);
    }
}

const firebaseLogin = async (req, res) => {
    try {
        const { token, name } = req.body;
        if (!token) return res.status(400).json({ message: 'Firebase token is required.' });

        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name: firebaseName } = decodedToken;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name: firebaseName || name || 'User',
                email: email
            });
            await user.save();
        }

        const jwtToken = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login Successful!",
            token: jwtToken,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                usageCount: user.usageCount,
                usageLimit: user.usageLimit
            },
        });
    } catch (error) {
        console.error("[firebaseLogin]", error.message);
        res.status(401).json({
            message: "Authentication Failed"
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

        try {
            const fbUser = await admin.auth().getUserByEmail(user.email);
            
            const updatePayload = {};
            if (name) updatePayload.displayName = name;
            if (email && email !== user.email) updatePayload.email = email;
            if (password) updatePayload.password = password;

            if (Object.keys(updatePayload).length > 0) {
                await admin.auth().updateUser(fbUser.uid, updatePayload);
            }
        } catch (fbErr) {
            console.error("Firebase update error:", fbErr);
            if (password || (email && email !== user.email)) {
                return res.status(400).json({ message: "Failed to update credentials in Firebase: " + fbErr.message });
            }
        }

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();
        res.json({ message: "Profile updated successfully" });
    } catch(err) {
        console.error(err);
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

module.exports = { firebaseLogin, generateApiKey, updateUser, deleteAccount, getProfile };