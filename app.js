const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const indexRouter = require("./routes/index");
const staticPath = require("./services/authService");

const path = require("path");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.frameguard({ action: "DENY" }));


app.use("/", indexRouter);
//serve static files
app.use(express.static(staticPath.staticPath + "/reset.css"));
app.use(express.static(staticPath.staticPath + "/reset.js"));
app.use(express.static(staticPath.staticPath + "/reset.jpg"));
app.use(express.static(staticPath.staticPath + "/reset.html"));


// console.log(staticPath.staticPath);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'js')));
app.use(express.static(path.resolve(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public", "css")));

// console.log(path.join(__dirname, '/public'));
// console.log(path.join(__dirname, 'public', 'css'));

console.log(`Service successfully started in ${process.env.NODE_ENV || "development"}`);

module.exports = app;