require('dotenv').config();
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
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

		const salt = bcrypt.genSaltSync(bcryptSalt);
		const hashPass = bcrypt.hashSync('123', salt);

		const users = [
			{
				username: 'massao',
				password: hashPass,
				role: 'ADMIN',
				email: 'massao@avaliatech.com',
				imgPath: "http://res.cloudinary.com/deyy3glzl/image/upload/v1586884504/project/ico1.png.png",
				originalName: ''
			},
			{
				username: 'marcela',
				password: hashPass,
				role: 'ADMIN',
				email: 'marcela@avaliatech.com',
				imgPath: "http://res.cloudinary.com/deyy3glzl/image/upload/v1586884504/project/ico1.png.png",
				originalName: ''
			},
			{
				username: 'nassau',
				password: hashPass,
				role: 'GUEST',
				email: 'nassau@avaliatech.com',
				imgPath: "http://res.cloudinary.com/deyy3glzl/image/upload/v1586884504/project/ico1.png.png",
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
						value: 21.99,
						duration: 11.5,
						format: 'online',
						link: 'https://www.udemy.com/courses/search/?src=ukw&q=JavaScript%3A+Understanding+the+Weird+Parts',
						category: 'Desenvolvimento Web'
					},
					{
						name: 'Introdução à linguagem JavaScript',
						institution: 'Udemy',
						value: 50,
						duration: 21.5,
						format: 'online',
						link: 'https://www.udemy.com/course/introducao-a-linguagem-javascript/',
						category: 'Desenvolvimento Web'
					},
					{
						name: 'Curso Desenvolvimento Web com ASP.NET e Visual Studio 2017 (Online - Ao Vivo)',
						institution: 'Impacta',
						value: 729.24,
						duration: 60,
						format: 'online',
						link: 'https://www.impacta.com.br/curso/Desenvolvimento-Web-com-ASPNET-e-Visual-Studio-2017-Online-Ao-Vivo.php',
						category: 'Desenvolvimento Web'
					},
					{
						name: 'Desenvolvimento Web Full Stack',
						institution: 'Digital House',
						value: 1800,
						duration: 150,
						format: 'presencial',
						link: 'https://www.digitalhouse.com/br/curso/desenvolvimento-web-full-stack',
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
