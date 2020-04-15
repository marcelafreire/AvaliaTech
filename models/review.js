const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	text: String,
	rating: Number,
	writer: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
