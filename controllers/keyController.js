const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const getKeys = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const keys = (user.apiKeys || []).map(k => ({
            id: k._id,
            name: k.name,
            createdAt: k.createdAt,
            lastUsed: k.lastUsed,
            requestCount: k.requestCount,
            revoked: k.revoked
        }));
        res.json(keys);
    } catch(err) {
        res.status(500).json({ message: "Failed to get keys" });
    }
};

const createKey = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user.id);
        
        const secretPart = crypto.randomBytes(32).toString('hex');
        const apiKey = `${user._id}.${secretPart}`;
        const keyHash = await bcrypt.hash(secretPart, 10);
        
        user.apiKeys.push({
            name: name || 'Default Key',
            keyHash
        });
        
        await user.save();
        res.json({ message: "Key created", apiKey });
    } catch(err) {
        res.status(500).json({ message: "Failed to create key" });
    }
};

const deleteKey = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const key = user.apiKeys.id(req.params.id);
        if(!key) return res.status(404).json({ message: "Key not found" });
        
        user.apiKeys.pull({ _id: req.params.id });
        await user.save();
        res.json({ message: "Key deleted" });
    } catch(err) {
        res.status(500).json({ message: "Failed to delete key" });
    }
};

const updateKey = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const key = user.apiKeys.id(req.params.id);
        if(!key) return res.status(404).json({ message: "Key not found" });
        
        if(req.body.revoked !== undefined) key.revoked = req.body.revoked;
        await user.save();
        res.json({ message: "Key updated" });
    } catch(err) {
        res.status(500).json({ message: "Failed to update key" });
    }
};

module.exports = { getKeys, createKey, deleteKey, updateKey };
