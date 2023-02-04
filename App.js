const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
require("dotenv").config();
const today = new Date().toLocaleDateString('en-us', { month: "short", day: "numeric" })


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ghodmare.1@iitj.ac.in',
        pass: process.env.TEXT
    }
});

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));


// Creating the database...................................................................

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_DB);

const userInfoSchema = new mongoose.Schema({
    name: String,
    emailId: String,
    date: String
})

const Users = mongoose.model("userInfo", userInfoSchema);


// Mongo db code over......................................................................

// Get request to the root route
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
})

app.post("/", function (req, res) {
    const email = req.body.email;
    const name = req.body.name;
    const date = new Date(req.body.date).toLocaleDateString('en-us', { month: "short", day: "numeric" })

    // creating a new entry in the database

    let newUser = new Users({
        name: name,
        emailId: email,
        date: date
    })

    Users.find(function (err, result) {
        let flag = false;
        result.forEach(element => {                           /* New entry will be added in the database only when the entered emailId is not already in the database  */
            if (element.emailId === email) {

                flag = true;
            }

        });
        if (flag === false) {

            newUser.save();

            // Sign up confirm Email sender app code..................................................................................

            var mailOptions = {
                from: 'ghodmare.1@iitj.ac.in',
                to: result.emailId,
                subject: 'Successfully signed in birthdays database.',
                text: "Thanks for signed in my birthday database. You will be receiving a greetings email on your birthday. "
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent ');
                }
            });

            // Sign up confirm Email sender app code ends..............................................................................
            res.render("success", { gmailID: email });
        } else {
            res.render("nosuccess", { gmailID: email });
        }
    })


})


// console.log(today)
Users.find({ date: today }, function (err, result) {

    if (result != null) {
        
        // Sign up Birthday Email sender app code..................................................................................
        let num = Math.floor((Math.random() * 4) + 1)
        result.forEach(element => {
            var mailOptions = {
                from: 'ghodmare.1@iitj.ac.in',
                to: element.emailId,
                subject: 'Happy Birthday from Chaitanya Ghodmare',
                text: "Wish you a very happy birthday. I hope all your birthday wishes and dreams come true.",
                html: "<p>Wish you a very happy birthday. I hope all your birthday wishes and dreams come true.</p><h1>Forget the past, look for the future, for the best things are yet to come. </h1>",
                attachments: [{
                    path: __dirname + "/BirthdayCard"+ num + ".png"
                }]
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Birthday Email sent ');
                }
            });
        });


        // Sign up birthday Email sender app code ends..............................................................................
    }
})





app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running with lightening speed");
})
