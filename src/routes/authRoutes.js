const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  signupValidation,
  loginValidation,
  verifyEmailValidation,
  resendOTPValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
  changePasswordValidation,
  validate
} = require('../utils/validators');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes
router.post('/signup', signupValidation, validate, asyncHandler(signup));
router.post('/verify-email', verifyEmailValidation, validate, asyncHandler(verifyEmail));
router.post('/resend-otp', resendOTPValidation, validate, asyncHandler(resendOTP));
router.post('/login', loginValidation, validate, asyncHandler(login));
router.post('/forgot-password', forgotPasswordValidation, validate, asyncHandler(forgotPassword));
router.post('/reset-password', resetPasswordValidation, validate, asyncHandler(resetPassword));
router.post('/refresh', refreshTokenValidation, validate, asyncHandler(refreshToken));

// Protected routes
router.post('/logout', authenticate, asyncHandler(logout));
router.post('/logout-all', authenticate, asyncHandler(logoutAll));
router.get('/me', authenticate, asyncHandler(getProfile));
router.put('/profile', authenticate, asyncHandler(updateProfile));
router.put('/change-password', authenticate, changePasswordValidation, validate, asyncHandler(changePassword));

module.exports = router;