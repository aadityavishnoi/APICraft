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
module.exports = { signup };