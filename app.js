const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const _ = require("lodash");
const ejs = require("ejs");
const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Database Connectivity with localhost
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// userSchema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

var secret = "Thisisasecret";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
const User = new mongoose.model("user", userSchema);


// secretSchema
const secretSchema = new mongoose.Schema({
    secret: String
});
const Secret = new mongoose.model("secret", secretSchema);

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


//*******  All post methods *******//

// New User Registration
app.post("/register", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    
    const newUser = new User({
        email: email,
        password: password
    });
    newUser.save();
    res.render("secrets");
    console.log("New User created successfully");
});

// User Authentication
app.post("/login", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({ email: email, password: password }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                res.render("secrets");
            }
        }
    });
});

// Submit Post
app.post("/submit", (req, res) => {
    var newSecret = req.body.secret;
    var tempSecret = new Secret({
        secret: newSecret
    });
    tempSecret.save();
    res.render("Secret");
});

// ***** App Port Listen  *****//
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
