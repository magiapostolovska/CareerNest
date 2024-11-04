const mongoose = require('mongoose');

const StudentsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  university: { type: String, required: true },
  faculty: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  index: { type: String, required: true },
  createdAt: { type: Date, required: false },
  updatedAt: { type: Date, default: null },
  createdBy: { type: String, required: false},
  updatedBy: { type: String, default: null },
});

const Students = mongoose.model('Students', StudentsSchema);

module.exports = Students;
