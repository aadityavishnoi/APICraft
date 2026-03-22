const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 12; // CAT6-B: increased from 10 for passwords

const signup = async (req, res) => {
    try {
        const{name, email, password} = req.body;

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
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // CAT5-A: Generic error message prevents user enumeration
        if(!user){
            // Dummy bcrypt compare to prevent timing-based enumeration
            await bcrypt.compare(password, "$2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({
                message: "Invalid email or password"
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
        console.error("[login]", error.message);
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

        // CAT6-C: Cap active keys at 20
        const activeKeys = user.apiKeys.filter(k => !k.revoked).length;
        if (activeKeys >= 20) {
            return res.status(400).json({
                message: "Maximum of 20 active API keys allowed. Revoke or delete existing keys first."
            });
        }

        const hashedKey = await bcrypt.hash(secretPart, 10);
        const keyPrefix = secretPart.substring(0, 8); // CAT6-C: fast pre-filter hint
        
        // Push to multiple keys array (the new architecture)
        user.apiKeys.push({
            name: req.body.name || `Key_${Date.now().toString(36)}`,
            keyHash: hashedKey,
            keyPrefix,
            createdAt: new Date()
        });
        
        // CAT2-B: Removed legacy user.apiKey write — it bypassed revocation
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