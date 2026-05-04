let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('nodemailer not installed, email features disabled');
}

let transporter = null;
if (nodemailer) {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendOTP = async (email, otp) => {
  if (!transporter) {
    console.log(`[DEV] OTP for ${email}: ${otp} (nodemailer not installed)`);
    return;
  }

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
    console.log(`[DEV] OTP for ${email}: ${otp}`);
  }
};

const sendResetOTP = async (email, otp) => {
  if (!transporter) {
    console.log(`[DEV] Reset OTP for ${email}: ${otp} (nodemailer not installed)`);
    return;
  }

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
    console.log(`[DEV] Reset OTP for ${email}: ${otp}`);
  }
};

module.exports = { sendOTP, sendResetOTP };

