document.getElementById('btn').onclick = () => {
	console.log('axios: ', axios);
	axios
		.get('http://localhost:3000/test/json/5e9623179f4bf15ff07bfac9')
		.then((response) => {
			console.log(response.data);
			// document.querySelector('div').innerHTML = `<h1>${response.data.name}</h1>`;
			document.querySelector('#input').value = response.data.name;
		})
		.catch((err) => console.log(err));
};

document.getElementById('btn-edit').onclick = () => {
	axios
		.put('http://localhost:3000/test/edit/5e9623179f4bf15ff07bfac9', {
			name: document.querySelector('#input').value
		})
		.then((response) => {
			console.log(response);
			// document.querySelector('div').innerHTML = `<h1>${response.data.name}</h1>`;
			// document.querySelector('#input').value = response.data.name;
		})
		.catch((err) => console.log(err));
};
