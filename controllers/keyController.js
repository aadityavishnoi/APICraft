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
            revoked: k.revoked,
            permissions: k.permissions
        }));
        res.json(keys);
    } catch(err) {
        res.status(500).json({ message: "Failed to get keys" });
    }
};

const createKey = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const user = await User.findById(req.user.id);
        
        // ITEM 8: Enforce max active API keys limit
        const MAX_KEYS = 20;
        if (user.apiKeys.filter(k => !k.revoked).length >= MAX_KEYS) {
            return res.status(400).json({
                message: `Maximum of ${MAX_KEYS} active API keys allowed.`
            });
        }

        const secretPart = crypto.randomBytes(32).toString('hex');
        const apiKey = `${user._id.toString()}.${secretPart}`;
        const keyHash = await bcrypt.hash(secretPart, 10);
        const keyPrefix = secretPart.substring(0, 8); 

        const validPermissions = ['read', 'write', 'delete'];
        const keyPermissions = Array.isArray(permissions) 
            ? permissions.filter(p => validPermissions.includes(p))
            : ['read', 'write', 'delete'];

        user.apiKeys.push({
            name: name || 'Default Key',
            keyHash,
            keyPrefix,
            permissions: keyPermissions
        });
        
        await user.save();
        res.json({ message: "Key created", apiKey });
    } catch(err) {
        console.error("[createKey]", err.message);
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

const rotateKey = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);
        const oldKey = user.apiKeys.id(id);
        if (!oldKey) return res.status(404).json({ message: "Key not found" });

        oldKey.revoked = true;

        const secretPart = crypto.randomBytes(32).toString('hex');
        const apiKey = `${user._id.toString()}.${secretPart}`;
        const keyHash = await bcrypt.hash(secretPart, 10);
        const keyPrefix = secretPart.substring(0, 8);

        user.apiKeys.push({
            name: oldKey.name + ' (rotated)',
            keyHash,
            keyPrefix,
            permissions: oldKey.permissions || ['read', 'write', 'delete']
        });

        await user.save();
        res.json({ message: "Key rotated", apiKey });
    } catch(err) {
        console.error("[rotateKey]", err.message);
        res.status(500).json({ message: "Rotation failed" });
    }
};

module.exports = { getKeys, createKey, deleteKey, updateKey, rotateKey };
