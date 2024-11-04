
const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  
  username: { type: String, required: false},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, required: false },
  updatedAt: { type: Date, default: null },
  city: {type: String, required: false},
  createdBy: { type: String, required: false},
  updatedBy: { type: String, default: null },
  role: { type: String, enum: ['admin', 'user', 'student'],  },  
  profilePicture: { type: String, required: false },
  bio: { type: String, required: false },
  phoneNumber: {type: String, required: false}
});

const Users = mongoose.model('Users', UsersSchema);

module.exports = Users;
