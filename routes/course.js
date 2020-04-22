const express = require('express');
const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');
const session = require('express-session');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	let loggedUser;
	if (req.user) {
		loggedUser = req.user;
	}

	const {
		name,
		category,
		institution,
		minValue,
		maxValue,
		minDuration,
		maxDuration,
		minAvg,
		maxAvg,
		format,
		findByUser
	} = req.query;
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

	const formats = Course.schema.path('format').enumValues;
	const categories = Course.schema.path('category').enumValues;
	let findReviewsByWriter = autoResolvedPromise();

	if (findByUser && req.user) {
		userID = req.user._id;
		// aggregatePipeline.push({ $match: { writer: userID } });
		findReviewsByWriter = Review.find({ writer: userID }, { _id: 1 });
	}

	let aggregatePipeline = [];

	aggregatePipeline.push({ $group: { _id: '$course', average: { $avg: '$rating' } } });

	if (minAvg && maxAvg) {
		aggregatePipeline.push({ $match: { average: { $gte: parseFloat(minAvg), $lte: parseFloat(maxAvg) } } });
	} else {
		if (minAvg) {
			aggregatePipeline.push({ $match: { average: { $gte: parseFloat(minAvg) } } });
		}
		if (maxAvg) {
			aggregatePipeline.push({ $match: { average: { $lte: parseFloat(maxAvg) } } });
		}
	}

	// console.log(aggregatePipeline);

	Review.aggregate(aggregatePipeline)
		.then((response) => {
			// console.log(response);
			query._id = { $in: response.map((obj) => obj._id) };
			findReviewsByWriter
				.then((reviewsIDs) => {
					if (reviewsIDs) {
						query.reviews = { $in: reviewsIDs };
					}
					return Course.find(query);
				})
				.then((courses) => {
					response.forEach((response) => {
						courses.forEach((course) => {
							if (course._id && response._id) {
								if (course._id.toString() === response._id.toString()) {
									course.average = response.average.toFixed(2);
								}
							}
						});
					});
					res.render('course/list', { categories, formats, userID, courses, loggedUser });
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => console.log(err));
});

router.get('/course/add', (req, res) => {
	let loggedUser;
	if (req.user) {
		loggedUser = req.user;
	}

	const formats = Course.schema.path('format').enumValues.map((format) => {
		return { format, selected: false };
	});
	const categories = Course.schema.path('category').enumValues.map((category) => {
		return { category, selected: false };
	});
	const isAdding = true;
	console.log('foi');
	res.render('course/add', { formats, categories, isAdding, loggedUser });
});

router.post('/course/add', ensureLogin.ensureLoggedIn(), (req, res) => {
	const { name, institution, value, duration, format, link, category, text, rating } = req.body;
	const newCourse = { name, institution, value, duration, format, category, link };

	Course.create(newCourse)
		.then((course) => {
			console.log(course);
			Review.create({
				text,
				rating,
				writer: mongoose.Types.ObjectId(req.user.id),
				course: course._id
			}).then((review) => {
				course.reviews = [ review ];
				Course.findOneAndUpdate({ _id: course._id }, course).then((response) => {
					res.redirect('/course/list');
				});
			});
		})
		.catch((err) => {
			console.log(err);
			res.render('error');
		});
});

router.get('/course/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
	let loggedUser;
	if (req.user) {
		loggedUser = req.user;
	}

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
			if (req.user.role === 'ADMIN') {
				course.isAdmin = true;
			}

			course.reviews = course.reviews.map((review) => {
				if ((review.writer && review.writer._id.toString() === req.user._id.toString()) || course.isAdmin) {
					review.isOwner = true;
					course.haveAReview = true;
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
				user: req.user,
				loggedUser
			});
		})
		.catch((err) => console.log(err));
});

router.get('/course/edit/:id', checkRoles('ADMIN'), (req, res) => {
	let loggedUser;
	if (req.user) {
		loggedUser = req.user;
	}

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
			res.render('course/edit', { course, categories, formats, isEditing, loggedUser });
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

router.get('/avg', (req, res) => {
	Review.aggregate([ { $group: { _id: '$course', average: { $avg: '$rating' } } } ])
		.then((avg) => {
			console.log(avg);
			res.send(avg);
		})
		.catch((err) => console.log(err));
});

router.get('/avg/:id', (req, res) => {
	const { id } = req.params;

	Review.aggregate([
		{ $match: { course: mongoose.Types.ObjectId(id) } },
		{ $group: { _id: '$course', average: { $avg: '$rating' } } }
	])
		.then((avg) => {
			console.log(avg);
			res.send(avg);
		})
		.catch((err) => console.log(err));
});

router.get('/greaterAvg', (req, res) => {
	autoResolvedPromise()
		.then(() =>
			Review.aggregate([
				{ $group: { _id: '$course', average: { $avg: '$rating' } } },
				{ $match: { average: { $gte: 1, $lte: 2 } } }
			])
				.then((avg) => {
					console.log(avg);
					res.send(avg);
				})
				.catch((err) => console.log(err))
		)
		.catch((err) => console.log(err));
});

const autoResolvedPromise = () => {
	return new Promise((resolve, reject) => resolve());
};

module.exports = router;
