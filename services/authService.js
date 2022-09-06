const axios = require("axios");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");
const { successResponse, errorResponse } = require("../utils/reponseUtil");
require("dotenv").config();



//add a new user
const register = async (req, res) => {
    const {firstName, lastName, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 15);
    try {
        // console.log("checking existing user");
        const checkExistingUser = await authModel.checkExistingUser(email);
        const data = {
            name: firstName + lastName,
            email: email,
            password: hashedPassword,
            created_at : new Date(),
        }

        if(checkExistingUser.length > 0){
            console.log("user exists");
            return res.status(400).send(errorResponse("User already exists"));
        }
        const registerUser = await authModel.register(data);
        if(registerUser){
            return res.send(successResponse("User registered successfully"));
        }
    } catch (error) {
        return res.status(500).send(errorResponse("Internal server error"));
    }
}


//login a user
const login = async (req, res) => {
    const {email, password } = req.body;
    try {
        const checkExistingUser = await authModel.checkExistingUser(email);
        if(checkExistingUser.length == 0){
            return res.status(400).send(errorResponse("User does not exist"));
        }
        const user = checkExistingUser[0];  
        console.log(user);
        const checkPassword = bcrypt.compareSync(password, user.password);
        if(!checkPassword){
            return res.status(400).send(errorResponse("Invalid password"));
        }
        const token = jwt.sign({id: user.id, email : user.email}, process.env.JWT_SECRET, {expiresIn: "5h"});
        return res.send(successResponse("User logged in successfully",{ name : user.name, email : user.email, token : token}));
    } catch (error) {
        return res.status(500).send(errorResponse("Internal server error"));
    }
}



//send password reset link to email
const sendPasswordResetLink = async (req, res) => {
    const {email} = req.body;
    try {
        const checkExistingUser = await authModel.checkExistingUser(email);
        if(checkExistingUser.length == 0){
            return res.status(400).send(errorResponse("User does not exist"));
        }
        const user = checkExistingUser[0];
        const token = jwt.sign({id: user.id, email : user.email}, process.env.JWT_SECRET, {expiresIn: "60s"});
        const resetLink = `http://localhost:8001/auth/reset?token=${token}`;
        const mailOptions = {
            from: "support30@anaxee.com",
            to: email,
            subject: "Password Reset",
            html: `<p>Click on the link below to reset your password</p>
            <a href="${resetLink}">Reset Password</a>`
        }
        console.log("mail options",mailOptions);
        const sendMail = await authModel.sendResetLink(mailOptions);
        if(sendMail){
            return res.send(successResponse("Password reset link sent successfully"));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse("Internal server error"));
    } 
  
}


//reset password
const resetPassword = async (req, res) => {
    const {password} = req.body;
    const token = req.params.token;
    try {
        const decoded = jwt_decode(token);
        const checkExistingUser = await authModel.checkExistingUser(decoded.email);
        if(checkExistingUser.length == 0){
            return res.status(400).send(errorResponse("User does not exist"));
        }
        const user = checkExistingUser[0];
        const hashedPassword = bcrypt.hashSync(password, 15);
        const updatePassword = await authModel.resetPassword(user.email, hashedPassword);
        if(updatePassword){
            return res.send(successResponse("Password reset successfully"));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse("Internal server error"));
    }
}

//send password reset html page and check if token is expired
const resetPasswordPage = async (req, res) => {
    const token = req.query.token;
    try {
        const decoded = jwt_decode(token);
        console.log("decoded",decoded);
        const checkExistingUser = await authModel.checkExistingUser(decoded.email);
        if(checkExistingUser.length == 0){
            return res.status(400).send(errorResponse("User does not exist"));
        }
        const user = checkExistingUser[0];
        console.log("jwt>>>", jwt.verify(token, process.env.JWT_SECRET));
        const checkToken = jwt.verify(token, process.env.JWT_SECRET);
        if(checkToken){
        return res.send(`<html> <head>Password Reset</head><body><h1> Please change your Passsword immediately for ${user.email}</h1><p>This link will expire in 1 minute</p></body></html>`);
        }
    } catch (error) {
        if(error.message === "invalid algorithm") {
            return res.status(500).send(errorResponse("Internal server error"));
        }else {
            console.log("err:: ", error.message);
      return res.status(401).send(errorResponse("Link is expire!")); 
    }
}
}




const sendVerificationCode = async (req, res) => {
    const {email} = req.body;
    try {
        const checkExistingUser = await authModel.checkExistingUser(email);
        if(checkExistingUser.length == 0){
            return res.status(400).send(errorResponse("User does not exist"));
        }
        const user = checkExistingUser[0];
        const verificationCode = Math.floor(10000 + Math.random() * 90000);
        console.log("verfication code",verificationCode);
        const mailOptions = {
            from: "support30@anaxee.com",
            to: email,
            subject: "Verification Code",
            html: `<p>Use the code below to verify your email</p>
            <h3>${verificationCode}</h3>`
        }
        const sendMail = await authModel.sendEmail(mailOptions, verificationCode);
        console.log(">>>>>",sendMail);
        if(sendMail){
            console.log("email sent");
            return res.send(successResponse("Verification code sent successfully"));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse("Internal server error"));
    }
}
// 
//verfiy verification code 
const verifyCode = async (req, res) => {
    const {email, verificationCode} = req.body;
    try {
        const checkExistingUser = await authModel.checkExistingUser(email);
        if(checkExistingUser.length == 0){
            return res.status(400).send(errorResponse("User does not exist"));
        }
        const user = checkExistingUser[0];
        console.log("user",user);
        console.log("code",verificationCode);
        if(user.verificationCode != verificationCode){
            return res.status(400).send(errorResponse("Invalid verification code"));
        }
        const verifyEmail = await authModel.verifyEmail(user.email);
        if(verifyEmail){
            return res.send(successResponse("Email verified successfully"));
        }
    } catch (error) {
        return res.status(500).send(errorResponse("Internal server error"));
    }
}

module.exports = {
    register,
    login,
    sendPasswordResetLink,
    sendVerificationCode,
    resetPassword,
    verifyCode,
    resetPasswordPage
}