const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware"); 

router.post('/register', authController.register)
router.post('/verify-email', authController.veriftEamilOTP)
router.post('/login', authController.login)
router.post('/get-password-reset-otp', authController.passwordforget_emailverify)
router.post('/check-password-reset-otp', authController.checkpassword_resetotp)
router.post('/update-password', authController.updaete_password)

router.post('/update-pass-viadash', auth, authController.update_pass_viadash)
router.post('/update-profile-image', auth, upload.single('pimg') ,authController.update_profile_image)

router.get('/get-profile-img', auth, authController.get_profile_img)

module.exports = router;