import React from "react";
import "../../index.css";
import logo from "../../assets/ApiCraft.png";
import { useState } from "react";
import { Link } from "react-router-dom";
export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async() => {
        try {
            const res = await fetch("http://localhost:5500/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name, email, password}),
            });

            const data = await res.json()
            console.log(data);

            if(res.ok){
                alert("SignUp Successful!");
                console.log(data);
            } else {
                alert(data.message || "SignUp Failed!")
        }
        } catch (error) {
            console.log(error);
            alert("Server Error!");
        }
    }
     return (
        <div className="min-h-screen relative flex items-center justify-center px-4 bg-black overflow-hidden">
    
          {/* Gradient base background */}
          <div className="absolute inset-0 bg-gradient-to-br 
            from-[#020617] via-black to-[#020617]"></div>
    
          {/* Soft glow effects */}
          <div className="absolute w-[500px] h-[500px] 
            bg-indigo-900/20 rounded-full blur-3xl 
            top-[-150px] left-[-150px]"></div>
    
          <div className="absolute w-[400px] h-[400px] 
            bg-purple-900/20 rounded-full blur-3xl 
            bottom-[-150px] right-[-150px]"></div>
    
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 
            bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),
            linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
            bg-[size:40px_40px]"></div>
    
          {/* Login Card */}
          <div className="relative w-full max-w-md bg-[#020617] 
            border border-gray-800 rounded-2xl p-8 shadow-2xl">
    
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={logo} alt="logo" className="w-12 h-12 rounded-md" />
            </div>
    
            {/* Heading */}
            <h1 className="text-2xl font-outfit text-white text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-center mb-6 font-outfit">
              SignUp To Start Building
            </p>

            {/* Name */}
            <input
              type="text"
              placeholder="Enter Your Name"
              onChange={(e) => setName(e.target.value)}
              className="font-outfit w-full mb-4 p-3 rounded-lg 
              bg-[#0f172a] border border-gray-700 
              text-white placeholder-gray-500
              focus:outline-none focus:border-indigo-500"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              className="font-outfit w-full mb-4 p-3 rounded-lg 
              bg-[#0f172a] border border-gray-700 
              text-white placeholder-gray-500
              focus:outline-none focus:border-indigo-500"
            />
    
            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="font-outfit w-full mb-4 p-3 rounded-lg 
              bg-[#0f172a] border border-gray-700 
              text-white placeholder-gray-500
              focus:outline-none focus:border-indigo-500"
            />
    
            {/* Login Button */}
            <button
            onClick={handleSignUp}
              className="w-full bg-indigo-600 hover:bg-indigo-700 
              transition text-white py-3 rounded-lg font-medium font-outfit"
            >
              SignUp
            </button>
    
            {/* Links */}
            <div className="flex mt-4 text-sm items-center justify-center">
              <span className="font-outfit text-gray-400 cursor-pointer hover:text-white">
                <Link to="/login">
                Back To Login
                </Link>
              </span>
            </div>
    
          </div>
        </div>
      );
    }