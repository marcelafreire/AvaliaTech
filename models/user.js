const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		username: {
			type: String
		},
		password: {
			type: String
		},
		role: {
			type: String,
			enum: [ 'GUEST', 'EDITOR', 'ADMIN' ],
			default: 'EDITOR'
		},
		email: String,
		imgName: String,
		imgPath: {
			type: String,
			default: 'https://res.cloudinary.com/deyy3glzl/image/upload/v1587652134/perfil-avalia_uekcwz.png'
		}
	},
	{
		timestamps: true
	}
);

const User = mongoose.model('User', userSchema);
module.exports = User;
