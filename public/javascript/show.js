// document.querySelectorAll('.edit').forEach((element) => {
// 	console.log('elemento');
// 	element.onlick = () => {
// 		// const id = document.getElementById();
// 		console.log('click!');
// 		axios
// 			.get('http://localhost:3000/review/json/5e9623179f4bf15ff07bfac9')
// 			.then((response) => {
// 				console.log(response.data);
// 				// document.querySelector('div').innerHTML = `<h1>${response.data.name}</h1>`;
// 				document.querySelector('#input').value = response.data.name;
// 			})
// 			.catch((err) => console.log(err));
// 	};
// });

document.querySelector('.edit').onclick = () => {
	console.log('click!');
};
