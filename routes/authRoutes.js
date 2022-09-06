const express = require("express");
const router = express.Router();
const authService = require("../services/authService");


// add a new user
router.post("/register", authService.register);

// login
router.post("/login", authService.login);

//verfication email
router.post("/verification", authService.sendVerificationCode);

//verify email
router.post("/verify", authService.verifyCode);

//send reset password link
router.post("/reset-password", authService.sendPasswordResetLink);

//reset password
router.post("/reset-password/:token", authService.resetPassword);

//password reset page
router.get("/reset", authService.resetPasswordPage);

module.exports = router;
