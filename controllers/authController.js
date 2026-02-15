const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signup = async (req, res) => {
    console.log(req.body);
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
    console.log(req.body);
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
            token
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
        const apiKey = Math.random().toString(36).substring(2) + Date.now();

        const user = await User.findById(req.user.id);
        const bcrypt = require("bcrypt");

        const hashedKey = await bcrypt.hash(apiKey, 10);
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