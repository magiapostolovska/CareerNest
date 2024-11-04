
const mongoose = require('mongoose');

const InternshipsSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  requirements: { type: String },
  startTime: { type: String },
  duration: { type: String },
  location: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Companies', required: true},
  participants: { type: Object },
  industry: { type: String },
  createdBy: { type: String, required: false},
  updatedBy: { type: String, default: null }
});

const Internships = mongoose.model('Internships', InternshipsSchema);

module.exports = Internships;
