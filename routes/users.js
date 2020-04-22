const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const User = require('../models/user');
const uploadCloud = require('../config/cloudinary.js');
const passport = require('passport');
const nodemailer = require('nodemailer');
const ensureLogin = require('connect-ensure-login');
const LocalStrategy = require('passport-local').Strategy;

//LOGIN
router.get('/login', (req, res) => {
	res.render('users/login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true,
		passReqToCallback: true
	})
);

//SOCIAL LOGIN
//google
router.get(
	'/auth/google',
	passport.authenticate('google', {
		scope: [ 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email' ]
	})
);
router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/login'
	})
);

//facebook
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get(
	'/auth/facebook/callback',
	passport.authenticate('facebook', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		res.redirect('/');
	}
);

//SIGNUP
//get
router.get('/signup', (req, res, next) => {
	res.render('users/signup');
});
//post
router.post('/signup', uploadCloud.single('photo'), (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	const email = req.body.email;

	if (username === '' || password === '' || email === '') {
		res.render('users/signup', { errorMessage: 'Preencha nome de usuário, e-mail e senha corretamente' });
		return;
	}
	User.findOne({ username }, 'username', (err, user) => {
		if (user !== null) {
			res.render('users/signup', { errorMessage: 'O usuário já existe' });
			return;
		}
		const salt = bcrypt.genSaltSync(bcryptSalt);
		const hashPass = bcrypt.hashSync(password, salt);

		const newUser = new User({
			username,
			password: hashPass,
			email,
			confirmationCode: token
		});

		newUser
			.save()
			.then((user) => {
				res.redirect('/');
			})
			.catch((err) =>
				res.status(400).render('index', {
					errorMessage: err.errmsg
				})
			);
	});
});

//PROFILE

router.get('/profile/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
	let loggedUser;
	if (req.user) {
		loggedUser = req.user;
	}
	const { id } = req.params;

	User.findOne({ _id: id })
		.then((user) => {
			res.render(`users/profile`, { user, loggedUser });
		})
		.catch((error) => {
			console.log('Error ', error);
		});
});

// editar infos
router.post('/profile-edit', uploadCloud.single('photo'), ensureLogin.ensureLoggedIn(), (req, res) => {
	const { username, email } = req.body;
	const { id } = req.query;

	if (username !== '' || email !== '') {
	}
	User.findByIdAndUpdate({ _id: id }, { $set: { username, email } }, { new: true })
		.then((response) => {
			console.log(response);
			res.redirect(`/profile/${id}`);
		})
		.catch((error) => console.log(error));
});

router.post('/img-edit', uploadCloud.single('photo'), ensureLogin.ensureLoggedIn(), (req, res) => {
	const imgPath = req.file.url;
	const { id } = req.query;

	User.findByIdAndUpdate({ _id: id }, { $set: { imgPath } }, { new: true })
		.then((response) => {
			console.log(response);
			res.redirect(`/profile/${id}`);
		})
		.catch((error) => console.log(error));
});

// //PASSWORD
router.get('/password/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
	const { id } = req.params;
	User.findById({ _id: id })
		.then((user) => {
			console.log(user);
			res.render('users/password', user);
		})
		.catch((error) => {
			console.log('Error ', error);
		});
});

// editar
router.post('/password', ensureLogin.ensureLoggedIn(), (req, res) => {
	console.log(req.body);
	let password = req.body.password;
	const salt = bcrypt.genSaltSync(bcryptSalt);
	const hashPass = bcrypt.hashSync(password, salt);
	const { id } = req.query;

	password = hashPass;

	if (!password) {
		res.render(`users/password/${id}`, { errorMessage: 'Senha incorreta' });
		return;
	}

	const newPassword = req.body.newPassword;
	const newPassword2 = req.body.newPassword2;
	const newHashPass = bcrypt.hashSync(newPassword2, salt);

	if (newPassword !== newPassword2) {
		res.render(`users/password/${id}`, { errorMessage: 'Digite a mesma senha' });
		return;
	}

	User.findByIdAndUpdate({ _id: id }, { $set: { password: newHashPass } }, { new: true })
		.then((response) => {
			res.redirect(`/profile/${id}`);
		})
		.catch((error) => console.log(error));
});

//LOGOUT
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/login');
});

module.exports = router;
