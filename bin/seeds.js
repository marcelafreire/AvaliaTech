require('dotenv').config();

const mongoose = require('mongoose');
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');

mongoose
	.connect(process.env.MONGODB_URI)
	.then((response) => {
		console.log(`Connected to Mongo! Database name: "${response.connections[0].name}"`);

		//Resetar a base de dados
		Course.collection.drop();
		User.collection.drop();
		Review.collection.drop();

		const users = [
			{
				username: 'massao',
				password: '123',
				role: 'ADMIN',
				email: 'massao@avaliatech.com',
				path: '',
				originalName: ''
			},
			{
				username: 'marcela',
				password: '123',
				role: 'ADMIN',
				email: 'marcela@avaliatech.com',
				path: '',
				originalName: ''
			},
			{
				username: 'nassau',
				password: '123',
				role: 'GUEST',
				email: 'nassau@avaliatech.com',
				path: '',
				originalName: ''
			}
		];

		User.create(users)
			.then((usersCreated) => {
				console.log(usersCreated);

				const reviews1 = [
					{
						text:
							'Very deep explanation about JS.\n The course keeps what the title promises.\n I learned a lot...',
						rating: 5,
						writer: usersCreated[0]._id
					},
					{
						text: `And here I thought I already know so much about JavaScript, good thing I bought this course, it really improved my understanding about how libraries and frameworks work.`,
						rating: 5,
						writer: usersCreated[1]._id
					},
					{
						text: `Love the conceptual approach, very thoughtful content and teaching style! Learned a lot. Awesome course!`,
						rating: 4.5,
						writer: usersCreated[2]._id
					}
				];

				Review.create(reviews1)
					.then((reviews) => {
						const course = [
							{
								name: 'JavaScript: Understanding the Weird Parts',
								institution: 'Udemy',
								image: 'https://img-a.udemycdn.com/course/240x135/364426_2991_5.jpg',
								value: 21.99,
								duration: 11.5,
								format: 'online',
								category: 'Desenvolvimento Web',
								reviews: reviews
							}
						];

						Course.create(course)
							.then((courseCreated) => {
								console.log(courseCreated);
								console.log(`created ${course.length} courses`);
								mongoose.connection.close();
							})
							.catch((err) => console.log(err));
					})
					.catch((err) => console.log(err));

				const reviews2 = [
					{
						text:
							'You are really a great teacher man, I love your teach styling. Thanks for everything. I gain new skills from you. Html Css Sass and JS. I am really appreciate that. King Regards',
						rating: 5,
						writer: usersCreated[0]._id
					},
					{
						text: `You are really a great teacher man, I love your teach styling. Thanks for everything. I gain new skills from you. Html Css Sass and JS. I am really appreciate that. King Regards`,
						rating: 5,
						writer: usersCreated[1]._id
					},
					{
						text: `Excellent course, takes you from the basics to the advance concepts with awesome practical projects. Thank You Brad`,
						rating: 4.5,
						writer: usersCreated[2]._id
					}
				];

				Review.create(reviews2)
					.then((reviews) => {
						const course = [
							{
								name: 'Modern JavaScript From The Beginning',
								institution: 'Not Udemy',
								image: 'https://img-a.udemycdn.com/course/240x135/1463348_52a4_2.jpg',
								value: 21.99,
								duration: 21.5,
								format: 'presencial',
								category: 'Desenvolvimento Web',
								reviews: reviews
							}
						];

						Course.create(course)
							.then((courseCreated) => {
								console.log(courseCreated);
								console.log(`created ${course.length} courses`);
								mongoose.connection.close();
							})
							.catch((err) => console.log(err));
					})
					.catch((err) => console.log(err));
			})
			.catch((err) => console.log(err));
	})
	.catch((err) => console.log(err));
