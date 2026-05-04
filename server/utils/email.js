let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[Email] nodemailer not installed');
}

let transporter = null;
const emailUser = (process.env.EMAIL_USER || '').trim();
// Remove ALL spaces from app password - Gmail app passwords are 16 chars with no spaces
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

if (nodemailer && emailUser && emailPass) {
  // Use explicit SMTP config instead of service: 'gmail' for better reliability
  transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify(function(error) {
    if (error) {
      console.log('[Email] Gmail SMTP verification FAILED');
      console.log('[Email] Error:', error.message);
      console.log('[Email] Make sure:');
      console.log('[Email]   1. 2-Step Verification is enabled on your Google account');
      console.log('[Email]   2. You generated a valid App Password (not your regular password)');
      console.log('[Email]   3. Generate at: https://myaccount.google.com/apppasswords');
      console.log('[Email] OTP codes will appear in server logs below');
      transporter = null;
    } else {
      console.log('[Email] Gmail SMTP connected! OTP emails are active.');
    }
  });
} else {
  console.log('[Email] No valid email credentials. Set EMAIL_USER and EMAIL_PASS env vars.');
  console.log('[Email] OTP codes will appear in server logs below.');
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
    from: `"StreamFlix" <${emailUser}>`,
    to: email,
    subject: 'Your OTP for StreamFlix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: #141414; border-radius: 8px;">
        <h2 style="color: #E50914; margin-bottom: 20px;">Your OTP Code</h2>
        <div style="background: #333; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
          <span style="font-size: 28px; letter-spacing: 8px; color: #fff; font-weight: bold;">${otp}</span>
        </div>
        <p style="color: #aaa;">This code is valid for 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your OTP for StreamFlix is: ${otp}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] OTP sent to', email, '| Message ID:', info.messageId);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    console.error('[Email] Error code:', error.code);
    printOTP('Sign Up (email failed, use this code)', email, otp);
  }
};

const sendResetOTP = async (email, otp) => {
  if (!transporter) {
    printOTP('Password Reset', email, otp);
    return;
  }

  const mailOptions = {
    from: `"StreamFlix" <${emailUser}>`,
    to: email,
    subject: 'Password Reset - StreamFlix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: #141414; border-radius: 8px;">
        <h2 style="color: #E50914; margin-bottom: 20px;">Password Reset</h2>
        <div style="background: #333; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
          <span style="font-size: 28px; letter-spacing: 8px; color: #fff; font-weight: bold;">${otp}</span>
        </div>
        <p style="color: #aaa;">This code is valid for 10 minutes.</p>
      </div>
    `,
    text: `Your password reset OTP for StreamFlix is: ${otp}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Reset OTP sent to', email, '| Message ID:', info.messageId);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    console.error('[Email] Error code:', error.code);
    printOTP('Password Reset (email failed, use this code)', email, otp);
  }
};

module.exports = { sendOTP, sendResetOTP };

