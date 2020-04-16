const express = require('express');
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');
const session = require("express-session");

const checkGuest  = checkRoles('GUEST');
const checkEditor = checkRoles('EDITOR');
const checkAdmin  = checkRoles('ADMIN');

//check Roles
function checkRoles(role) {
	return function(req, res, next) {
	  if (req.isAuthenticated() && req.user.role === role) {
		return next();
	  } else {
		res.redirect(`/course`)
	  }
	}
  }

router.get('/course', (req, res) => {
	res.render('course/main');
});

router.get('/course/list', (req, res) => {
	const { category, institution } = req.query;

	if (category) {
		Course.find({ category })
			.then((courses) => {
				console.log(courses);
				res.render('course/list', { category, courses });
			})
			.catch((err) => console.log(err));
	} else if (institution) {
		Course.find({ institution })
			.then((courses) => {
				console.log(courses);
				res.render('course/list', { institution, courses });
			})
			.catch((err) => console.log(err));
	} else {
		Course.find()
			.then((courses) => {
				console.log(courses);
				res.render('course/list', { courses });
			})
			.catch((err) => console.log(err));
	}
});


router.get('/course/add', ensureLogin.ensureLoggedIn(), (req, res) => {
	res.render('course/add', {user: req.user});
});

router.post('/course/add', (req, res) => {
	const { name, institution, value, duration, format, category, review, rating } = req.body;

	const reviews = [ { review, rating } ];
	const newCourse = { name, institution, value, duration, format, category, reviews};

	Course.create(newCourse)
		.then((course) => {
			console.log(course);
			res.redirect('/course/list', {user: req.user});
		})
		.catch((err) => {
			console.log(err);
			res.render('error');
		});
});

router.get('/course/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
	const { id } = req.params;

	Course.findOne({ _id: id })
		.populate({
			path: 'reviews',
			populate: {
				path: 'writer',
				model: 'User'
			}
		})
		.then((course) => {
	
			course.reviews = course.reviews.map(review => {
				// console.log(review.writer.toString(), req.user._id.toString())

                if (review.writer && review.writer._id.toString() === req.user._id.toString()) {
                  review.isOwner = true;
                }
                return review;
              });
              res.render('course/show', {course,
                user: req.user,
              });
		})
		.catch((err) => console.log(err));
});

router.get('/course/edit/:id', checkAdmin, (req, res) => {
	const { id } = req.params;

	Course.findOne({ _id: id })
		.populate({
			path: 'reviews',
			populate: {
				path: 'writer',
				model: 'User'
			}
		})
		.then((course) => {
			console.log(course);
			res.render('course/edit', course);
		})
		.catch((err) => console.log(err));
});

router.post('/course/edit/:id', (req, res) => {
	const { name, institution, value, duration, format, category, text, rating } = req.body;
	const { id } = req.params;

	const editCourse = { name, institution, value, duration, format, category, $push: { reviews: { text, rating } } };

	Course.findOneAndUpdate({ _id: id }, editCourse, { new: true })
		.then((course) => {
			console.log(course);
			res.redirect(`/course/edit/${course._id}`);
		})
		.catch((err) => console.log(err));
});

router.get('/course/delete/:id', checkAdmin, (req, res) => {
	const { id } = req.params;

	Course.findByIdAndDelete(id)
		.then((course) => {
			console.log(course);
			res.redirect('/course/list');
		})
		.catch((err) => console.log(err));
});


module.exports = router;
