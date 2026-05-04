const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for StreamFlix',
    html: `
      <h2>Your OTP Code</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>Valid for 10 minutes.</p>
      <p>If you didn't request this, ignore.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to', email);
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send OTP');
  }
};

const sendResetOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - StreamFlix',
    html: `
      <h2>Password Reset OTP</h2>
      <p>Use this OTP to reset password: <strong>${otp}</strong></p>
      <p>Valid for 10 minutes.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send reset OTP');
  }
};

module.exports = { sendOTP, sendResetOTP };

