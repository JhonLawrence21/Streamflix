const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return null;
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Server configuration error' });
  }
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });
    const userData = user.toJSON();
    delete userData.password;

    try {
      const { logActivity } = require('../services/activityLogger');
      logActivity(userData.id, userData.name, 'signup', `New user registered: ${name}`, { email });
    } catch (e) { /* ignore */ }

    res.status(201).json({
      ...userData,
      watchlist: [],
      token: generateToken(userData.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.registerUser = registerUser;

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userInstance = await User.findOne({ where: { email } });
    if (!userInstance) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await userInstance.matchPassword(password);
    const user = userInstance.toJSON();
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      watchlist: user.watchlist || [],
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const data = user.get({ plain: true });
    delete data.password;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage, profiles, activeProfile, parentalControlPin } = req.body;
    
    console.log('[Profile] Updating profile, image length:', profileImage ? profileImage.length : 0);

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage !== undefined) {
      if (profileImage.length > 2000000) {
        return res.status(400).json({ message: 'Image too large. Please use a smaller image (max 2MB)' });
      }
      user.profileImage = profileImage;
    }
    if (profiles !== undefined) user.profiles = profiles;
    if (activeProfile !== undefined) user.activeProfile = activeProfile;
    if (parentalControlPin !== undefined) user.parentalControlPin = parentalControlPin;

    await user.save();
    
    console.log('[Profile] Profile updated successfully');

    const freshUser = await User.findByPk(user.id);
    const data = freshUser.get({ plain: true });
    delete data.password;
    delete data.otp;
    delete data.otpExpiry;
    res.json(data);
  } catch (error) {
    console.error('[Profile] Error updating profile:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account with this email exists' });
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    console.log('[Forgot Password] Reset token for', email, ':', resetToken);
    
    res.json({ 
      message: 'Reset code sent',
      resetCode: resetToken,
      note: 'For demo: Use this code to reset password'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetCode, newPassword } = req.body;
    
    const user = await User.findOne({ 
      where: { 
        resetToken: resetCode,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};