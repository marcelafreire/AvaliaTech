const express = require('express');
const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');
const session = require('express-session');
const mongoose = require('mongoose');

// ROLES control
const checkRoles = (role) => {
	return (req, res, next) => {
		if (req.isAuthenticated() && req.user.role === role) {
			return next();
		} else {
			req.logout();
			res.redirect('/course');
		}
	};
};

const checkGuest = checkRoles('GUEST');
const checkEditor = checkRoles('EDITOR');
const checkAdmin = checkRoles('ADMIN');

router.get('/course', (req, res) => {
	const userID = req.user._id;
	console.log(userID);
	User.findOne({ _id: userID })
		.then((user) => {
			res.render('course/main', { username: user.username, userID });
		})
		.catch((err) => console.log(err));
});

router.get('/course/list', (req, res) => {
	const { name, category, institution, minValue, maxValue, minDuration, maxDuration, format, findByUser } = req.query;
	let userID;

	let query = {};

	if (name) {
		query.name = { $regex: name, $options: 'i' };
	}

	if (category) {
		query.category = category;
	}

	if (institution) {
		query.institution = { $regex: institution, $options: 'i' };
	}

	if (minValue && maxValue) {
		query.value = { $gte: minValue, $lte: maxValue };
	} else {
		if (minValue) {
			query.value = { $gte: minValue };
		}
		if (maxValue) {
			query.value = { $lte: maxValue };
		}
	}

	if (minDuration && maxDuration) {
		query.duration = { $gte: minDuration, $lte: maxDuration };
	} else {
		if (minDuration) {
			query.value = { $gte: minDuration };
		}
		if (maxDuration) {
			query.value = { $lte: maxDuration };
		}
	}

	if (format) {
		query.format = format;
	}

	if (findByUser) {
		if (req.user) {
			userID = req.user._id;
			Review.find({ writer: userID }, { _id: 1 })
				.then((reviewsIDs) => {
					query.reviews = { $in: reviewsIDs };
					Course.find(query)
						.then((courses) => {
							res.render('course/list', { userID, courses });
						})
						.catch((err) => console.log(err));
				})
				.catch((err) => console.log(err));
		}
	} else {
		Course.find(query)
			.then((courses) => {
				console.log(courses);
				const formats = Course.schema.path('format').enumValues;
				const categories = Course.schema.path('category').enumValues;
				res.render('course/list', { courses, formats, categories, userID });
			})
			.catch((err) => console.log(err));
	}
});

router.get('/course/add', (req, res) => {
	const formats = Course.schema.path('format').enumValues.map((format) => {
		return { format, selected: false };
	});
	const categories = Course.schema.path('category').enumValues.map((category) => {
		return { category, selected: false };
	});
	const isAdding = true;
	console.log('foi');
	res.render('course/add', { formats, categories, isAdding });
});

router.post('/course/add', ensureLogin.ensureLoggedIn(), (req, res) => {
	const { name, institution, value, duration, format, link, category, text, rating } = req.body;
	const newCourse = { name, institution, value, duration, format, category, link };

	User.findOne({ _id: req.user.id })
		.then((writer) => {
			Review.create({ text, rating, writer }).then((review) => {
				newCourse.reviews = [ review ];
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
		})
		.catch((err) => console.log(err));
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
			//Owner Logic and Ratings
			course.reviews = course.reviews.map((review) => {
				if (
					(review.writer && review.writer._id.toString() === req.user._id.toString()) ||
					req.user.role === 'ADMIN'
				) {
					review.isOwner = true;
				}

				let ratings = [];
				for (let i = 0; i <= 5; i++) {
					ratings.push({ value: i, isRating: review.rating === i });
				}
				review.ratings = ratings;
				return review;
			});

			res.render('course/show', {
				course,
				user: req.user
			});
		})
		.catch((err) => console.log(err));
});

router.get('/course/edit/:id', checkRoles('ADMIN'), (req, res) => {
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
			const formats = Course.schema.path('format').enumValues.map((format) => {
				return { format, selected: course.format === format };
			});
			const categories = Course.schema.path('category').enumValues.map((category) => {
				return { category, selected: course.category === category };
			});
			const isEditing = true;
			res.render('course/edit', { course, categories, formats, isEditing });
		})
		.catch((err) => console.log(err));
});

router.post('/course/edit/:id', (req, res) => {
	const { name, institution, value, duration, link, format, category } = req.body;
	const { id } = req.params;

	const editCourse = { name, institution, value, duration, link, format, category };

	Course.findOneAndUpdate({ _id: id }, editCourse, { new: true })
		.then((course) => {
			console.log(course);
			res.redirect(`/course/edit/${course._id}`);
		})
		.catch((err) => console.log(err));
});

router.get('/course/delete/:id', checkRoles('ADMIN'), (req, res) => {
	const { id } = req.params;

	Course.findByIdAndDelete(id)
		.then((course) => {
			console.log(course);
			res.redirect('/course/list');
		})
		.catch((err) => console.log(err));
});

module.exports = router;
