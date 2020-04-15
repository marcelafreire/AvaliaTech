const express = require('express');
const router = express.Router();

const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');

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

router.get('/course/add', (req, res) => {
	res.render('course/add');
});

router.post('/course/add', (req, res) => {
	const { name, institution, value, duration, format, category, review, rating } = req.body;

	const reviews = [ { review, rating } ];
	const newCourse = { name, institution, value, duration, format, category, reviews };

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

router.get('/course/:id', (req, res) => {
	// const userId = req.session.passport.user;
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
			// course.reviews.forEach((review) => {
			// 	console.log('writerId: ', review.writer._id);
			// 	console.log('userId: ', userId);
			// 	console.log(review.writer._id === userId);
			// 	if (review.writer._id === userId) {
			// 		console.log('igual');
			// 	}
			// });
			res.render('course/show', course);
		})
		.catch((err) => console.log(err));
});

router.get('/course/edit/:id', (req, res) => {
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

router.get('/course/delete/:id', (req, res) => {
	const { id } = req.params;

	Course.findByIdAndDelete(id)
		.then((course) => {
			console.log(course);
			res.redirect('/course/list');
		})
		.catch((err) => console.log(err));
});

router.get('/test', (req, res) => {
	res.render('course/test');
});

router.get('/review/json/:id', (req, res) => {
	const { id } = req.params;
	console.log(id);
	Course.findOne({ _id: id })
		.then((review) => {
			console.log(review);
			res.json(review);
		})
		.catch((err) => console.log(err));
});

router.put('/test/edit/:id', (req, res) => {
	const { name } = req.body;
	const { id } = req.params;
	console.log(name);
	Course.findOneAndUpdate({ _id: id }, { name })
		.then((course) => {
			console.log(course);
			res.send('foi');
		})
		.catch((err) => console.log(err));
});

router.get('/session', (req, res) => {
	res.send(req.session);
});

module.exports = router;
