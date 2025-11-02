const { User, ROLES } = require('../models/User');
const TokenManager = require('../utils/tokenManager');
const { ConflictError, AuthenticationError, NotFoundError } = require('../middleware/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  const { email, password, fullName, role, phoneNumber, profilePicture } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    email,
    password,
    fullName,
    role: role || ROLES.PLANNER,
    phoneNumber
  });

  // Generate tokens
  const { accessToken, refreshToken } = TokenManager.generateTokens(user);

  // Store refresh token
  await TokenManager.storeRefreshToken(user.id, refreshToken);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber
      },
      accessToken,
      refreshToken
    }
  });
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await User.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = TokenManager.generateTokens(user);

  // Store refresh token
  await TokenManager.storeRefreshToken(user.id, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber
      },
      accessToken,
      refreshToken
    }
  });
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  // Verify refresh token
  const decoded = TokenManager.verifyRefreshToken(refreshToken);

  // Check if token exists in database
  const isValid = await TokenManager.isRefreshTokenValid(refreshToken);
  if (!isValid) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  // Get user
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new AuthenticationError('User not found or inactive');
  }

  // Generate new tokens
  const tokens = TokenManager.generateTokens(user);

  // Store new refresh token and revoke old one
  await TokenManager.revokeRefreshToken(refreshToken);
  await TokenManager.storeRefreshToken(user.id, tokens.refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  });
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await TokenManager.revokeRefreshToken(refreshToken);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
const logoutAll = async (req, res) => {
  await TokenManager.revokeAllUserTokens(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }
  });
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  const { fullName, phoneNumber } = req.body;

  const updates = {};
  if (fullName) updates.fullName = fullName;
  if (phoneNumber) updates.phoneNumber = phoneNumber;

  const user = await User.update(req.user.id, updates);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber
    }
  });
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id);

  // Verify current password
  const isValid = await User.verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Update password
  await User.updatePassword(req.user.id, newPassword);

  // Revoke all refresh tokens (force re-login on all devices)
  await TokenManager.revokeAllUserTokens(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login again.'
  });
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword
};