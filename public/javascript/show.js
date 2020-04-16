const toggleTextAreaBoxEdit = (idx) => {
	document.querySelector(`#textReview` + idx).toggleAttribute('disabled');
	document.querySelector(`#ratingReview` + idx).toggleAttribute('disabled');
	document.querySelector('#save' + idx).toggleAttribute('hidden');
	document.querySelector('#edit' + idx).toggleAttribute('hidden');
};

const editButtons = document.querySelectorAll('.edit');

for (let i = 0; i < editButtons.length; i++) {
	editButtons[i].onclick = () => {
		toggleTextAreaBoxEdit(i);
	};
}

const saveButtons = document.querySelectorAll('.save');

for (let i = 0; i < saveButtons.length; i++) {
	saveButtons[i].onclick = () => {
		const reviewID = document.querySelector(`#review${i}`).querySelector('.reviewID').value;
		const text = document.querySelector(`#review${i}`).querySelector(`#textReview${i}`).value;
		const rating = document.querySelector(`#review${i}`).querySelector(`#ratingReview${i}`).value;
		axios
			.put(`http://localhost:3000/api/review/${reviewID}`, { text, rating })
			.then((response) => {
				console.log(response.data);
				toggleTextAreaBoxEdit(i);
			})
			.catch((err) => console.log(err));
	};
}

const deleteButtons = document.querySelectorAll('.delete');

for (let i = 0; i < deleteButtons.length; i++) {
	deleteButtons[i].onclick = () => {
		const reviewID = document.querySelector(`#review${i}`).querySelector('.reviewID').value;
		axios
			.delete(`http://localhost:3000/api/review/${reviewID}`)
			.then((response) => {
				console.log(response.data);
				const div = document.querySelector(`#review${i}`);
				div.parentNode.removeChild(div);
			})
			.catch((err) => console.log(err));
	};
}
