const express = require("express");
const bodyParser = require("body-parser");
// const ejs = require("ejs");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const today = new Date().toLocaleDateString('en-us', { month: "short", day: "numeric" })


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ghodmare.1@iitj.ac.in',
        pass: 'Chait@123'
    }
});

const app = express();
// app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));


// Creating the database...................................................................

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/birthdays');

const userInfoSchema = new mongoose.Schema({
    name: String,
    emailId: String,
    date: String
})

const Users = mongoose.model("userInfo", userInfoSchema);

const user1 = new Users({               /* This is the test user */
    name: "Sam",
    emailId: "seemarghodmare@gmail.com",
    date: "Jan 6"
})

// user1.save()

// Mongo db code over......................................................................

// Get request to the root route
app.get("/", function (req, res) {
    res.sendFile( __dirname + "/index.html");
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
                to: email,
                subject: 'Successfully signed in my birthdays database.',
                html: "<h1>Hi</h1> <p>This is the auto generated text html file sent after loggin in</p>"
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent ');
                }
            });

            // Sign up confirm Email sender app code ends..............................................................................
        } else {
            res.render("Entered emailId is already sign in");
        }
    })


})



Users.findOne({ date: today }, function (err, result) {
    
    if (result !== null) {
        // console.log("Found a birthday");
        // Sign up Birthday Email sender app code..................................................................................

        var mailOptions = {
            from: 'ghodmare.1@iitj.ac.in',
            to: result.emailId,
            subject: 'Hi this is chaitanya Ghodmare',
            html: "<h1>Hi</h1> <p>This is the auto generated text html file sent after loggin in</p>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Birthday Email sent ');
            }
        });

        // Sign up birthday Email sender app code ends..............................................................................
    }
})





app.listen(3000, function () {
    console.log("Server is running by lightening speed on port 3000");
})










