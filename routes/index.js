const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const User = require('../models/user');


router.get('/', (req, res) => {
	Course.find()
		.then((courses) => {
			res.render('index', { course: courses });
		})
		.catch((error) => {
			console.log('Error ', error);
		});
});

module.exports = router;
