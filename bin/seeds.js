require('dotenv').config();
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const mongoose = require('mongoose');
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');

mongoose
	// .connect(process.env.MONGODB_URI)
	.connect('mongodb://heroku_9dc9b1sc:qjlie1923qoqvgdt3vfaurdu7g@ds153752.mlab.com:53752/heroku_9dc9b1sc')
	.then((response) => {
		console.log(`Connected to Mongo! Database name: "${response.connections[0].name}"`);

		//Resetar a base de dados
		Course.collection.drop();
		User.collection.drop();
		Review.collection.drop();

		const salt = bcrypt.genSaltSync(bcryptSalt);
		const hashPass = bcrypt.hashSync('123', salt);

		const users = [
			{
				username: 'massao',
				password: hashPass,
				role: 'ADMIN',
				email: 'massao@avaliatech.com',
				path: '',
				originalName: ''
			},
			{
				username: 'marcela',
				password: hashPass,
				role: 'ADMIN',
				email: 'marcela@avaliatech.com',
				path: '',
				originalName: ''
			},
			{
				username: 'nassau',
				password: hashPass,
				role: 'GUEST',
				email: 'nassau@avaliatech.com',
				path: '',
				originalName: ''
			}
		];

		User.create(users)
			.then((usersCreated) => {
				console.log(usersCreated);

				const courses = [
					{
						name: 'JavaScript: Understanding the Weird Parts',
						institution: 'Udemy',
						image: 'https://img-a.udemycdn.com/course/240x135/364426_2991_5.jpg',
						value: 21.99,
						duration: 11.5,
						format: 'online',
						category: 'Desenvolvimento Web'
					},
					{
						name: 'Modern JavaScript From The Beginning',
						institution: 'Not Udemy',
						image: 'https://img-a.udemycdn.com/course/240x135/1463348_52a4_2.jpg',
						value: 21.99,
						duration: 21.5,
						format: 'presencial',
						category: 'Desenvolvimento Web'
					}
				];

				Course.create(courses)
					.then((coursesCreated) => {
						console.log(coursesCreated);
						const reviews0 = [
							{
								text:
									'Very deep explanation about JS.\n The course keeps what the title promises.\n I learned a lot...',
								rating: 5,
								writer: usersCreated[0]._id,
								course: coursesCreated[0]._id
							},
							{
								text: `And here I thought I already know so much about JavaScript, good thing I bought this course, it really improved my understanding about how libraries and frameworks work.`,
								rating: 5,
								writer: usersCreated[1]._id,
								course: coursesCreated[0]._id
							},
							{
								text: `Love the conceptual approach, very thoughtful content and teaching style! Learned a lot. Awesome course!`,
								rating: 4.5,
								writer: usersCreated[2]._id,
								course: coursesCreated[0]._id
							}
						];

						Review.create(reviews0)
							.then((reviews0Created) => {
								coursesCreated[0].reviews = reviews0Created;

								Course.findOneAndUpdate({ _id: coursesCreated[0]._id }, coursesCreated[0])
									.then((course0) => {
										console.log(course0);

										const reviews1 = [
											{
												text:
													'You are really a great teacher man, I love your teach styling. Thanks for everything. I gain new skills from you. Html Css Sass and JS. I am really appreciate that. King Regards',
												rating: 1,
												writer: usersCreated[0]._id,
												course: coursesCreated[1]._id
											},
											{
												text: `You are really a great teacher man, I love your teach styling. Thanks for everything. I gain new skills from you. Html Css Sass and JS. I am really appreciate that. King Regards`,
												rating: 2,
												writer: usersCreated[1]._id,
												course: coursesCreated[1]._id
											},
											{
												text: `Excellent course, takes you from the basics to the advance concepts with awesome practical projects. Thank You Brad`,
												rating: 1,
												writer: usersCreated[2]._id,
												course: coursesCreated[1]._id
											}
										];

										Review.create(reviews1)
											.then((reviews1Created) => {
												coursesCreated[1].reviews = reviews1Created;

												Course.findOneAndUpdate(
													{ _id: coursesCreated[1]._id },
													coursesCreated[1]
												)
													.then((course1) => {
														console.log(course1);
														mongoose.connection.close();
													})
													.catch((err) => console.log(err));
											})
											.catch((err) => console.log(err));
									})
									.catch((err) => {
										console.log(err);
									});
							})
							.catch((err) => console.log(err));
					})
					.catch((err) => console.log(err));
			})
			.catch((err) => console.log(err));
	})
	.catch((err) => console.log(err));
