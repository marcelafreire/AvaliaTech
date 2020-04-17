const toggleTextAreaBoxEdit = (idx) => {
	const reviewDiv = document.querySelector('#review' + idx);
	reviewDiv.querySelector(`.textReview`).toggleAttribute('disabled');
	reviewDiv.querySelector(`.ratingReview`).toggleAttribute('disabled');
	reviewDiv.querySelector('.save').toggleAttribute('hidden');
	reviewDiv.querySelector('.edit').toggleAttribute('hidden');
};

const reviewDivs = document.querySelectorAll('.editable');

for (let i = 0; i < reviewDivs.length; i++) {
	reviewDivs[i].setAttribute('id', 'review' + i);
	reviewDivs[i].querySelector('.textReview');
	reviewDivs[i].querySelector('.ratingReview');

	reviewDivs[i].querySelector('.edit').onclick = () => {
		toggleTextAreaBoxEdit(i);
	};

	reviewDivs[i].querySelector('.save').onclick = () => {
		const reviewID = document.querySelector(`#review${i}`).querySelector('.reviewID').value;
		const text = document.querySelector(`#review${i}`).querySelector(`.textReview`).value;
		const rating = document.querySelector(`#review${i}`).querySelector(`.ratingReview`).value;
		axios
			.put(`http://localhost:3000/api/review/${reviewID}`, { text, rating })
			.then((response) => {
				console.log(response.data);
				toggleTextAreaBoxEdit(i);
			})
			.catch((err) => console.log(err));
	};

	reviewDivs[i].querySelector('.delete').onclick = () => {
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
