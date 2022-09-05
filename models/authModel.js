//import mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yourmail@email.com',
        pass: 'password'
    } 
});

const uri = "mongodb+srv://test:t0bRM9V2RqXZDMjX@vishalcluster.zjn2blt.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB", err);
});

const collection = client.db("testing").collection("users");
//register a new user in the mongo database
const register = async (data) => {
    console.log("registering");
    const user = await collection.insertOne(data);
    return user;
}

//check if user already exists in mongo database
const checkExistingUser = async (email) => {
    console.log("checking existing user");
    const user = await collection.find({email : email}).toArray();
        console.log("query executed");
    return user;
}

//login a user
const login = async (email) => {
    const user = await collection.find({email : email});
    return user;
}

//reset password
const resetPassword = async (email, password) => {
    return await collection.updateOne({email : email}, {$set : {password : password}});
}

//send email
const sendEmail = async (mailOptions, verificationCode) => {
    console.log("sending email");
  const sent =   await transporter.sendMail(mailOptions);
    console.log("email sent");
    //add verification code to database
    await collection.updateOne({email : mailOptions.to}, {$set : {verificationCode : verificationCode}});
    return sent;
    
}

const sendResetLink = async (mailOptions) => {
    console.log("sending email");
    const sent = await transporter.sendMail(mailOptions);
    console.log("email sent");
    return sent;
}
//verify Email
const verifyEmail = async (email) => {
    return await collection.updateOne({email : email}, {$set : {verified : true}});
}





module.exports = {
    register,
    checkExistingUser,
    login,
    resetPassword,
    sendEmail,
    verifyEmail,
    sendResetLink
}
