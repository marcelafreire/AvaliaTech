const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;



let findCourse = 
	 Course.find()
		.then((course) => {
			return course
		})
		.catch((error) => {
			console.log('Error ', error);
		});


let findUser = id => {
	return User.findOne({_id: id})
	  .then(user => {
		console.log(user)
		return user
	  })
	  .catch(error => {
		console.log('Error ', error);
});
}


	  router.get('/', (req, res) => {
		let id = '';
		if(req.user) {
			id = req.user._id;
		}
		Promise.all([findUser(id), findCourse])
		.then(element => {
			console.log(element[0])
			res.render('index', {user: element[0], course: element[1]});
		})
		.catch(err => console.error('Error when promising all', err));	  
	  })
	


module.exports = router;
