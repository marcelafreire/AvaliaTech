const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    // unique: true,
    // required: true
  },
  password: {
    type: String,
    // required: true
  },
  role: {
    type: String,
    enum : ['GUEST', 'EDITOR', 'ADMIN'],
    default : 'GUEST'
  },
  email: String,
  path: String, // points to the path of the image
  originalName: String // images original name
}, 

{
  timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;