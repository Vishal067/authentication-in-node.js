const axios = require("axios");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");
const { successResponse, errorResponse } = require("../utils/reponseUtil");
require("dotenv").config();

//add a new user
const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 15);
  try {
    // console.log("checking existing user");
    const checkExistingUser = await authModel.checkExistingUser(email);
    const data = {
      name: firstName + lastName,
      email: email,
      password: hashedPassword,
      created_at: new Date(),
    };

    if (checkExistingUser.length > 0) {
      console.log("user exists");
      return res.status(400).send(errorResponse("User already exists"));
    }
    const registerUser = await authModel.register(data);
    if (registerUser) {
      return res.send(successResponse("User registered successfully"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

//login a user
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkExistingUser = await authModel.checkExistingUser(email);
    if (checkExistingUser.length == 0) {
      return res.status(400).send(errorResponse("User does not exist"));
    }
    const user = checkExistingUser[0];
    console.log(user);
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      return res.status(400).send(errorResponse("Invalid password"));
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    return res.send(
      successResponse("User logged in successfully", {
        name: user.name,
        email: user.email,
        token: token,
      })
    );
  } catch (error) {
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

//send password reset link to email
const sendPasswordResetLink = async (req, res) => {
  const { email } = req.body;
  try {
    const checkExistingUser = await authModel.checkExistingUser(email);
    if (checkExistingUser.length == 0) {
      return res.status(400).send(errorResponse("User does not exist"));
    }
    const user = checkExistingUser[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const resetLink = `http://localhost:8001/auth/reset?token=${token}`;
    const mailOptions = {
      from: "support24@anaxee.com",
      to: email,
      subject: "Link to reset password",
      html: `<pre style="font-family: 'Poppins', sans-serif;" >
        Hi,

        We have received a request to Reset your password.
            
        Please click on the following link to complete the process within one hour of receiving it
        <a href="${resetLink}">Reset Password</a>
            
        Note: If you did not requested this, please ignore this email and your password will remain unchanged.
            
        Regards,
        Team Anaxee
        </pre>`,
    };
    console.log("mail options", mailOptions);
    const sendMail = await authModel.sendResetLink(mailOptions);
    if (sendMail) {
      return res.send(successResponse("Password reset link sent successfully"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

//send password reset html page and check if token is expired
const resetPasswordPage = async (req, res) => {
  const token = req.query.token;
  try {
    // console.log(__dirname, "@@@@", __filename);
    const decoded = jwt_decode(token);
    console.log("decoded", decoded);
    const checkExistingUser = await authModel.checkExistingUser(decoded.email);
    if (checkExistingUser.length == 0) {
      return res.status(400).send(errorResponse("User does not exist"));
    }
    const user = checkExistingUser[0];
    console.log("jwt>>>", jwt.verify(token, process.env.JWT_SECRET));
    const checkToken = jwt.verify(token, process.env.JWT_SECRET);
    if (checkToken) {
      return res.sendFile(__dirname + "/reset.html");
    }
  } catch (error) {
    if (error.message === "invalid algorithm") {
      return res.status(500).send(errorResponse("Internal server error"));
    } else {
      console.log("err:: ", error.message);
      return res.status(401).send(`<!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
        <title>Link Expired</title>
      </head>
        <style>
          body {
            text-align: center;
            padding: 40px 0;
            background: #EBF0F5;
          }
            p {
              color: #404F5E;
              font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
              font-size:20px;
              margin: 0;
            }
          .card {
            background: white;
            padding: 60px;
            display: inline-block;
            margin: 0 auto;
          }
          .demo{
            border:2px solid white;
            margin: 0 auto;
            display: inline-block;
            margin-top:100px;
            padding:10px;
          }
        </style>
        <body style ="background:rgb(51, 162, 181);">
        <div class ="demo">
          <div class="card">
            <p>The Link You  followed has expired.&#128533;	</p>
            <br>
            <a href="https://partner.anaxee.com/">Please Try again</a>
          </div></div>
        </body>
    </html>`);
    }
  }
};

const resetPasswordPageCss = async (req, res) => {
  try {
    return res.sendFile(__dirname + "/reset.css");
  } catch (error) {
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

const resetPasswordPageJs = async (req, res) => {
  try {
    return res.sendFile(__dirname + "/reset.js");
  } catch (error) {
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const checkExistingUser = await authModel.checkExistingUser(email);
    if (checkExistingUser.length == 0) {
      return res.status(400).send(errorResponse("User does not exist"));
    }
    const user = checkExistingUser[0];
    const verificationCode = Math.floor(10000 + Math.random() * 90000);
    console.log("verfication code", verificationCode);
    const mailOptions = {
      from: "support30@anaxee.com",
      to: email,
      subject: "Verification Code",
      html: `<p>Use the code below to verify your email</p>
            <h3>${verificationCode}</h3>`,
    };
    const sendMail = await authModel.sendEmail(mailOptions, verificationCode);
    console.log(">>>>>", sendMail);
    if (sendMail) {
      console.log("email sent");
      return res.send(successResponse("Verification code sent successfully"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse("Internal server error"));
  }
};
//reset password page post request
const resetPasswordPagePost = async (req, res) => {
  const { password, confirmPassword } = req.body;
  console.log("password", password);
  console.log("confirmPassword", confirmPassword);
  console.log("req.body", req.body);

  const token = req.query.token;
  console.log("token", token);
  try {
    const decoded = jwt_decode(token);
    const checkExistingUser = await authModel.checkExistingUser(decoded.email);
    if (checkExistingUser.length == 0) {
      return res.status(400).send(errorResponse("User does not exist"));
    }
    const user = checkExistingUser[0];
    const checkToken = jwt.verify(token, process.env.JWT_SECRET);
    if (checkToken) {
      if (password == confirmPassword) {
        const hashedPassword = bcrypt.hashSync(password, 15);
        const updatePassword = await authModel.resetPassword(
          user.email,
          hashedPassword
        );
        if (updatePassword) {
          return res.send(`<!DOCTYPE html>
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
            <title>Reset Successfully</title>
          </head>
            <style>
              body {
                text-align: center;
                padding: 40px 0;
                background: #EBF0F5;
              }
                h1 {
                  color: #88B04B;
                  font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                  font-weight: 900;
                  font-size: 40px;
                  margin-bottom: 10px;
                }
                p {
                  color: #404F5E;
                  font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                  font-size:20px;
                  margin: 0;
                }
              i {
                color: #9ABC66;
                font-size: 100px;
                line-height: 200px;
                margin-left:-15px;
              }
              .card {
                background: white;
                padding: 60px;
                border-radius: 4px;
                box-shadow: 0 2px 3px #C8D0D8;
                display: inline-block;
                margin: 0 auto;
              }
            </style>
            <body>
              <div class="card">
              <div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;">
                <i class="checkmark">✓</i>
              </div>
                <h1>Success</h1>
                <p>Password Reset Successfully<br/> You can Login Now!<br><br>
                <a href="https://partner.anaxee.com/">Login Here</a>
                </p>
              </div>
            </body>
        </html>`);
        }
      } else {
        return res.status(400).send(errorResponse("Password does not match"));
      }
    }
  } catch (error) {
    if (error.message === "invalid algorithm") {
      return res.status(500).send("Internal server error");
    } else {
      console.log("err:: ", error.message);
      return res.status(401).send(`<!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
        <title>Link Expired</title>
      </head>
        <style>
          body {
            text-align: center;
            padding: 40px 0;
            background: #EBF0F5;
          }
            p {
              color: #404F5E;
              font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
              font-size:20px;
              margin: 0;
            }
          .card {
            background: white;
            padding: 60px;
            display: inline-block;
            margin: 0 auto;
          }
          .demo{
            border:2px solid white;
            margin: 0 auto;
            display: inline-block;
            margin-top:100px;
            padding:10px;
          }
        </style>
        <body style ="background:rgb(51, 162, 181);">
        <div class ="demo">
          <div class="card">
            <p>The Link You  followed has expired.&#128533;	</p>
            <br>
            <a href="https://partner.anaxee.com/">Please Try again</a>
          </div></div>
        </body>
    </html>`);
    }
  }
};
//verfiy verification code
const verifyCode = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    const checkExistingUser = await authModel.checkExistingUser(email);
    if (checkExistingUser.length == 0) {
      return res.status(400).send(errorResponse("User does not exist"));
    }
    const user = checkExistingUser[0];
    console.log("user", user);
    console.log("code", verificationCode);
    if (user.verificationCode != verificationCode) {
      return res.status(400).send(errorResponse("Invalid verification code"));
    }
    const verifyEmail = await authModel.verifyEmail(user.email);
    if (verifyEmail) {
      return res.send(successResponse("Email verified successfully"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse("Internal server error"));
  }
};
const staticPath = __dirname;

module.exports = {
  register,
  login,
  sendPasswordResetLink,
  sendVerificationCode,
  verifyCode,
  resetPasswordPage,
  staticPath,
  resetPasswordPageCss,
  // resetPasswordPageImg,
  resetPasswordPageJs,
  resetPasswordPagePost,
};
