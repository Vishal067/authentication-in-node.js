const express = require("express");
const router = express.Router();
const authRoutes = require("../routes/authRoutes");
const authService = require("../services/authService");


router.get("/", (req, res) => res.send("Service is running!"));

//auth routes 
router.use("/auth", authRoutes);


module.exports = router;
