require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const app_name = require('./package.json').name;

//banco de dados
mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then((x) => {
		console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
	})
	.catch((err) => {
		console.error('Error connecting to mongo', err);
	});

const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);
const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

const index = require('./routes/index');
const course = require('./routes/course');
const users = require('./routes/users');
app.use('/', index);
app.use('/', course);
app.use('/', users);

module.exports = app;
