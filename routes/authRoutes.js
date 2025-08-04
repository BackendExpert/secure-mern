const express = require('express');
const authController = require('../controllers/authController')
const router = express.Router();

router.post('/register', authController.register)
router.post('/verify-email', authController.veriftEamilOTP)
router.post('/login', authController.login)
router.post('/get-password-reset-otp', authController.passwordforget_emailverify)
router.post('/check-password-reset-otp', authController.checkpassword_resetotp)
router.post('/update-password', authController.updaete_password)

module.exports = router;