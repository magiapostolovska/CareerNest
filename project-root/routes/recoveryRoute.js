const express = require('express');
const router = express.Router();
const passwordRecoveryController = require('../controllers/passwordRecoveryController');

router.post('/forgot-password', passwordRecoveryController.forgotPassword);
router.post('/verify-recovery-code', passwordRecoveryController.verifyRecoveryCode);
router.put('/change-password', passwordRecoveryController.changePassword);

module.exports = router;
