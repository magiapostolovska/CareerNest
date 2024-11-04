
const mongoose = require('mongoose');

const CompaniesSchema = new mongoose.Schema({
  admin: { type: String, required: true },
  companyName: { type: String, required: true },
  description: { type: String },
  website: { type: String, required: true },
  contactEmail: { type: String, required: true  },
  address: { type: String, required: true  },
  companyProfilePicture: { type: String },
  industry: { type: String, required: true  },
  createdAt: { type: Date, required: false },
  updatedAt: { type: Date, default: null },
  createdBy: { type: String, required: false},
  updatedBy: { type: String, default: null },
});

const Companies = mongoose.model('Companies', CompaniesSchema);

module.exports = Companies;
