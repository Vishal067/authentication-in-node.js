const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const indexRouter = require("./routes/index");


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.frameguard({ action: "DENY" }));


app.use("/", indexRouter);

console.log(`Service successfully started in ${process.env.NODE_ENV || "development"}`);

module.exports = app;