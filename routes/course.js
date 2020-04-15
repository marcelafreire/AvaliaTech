const express = require('express');
const router = express.Router();
const ensureLogin = require("connect-ensure-login");


const Course = require('../models/course');

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
	res.render('course/add');
});

router.post('/course/add', ensureLogin.ensureLoggedIn(), (req, res) => {
	const { name, institution, value, duration, format, category, review, rating } = req.body;

	const reviews = [ { review, rating } ];
	const newCourse = { name, institution, value, duration, format, category, reviews };

	// const numbers = /^[-+]?[0-9]+$/;
	// console.log(value.match(numbers));

	Course.create(newCourse)
		.then((course) => {
			console.log(course);
			res.redirect('/course/list');
		})
		.catch((err) => {
			console.log(err);
			res.render('error');
		});
});

module.exports = router;
