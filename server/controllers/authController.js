const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return null;
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  }
};

const googleVerify = async (req, res) => {
  try {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-16),
        isVerified: true,
        profileImage: picture
      });
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
  } catch (err) {
    res.status(401).json({ message: 'Google sign-in failed' });
  }
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
      password,
      isVerified: true
    });

    res.status(201).json({
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
exports.registerUser = registerUser;

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
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
    const user = await User.findByPk(req.user.id, { raw: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleVerify = googleVerify;

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;

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
      user.profileImage = profileImage;
    }

    await user.save();

    const freshUser = await User.findByPk(user.id);
    res.json({
      id: freshUser.id,
      name: freshUser.name,
      email: freshUser.email,
      role: freshUser.role,
      profileImage: freshUser.profileImage,
      watchlist: freshUser.watchlist || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
