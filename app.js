//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://mongodb:27017/unicomi-user", {useNewUrlParser:true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting up the get routes
app.get("/",function(req,res){
    
    res.render("home");
  
});

app.get("/signin", function(req,res){
    res.render("signin");
});

app.get("/signup", function(req,res){
    res.render("signup");
});



app.get("/logout", function(req,res){
    req.logout();
    res.redirect('/');
});

app.get("/dashboard", function(req,res){
    if(req.isAuthenticated()){
        res.render("dashboard");
    }else {
        res.redirect("/signin");
    }
})


app.post("/signin", function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    //passport method
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/dashboard");
            });
        }
    });

});

app.post("/signup", function(req,res){

    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/dashboard");
            });
        }
    });

    
});


app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
});