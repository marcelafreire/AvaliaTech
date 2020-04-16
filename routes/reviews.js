const express = require('express');
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');
const session = require("express-session");


//Review API
router.put('/api/review/:id', (req, res) => {
    const userId = req.user._id
	const { text, rating } = req.body;
	const { id } = req.params;
	console.log(id);
	Review.findOneAndUpdate({ _id: id }, { text, rating, writer:userId }, { new: true })
		.then(review => {
            const managedReviews = review.map(review => {
                if (review.writer && review.writer.toString() === req.user._id.toString()) {
                  review.isOwner = true;
                }
                return review;
              });
              res.json(review, {
                review: managedReviews,
                user: req.user,
              });
			// res.json(review);
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


router.post('/reviews/add/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
	const userId = req.user._id
	const {text, rating} = req.body;
    const {id} = req.params

	User.findOne({_id: userId})
	.then(user => {	
        console.log(user)

	Review.create({text, rating, writer:user})
	.then(review => {
		Course.findOneAndUpdate({_id: id}, {$push: { reviews: review}})
		.then(course => {
			res.redirect(`/course/${course._id}`)
		})
		.catch((error) => {console.log(error)})
	})
	.catch((error) => {console.log(error)})
  })
  .catch((error) => {console.log(error)})
});

module.exports = router;
