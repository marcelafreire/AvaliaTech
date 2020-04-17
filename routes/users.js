const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const User = require('../models/user');
const uploadCloud = require('../config/cloudinary.js');
const passport = require('passport');
const nodemailer = require('nodemailer');
const ensureLogin = require("connect-ensure-login");
const LocalStrategy = require('passport-local').Strategy




// NODEMAILER
let transporter = nodemailer.createTransport({
	host: 'smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: process.env.MAIL_user,
		pass: process.env.MAIL_pass
	}
});


//LOGIN
router.get('/login', (req, res) => {
	res.render('users/login');
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true,
}));


//SOCIAL LOGIN
//google
router.get("/auth/google", passport.authenticate("google", {
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ]
    })
  );
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login" 
    })
  );

  //facebook
  router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/login' 
  }),
  function(req, res) {
    res.redirect('/');
  });


//SIGNUP
//get
router.get('/signup', (req, res, next) => {
    res.render('users/signup');
})
//post 
router.post("/signup", uploadCloud.single('photo'), (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
      token += characters[Math.floor(Math.random() * characters.length )];
  }

    if (username === "" || password === "" || email === "") {
      res.render("users/signup", { errorMessage: "Preencha nome de usuário, e-mail e senha corretamente" });
      return;
    }
    User.findOne({ username }, "username", (err, user) => {
        if (user !== null) {
          res.render("users/signup", { errorMessage: "O usuário já existe" });
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

//ABOUT
router.get('/about', (req, res) => {
    res.render('home/about');
})

//PROFILE

  router.get('/profile/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
    const {id} = req.params;
    // console.log(imgPath)
    User.findById(id)
      .then(user => {
        console.log(user)
        res.render('users/profile', user);
      })
      .catch(error => {
        console.log('Error ', error);
      })
    });
  // editar infos
  router.post('/profile-edit', uploadCloud.single('photo'), ensureLogin.ensureLoggedIn(), (req, res) => {
    const {username, email} = req.body;
    const imgPath = req.file.url;
    const {id} = req.query;

    if(username !== "" || email !== "") {
     }
 User.findByIdAndUpdate({_id: id}, 
      {$set: {username, email, imgPath}}, 
      {new: true})
      .then(response => {
        console.log(response)
        res.redirect(`/profile/${id}`);
})
      .catch(error => console.log(error));
  });  


// //PASSWORD
router.get('/password/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
  const {id} = req.params;
  User.findById({_id: id})
    .then(user => {
      console.log(user)
      res.render('users/password', user);
    })
    .catch(error => {
      console.log('Error ', error);
    })
  });

// editar 
router.post('/password',  ensureLogin.ensureLoggedIn(), (req, res) => {
  console.log(req.body)
  let password = req.body.password;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);
  const {id} = req.query;

  password = hashPass

  if (!password) {
  res.render(`users/password/${id}`, { errorMessage: "Senha incorreta" });
  return;
  }

  const newPassword = req.body.newPassword;
  const newPassword2 = req.body.newPassword2;
  const newHashPass = bcrypt.hashSync(newPassword2, salt);

  if (newPassword !== newPassword2) {
    res.render(`users/password/${id}`, { errorMessage: "Digite a mesma senha" });
  return;
  }

User.findByIdAndUpdate({_id: id}, 
    {$set: {password: newHashPass}}, 
    {new: true})
    .then(response => {
      res.redirect(`/profile/${id}`);
})
    .catch(error => console.log(error));
});  


  //LOGOUT
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
