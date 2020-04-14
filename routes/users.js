const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const User = require('../models/user');
const uploadCloud = require('../config/cloudinary.js');
const passport = require("passport");
const nodemailer = require('nodemailer');

// NODEMAILER
let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_user,
        pass: process.env.MAIL_pass
    }
});

// let transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: process.env.MAIL_user,
//         pass: process.env.MAIL_pass
//     }
//   });



//LOGIN
router.get('/login', (req, res) => {
    res.render('users/login');
});
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
    passReqToCallback: true,
}));


//social login
// router.post("/login", passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//     failureFlash: true,
//     passReqToCallback: true,
//   }));


//SOCIAL LOGIN
//google
// router.get("/auth/google", passport.authenticate("google", {
//       scope: [
//         "https://www.googleapis.com/auth/userinfo.profile",
//         "https://www.googleapis.com/auth/userinfo.email"
//       ]
//     })
//   );
//   router.get(
//     "/auth/google/callback",
//     passport.authenticate("google", {
//       successRedirect: "/books",
//       failureRedirect: "/login" // here you would redirect to the login page using traditional login approach
//     })
//   );

//SIGNUP
//get
router.get('/signup', (req, res, next) => {
    res.render('users/signup');
})

//post 
router.post("/signup", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
      token += characters[Math.floor(Math.random() * characters.length )];
  }
  
    if (username === "" || password === "" || email === "") {
      res.render("/signup", { message: "Indicate username, password and your email" });
      return;
    }

    User.findOne({ username }, "username", (err, user) => {
        if (user !== null) {
          res.render("users/signup", { message: "O usuário já existe" });
          return;
        }
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(password, salt);
    
        const newUser = new User({
          username,
          password: hashPass,
          email,
          confirmationCode: token,
        });
    
       newUser.save()
       .then(user => {
        transporter.sendMail({
          from: '"My Awesome Project " <noreply@project.com>',
          to: user.email,
          subject: 'Welcome', 
          text: `<a href="http://localhost:3000/auth/confirm/${user.confirmationCode}"></a>`,
          html: '<b>Awesome Message</b>'
        })
        .then(user => {
          res.redirect('/');
        })
        .catch(error => res.render('index', {
          errorMessage: error
        }));
    
      })
      .catch(err => res.status(400).render('index', {
        errorMessage: err.errmsg
      })); 
    })
});

//LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
});

//ABOUT
router.get('/about', (req, res) => {
    res.render('home/about');
})


module.exports = router;