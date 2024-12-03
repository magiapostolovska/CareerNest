const mongoose = require('mongoose');

const ApplicationsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internships'},
  cvFile: {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true }
},
  coverLetter: { type: String },
  status: { type: String },
  appliedAt: { type: Date },
  updatedAt: { type: Date },
});

const Applications = mongoose.model('Applications', ApplicationsSchema);

module.exports = Applications;
