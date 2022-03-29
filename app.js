require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");
const ejs = require("ejs");
const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// session creation
app.use(
    session({
        secret: "This is a secret",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Database Connectivity with localhost
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// userSchema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

// secretSchema
const secretSchema = new mongoose.Schema({
    secret: String,
});
const Secret = new mongoose.model("secret", secretSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//*******  All get methods *******//

// Home Page
app.get("/", (req, res) => {
    res.render("home");
});

// Login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Submit page
app.get("/submit", (req, res) => {
    res.render("submit");
});

// Register Page
app.get("/register", (req, res) => {
    res.render("register");
});

// Secret Page
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

//Logout Page
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
    // res.render("logout");
});
//*******  All post methods *******//

// New User Registration
app.post("/register", (req, res) => {
    User.register(
        { username: req.body.username },
        req.body.password,
        (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        }
    );
});

// User Authentication
app.post("/login", (req, res) => {
    var user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

// Submit Post
app.post("/submit", (req, res) => {
    var newSecret = req.body.secret;
    var tempSecret = new Secret({
        secret: newSecret,
    });
    tempSecret.save();
    res.redirect("/secrets");
});

// ***** App Port Listen  *****//
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
