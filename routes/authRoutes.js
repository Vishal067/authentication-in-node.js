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
// router.post("/reset-password/:token", authService.resetPassword);

//password reset page
router.get("/reset", authService.resetPasswordPage);
//password reset page post api to get token and form data
router.post("/reset", authService.resetPasswordPagePost);
//password reset page css
router.get("/reset.css", authService.resetPasswordPageCss);
//password reset page js
router.get("/reset.js", authService.resetPasswordPageJs);

module.exports = router;
