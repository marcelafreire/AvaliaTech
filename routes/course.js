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


router.get('/course/add', (req, res) => {
	const formats = Course.schema.path('format').enumValues;
	const categories = Course.schema.path('category').enumValues;
	res.render('course/add', { formats, categories });
});

router.post('/course/add', (req, res) => {
	//MOCKUP USER
	const username = 'massao'; // MOCKUP USER
	///MOCKUP USER
	const { name, institution, value, duration, format, category, text, rating } = req.body;
	const newCourse = { name, institution, value, duration, format, category };
	
	User.findOne({username})
		.then(writer => {
			Review.create({ text, rating, writer })
				.then( review => {
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
				})
		})
		.catch(err => console.log(err));
});

router.get('/course/:id', (req, res) => {
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
			const formats = Course.schema.path('format').enumValues.map(
				format => {
					return { format, selected: (course.format === format) }
			});
			const categories = Course.schema.path('category').enumValues.map(
				category => {
					return { category, selected: (course.category === category) }
			});
			res.render('course/edit', {course, categories, formats});
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


//Review API
router.put('/api/review/:id', (req, res) => {
	const { text, rating } = req.body;
	const { id } = req.params;
	console.log(id);
	Review.findOneAndUpdate({ _id: id }, { text, rating }, { new: true })
		.then((review) => {
			console.log(review);
			res.json(review);
		})
		.catch((err) => console.log(err));
});

router.delete('/api/review/:id', (req, res) => {
	const { id } = req.params;

	Review.findOneAndDelete({ _id: id })
		.then((review) => {
			console.log(review);
			res.send('Deleted: ' + review);
		})
		.catch((err) => console.log(err));
});


router.post('/reviews/add/:id', (req, res) => {
	const userId = '5e986ec20f415822d648fcbb'
	const {text, rating} = req.body;
	const {id} = req.params

	User.findOne({_id: userId})
	.then(user => {	
		console.log(user)
	Review.create({text, rating, writer:user})
	.then(review => {
		Course.findOneAndUpdate({_id: id}, {$push: { reviews: review}})
		.then(course => {
			res.redirect(`/course/${review._id}`)
		})
		.catch((error) => {console.log(error)})
	})
	.catch((error) => {console.log(error)})
  })
  .catch((error) => {console.log(error)})
});


module.exports = router;
