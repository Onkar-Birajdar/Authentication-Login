//jshint esversion:6
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

// app.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

app.get("/", (req, res) => {
    res.render("home");
});






app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    res.send("Got your response"+email+" "+password);
    // const user = _.find(users, { email: email });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
