const express = require('express');
const router = express.Router();

router.get('/course', (req, res) => {
	res.render('course/main');
});

router.get('/course/list', (req, res) => {
	const { category, institution } = req.query;

	res.render('course/list', { category, institution });
});

module.exports = router;
