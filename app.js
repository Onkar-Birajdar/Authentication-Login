const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");
const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("user", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    
    const newUser = new user({
        email: email,
        password: password
    });
    newUser.save();
    res.render("secrets");
    console.log("New User created successfully");
});

app.post("/login", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({ email: email }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            } else {
                res.send("No user found");
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
