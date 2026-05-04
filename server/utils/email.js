let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[Email] nodemailer not installed');
}

let transporter = null;
const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

if (nodemailer && emailUser && emailPass) {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  transporter.verify(function(error) {
    if (error) {
      console.log('[Email] Gmail verification failed:', error.message);
      console.log('[Email] Check your Gmail App Password at: Google Account -> Security -> App Passwords');
      console.log('[Email] OTP codes will appear in server logs instead');
      transporter = null;
    } else {
      console.log('[Email] Gmail connected! OTP emails will be sent to users.');
    }
  });
} else {
  console.log('[Email] No email credentials set. OTP codes will appear in server logs.');
  if (nodemailer && emailUser) {
    console.log('[Email] Hint: Set EMAIL_PASS environment variable');
  }
}

const printOTP = (label, email, otp) => {
  console.log('');
  console.log('============================================');
  console.log(`  [OTP] ${label}`);
  console.log(`  [OTP] Email: ${email}`);
  console.log(`  [OTP] Code: ${otp}`);
  console.log('============================================');
  console.log('');
};

const sendOTP = async (email, otp) => {
  if (!transporter) {
    printOTP('Sign Up', email, otp);
    return;
  }

  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'Your OTP for StreamFlix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #E50914;">Your OTP Code</h2>
        <p>Your OTP is: <strong style="font-size: 24px; letter-spacing: 5px;">${otp}</strong></p>
        <p>Valid for 10 minutes.</p>
        <p style="color: #888;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[Email] OTP sent to', email);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    printOTP('Sign Up (email failed, use this)', email, otp);
  }
};

const sendResetOTP = async (email, otp) => {
  if (!transporter) {
    printOTP('Password Reset', email, otp);
    return;
  }

  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'Password Reset - StreamFlix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #E50914;">Password Reset OTP</h2>
        <p>Use this OTP to reset your password:</p>
        <p><strong style="font-size: 24px; letter-spacing: 5px;">${otp}</strong></p>
        <p>Valid for 10 minutes.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[Email] Reset OTP sent to', email);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    printOTP('Password Reset (email failed, use this)', email, otp);
  }
};

module.exports = { sendOTP, sendResetOTP };

