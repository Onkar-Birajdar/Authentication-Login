require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ejs = require("ejs");
const _ = require("lodash");
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
    googleId: { type: String, unique:false},
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("user", userSchema);

// secretSchema
const secretSchema = new mongoose.Schema({
    secret: String,
});
const Secret = new mongoose.model("secret", secretSchema);

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/secrets",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
        },
        function (accessToken, refreshToken, profile, cb) {
            User.findOrCreate({ googleId: profile.id }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);

//*******  All get methods *******//

// Home Page
app.get("/", (req, res) => {
    res.render("home");
});

// Google OAuth
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
);
app.get(
    "/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
        res.redirect("/secrets");
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
        Secret.find({}, (err, foundSecrets) => {
            if (err) {
                console.log(err);
            } else {
                if (foundSecrets) {
                    res.render("secrets", { secrets: foundSecrets });
                }
            }
        });
        
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
