const express = require('express');
const router = express.Router();
const {
  signup,
  login,
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
  refreshTokenValidation,
  changePasswordValidation,
  validate
} = require('../utils/validators');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes
router.post('/signup', signupValidation, validate, asyncHandler(signup));
router.post('/login', loginValidation, validate, asyncHandler(login));
router.post('/refresh', refreshTokenValidation, validate, asyncHandler(refreshToken));

// Protected routes
router.post('/logout', authenticate, asyncHandler(logout));
router.post('/logout-all', authenticate, asyncHandler(logoutAll));
router.get('/me', authenticate, asyncHandler(getProfile));
router.put('/profile', authenticate, asyncHandler(updateProfile));
router.put('/change-password', authenticate, changePasswordValidation, validate, asyncHandler(changePassword));

module.exports = router;