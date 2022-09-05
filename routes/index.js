const express = require("express");
const router = express.Router();
const authRoutes = require("../routes/authRoutes");

router.get("/", (req, res) => res.send("Service is running!"));

//auth routes 
router.use("/auth", authRoutes);

module.exports = router;
