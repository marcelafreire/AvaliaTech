require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const app_name = require('./package.json').name;
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const ensureLogin = require("connect-ensure-login");
const MongoStore = require('connect-mongo')(session)
const session = require('express-session');

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

//Register Partials
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('isEqualToFive', (value) => {
	console.log(this, value);
	return this.rating === value;
});

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(cookieParser());


app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: "our-passport-local-strategy-app",
  resave: false,
  saveUninitialized: false,
}));


//Passport
passport.serializeUser((user, cb) => {
	cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
	User.findById(id, (err, user) => {
		if (err) {
			return cb(err);
		}
		cb(null, user);
	});
});

app.use(flash());
passport.use(
	new LocalStrategy(
		{
			passReqToCallback: true
		},
		(req, username, password, next) => {
			User.findOne(
				{
					username
				},
				(err, user) => {
					if (err) {
						return next(err);
					}
					if (!user) {
						return next(null, false, {
							message: 'Incorrect username'
						});
					}
					if (!bcrypt.compareSync(password, user.password)) {
						return next(null, false, {
							message: 'Incorrect password'
						});
					}

					return next(null, user);
				}
			);
		}
	)
);

//social login google
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_id,
			clientSecret: process.env.GOOGLE_pass,
			callbackURL: '/auth/google/callback'
		},
		(accessToken, refreshToken, profile, done) => {
			// to see the structure of the data in received response:
			console.log('Google account details:', profile);

			User.findOne({
				googleID: profile.id
			})
				.then((user) => {
					if (user) {
						done(null, user);
						return;
					}

					User.create({
						googleID: profile.id
					})
						.then((newUser) => {
							done(null, newUser);
						})
						.catch((err) => done(err)); // closes User.create()
				})
				.catch((err) => done(err)); // closes User.findOne()
		}
	)
);

// social login facebook
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function (accessToken, refreshToken, profile, done) {
    User.findOne({
        facebookID: profile.id
      })
      .then(user => {
        if (user) {
          done(null, user);
          return;
        }

        User.create({
            facebookID: profile.id
          })
          .then(newUser => {
            done(null, newUser);
          })
          .catch(err => done(err)); // closes User.create()
      })
      .catch(err => done(err)); // closes User.findOne()
  }));
  
//passport initialization
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

const index = require('./routes/index');
const course = require('./routes/course');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
app.use('/', index);
app.use('/', course);
app.use('/', users);
app.use('/', reviews);

module.exports = app;
