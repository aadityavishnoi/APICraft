const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signup = async (req, res) => {
    try {
        const{name, email, password} = req.body;

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
            password: hashedPassword
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
        const secretPart = Math.random().toString(36).substring(2) + Date.now();
        const apiKey = req.user.id + "." + secretPart;

        const user = await User.findById(req.user.id);

        const hashedKey = await bcrypt.hash(secretPart, 10);
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
module.exports = { signup, login, generateApiKey };