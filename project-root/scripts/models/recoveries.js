const mongoose = require('mongoose');

const RecoverySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Users' },
    recoveryCode: { type: Number, unique: true, required: true }, 
    expirationTime: { type: Date, required: true }, 
    createdAt: { type: Date, default: Date.now, required: true } 
});

const Recovery = mongoose.model('Recovery', RecoverySchema);
module.exports = Recovery;
