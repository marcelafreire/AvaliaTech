require('dotenv').config();

const mongoose = require('mongoose');
const Course = require('../models/course');

mongoose
	.connect(process.env.MONGODB_URI)
	.then((response) => {
		console.log(`Connected to Mongo! Database name: "${response.connections[0].name}"`);

		//Resetar a base de dados
		Course.collection.drop();

		const courses = [
			{
				name: 'JavaScript: Understanding the Weird Parts',
				institution: 'Udemy',
				image: 'https://img-a.udemycdn.com/course/240x135/364426_2991_5.jpg',
				value: 21.99,
				duration: 11.5,
				format: 'online',
				category: 'Desenvolvimento Web',
				reviews: [
					{
						review:
							'Very deep explanation about JS.\n The course keeps what the title promises.\n I learned a lot...',
						rating: 5
					},
					{
						review: `And here I thought I already know so much about JavaScript, good thing I bought this course, it really improved my understanding about how libraries and frameworks work.`,
						rating: 5
					},
					{
						review: `Love the conceptual approach, very thoughtful content and teaching style! Learned a lot. Awesome course!`,
						rating: 4.5
					}
				]
			},
			{
				name: 'Modern JavaScript From The Beginning',
				institution: 'Not Udemy',
				image: 'https://img-a.udemycdn.com/course/240x135/1463348_52a4_2.jpg',
				value: 21.99,
				duration: 21.5,
				format: 'presencial',
				category: 'Desenvolvimento Web',
				reviews: [
					{
						review:
							'You are really a great teacher man, I love your teach styling. Thanks for everything. I gain new skills from you. Html Css Sass and JS. I am really appreciate that. King Regards',
						rating: 5
					},
					{
						review: `You are really a great teacher man, I love your teach styling. Thanks for everything. I gain new skills from you. Html Css Sass and JS. I am really appreciate that. King Regards`,
						rating: 5
					},
					{
						review: `Excellent course, takes you from the basics to the advance concepts with awesome practical projects. Thank You Brad`,
						rating: 4.5
					}
				]
			}
		];

		Course.create(courses)
			.then((response) => {
				console.log(`created ${courses.length} courses`);
				mongoose.connection.close();
			})
			.catch((err) => console.log(err));
	})
	.catch((err) => console.log(err));
