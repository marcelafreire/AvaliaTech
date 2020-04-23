const express = require('express');
const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');
const session = require('express-session');
const mongoose = require('mongoose');

//Review API
router.put('/course/:courseID/api/review/:id', (req, res) => {
	const userId = req.user._id;
	const { text, rating } = req.body;
	const { id } = req.params;
	console.log(id);
	Review.findOneAndUpdate({ _id: id }, { text, rating, writer: userId }, { new: true })
		.then((review) => {
			res.json(review);
		})
		.catch((err) => console.log(err));
});

router.delete('/course/:courseID/api/review/:id', (req, res) => {
	const { courseID, id } = req.params;

	Review.findOneAndDelete({ _id: id })
		.then((review) => {
			console.log(review);
			Course.findOne({ _id: courseID })
				.populate('reviews')
				.then((course) => {
					if (course.reviews && course.reviews.length === 0) {
						Course.findOneAndDelete({ _id: courseID })
							.then((course) => {
								res.json({ courseDeleted: true });
							})
							.catch((err) => console.log(err));
					} else {
						res.json({ courseDeleted: false });
					}
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => console.log(err));
});

router.post('/reviews/add/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
	const userId = req.user._id;
	const { text, rating } = req.body;
	const { id } = req.params;

	Review.create({ text, rating, writer: mongoose.Types.ObjectId(userId), course: mongoose.Types.ObjectId(id) })
		.then((review) => {
			console.log(review);
			Course.findOneAndUpdate({ _id: id }, { $push: { reviews: review } })
				.then((course) => {
					console.log(course);
					res.redirect(`/course/${course._id}`);
				})
				.catch((error) => {
					console.log(error);
				});
		})
		.catch((error) => {
			console.log(error);
		});
});

module.exports = router;
