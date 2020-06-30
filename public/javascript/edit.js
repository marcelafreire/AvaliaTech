document.getElementById('btn').addEventListener('click', function(event) {
	let editName = document.getElementById('edit');
	editName.removeAttribute('disabled');
	//    console.log('teste')
	console.log(document.getElementById('edit2').value);
});

document.getElementById('btn2').addEventListener('click', function(event) {
	let editName = document.getElementById('edit2');
	editName.removeAttribute('disabled');
	//    console.log('teste')
});

document.querySelector('#form-profile').addEventListener('submit', function(event) {
	document.getElementById('edit').removeAttribute('disabled');
	document.getElementById('edit2').removeAttribute('disabled');
	console.log('submit');
});
