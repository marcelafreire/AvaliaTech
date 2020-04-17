const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const User = require('../models/user');


router.get('/', (req, res) => {
    Course.find()
      .then(allusersFromDB => {
        res.render('index', {course: allusersFromDB});
      })
      .catch(error => {
        console.log('Error ', error);
      })
  });
  
  router.get('/', (req, res) => {
    User.find()
      .then(allusersFromDB => {
        res.render('index', {user: allusersFromDB});
      })
      .catch(error => {
        console.log('Error ', error);
      })
  });
  
module.exports = router;