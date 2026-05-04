let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('nodemailer not installed, email features disabled');
}

let transporter = null;
let emailConfigured = false;

if (nodemailer && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  transporter.verify(function(error, success) {
    if (error) {
      console.log('[Email] Gmail auth failed, OTP will show in server logs');
      console.log('[Email] Error:', error.message);
      transporter = null;
    } else {
      console.log('[Email] Gmail configured, OTP emails enabled');
      emailConfigured = true;
    }
  });
} else if (nodemailer) {
  console.warn('[Email] EMAIL_USER or EMAIL_PASS not set, OTP will show in server logs');
}

const printOTP = (label, email, otp) => {
  console.log('========================================');
  console.log(`[OTP] ${label}`);
  console.log(`[OTP] Email: ${email}`);
  console.log(`[OTP] Code: ${otp}`);
  console.log('========================================');
};

const sendOTP = async (email, otp) => {
  if (!transporter) {
    printOTP('Sign Up OTP', email, otp);
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
    console.log('[Email] OTP sent to', email);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    printOTP('Sign Up OTP (email failed)', email, otp);
  }
};

const sendResetOTP = async (email, otp) => {
  if (!transporter) {
    printOTP('Password Reset OTP', email, otp);
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
    console.log('[Email] Reset OTP sent to', email);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    printOTP('Password Reset OTP (email failed)', email, otp);
  }
};

module.exports = { sendOTP, sendResetOTP };

