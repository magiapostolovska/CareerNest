
const mongoose = require('mongoose');

const ApplicationsSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Students', required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internships', required: true},
  cv: { type: String },
  coverLetter: { type: String },
  status: { type: String },
  appliedAt: { type: Date },
  updatedAt: { type: Date },
});

const Applications = mongoose.model('Applications', ApplicationsSchema);

module.exports = Applications;
