let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[Email] nodemailer not installed');
}

const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

console.log('[Email] Starting email service...');
console.log('[Email] EMAIL_USER set:', emailUser.length > 0 ? 'yes (' + emailUser + ')' : 'NO');
console.log('[Email] EMAIL_PASS length:', emailPass.length > 0 ? emailPass.length + ' chars' : 'NOT SET');

let transporter = null;

if (nodemailer && emailUser && emailPass && emailPass.length === 16) {
  transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  transporter.verify(function(error) {
    if (error) {
      console.log('[Email] Gmail SMTP verification failed:', error.message);
      console.log('[Email] Make sure:');
      console.log('[Email]   1. 2-Step Verification enabled on Google account');
      console.log('[Email]   2. Valid App Password generated at: https://myaccount.google.com/apppasswords');
      console.log('[Email]   3. App Password is for "Mail" service');
      console.log('[Email] Emails may still be attempted on send...');
    } else {
      console.log('[Email] Gmail SMTP connected! OTP emails will be sent.');
    }
  });
} else {
  console.log('[Email] Invalid or missing credentials. OTP will show in server logs.');
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
  console.log(`[Email] sendOTP called for ${email}`);

  if (!transporter) {
    console.log('[Email] No transporter available, showing OTP in logs');
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
    console.log('[Email] OTP sent successfully to', email, '| ID:', info.messageId);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    console.error('[Email] Error code:', error.code);
    printOTP('Sign Up (email failed, use this code)', email, otp);
  }
};

const sendResetOTP = async (email, otp) => {
  console.log(`[Email] sendResetOTP called for ${email}`);

  if (!transporter) {
    console.log('[Email] No transporter available, showing OTP in logs');
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
    console.log('[Email] Reset OTP sent successfully to', email, '| ID:', info.messageId);
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    console.error('[Email] Error code:', error.code);
    printOTP('Password Reset (email failed, use this code)', email, otp);
  }
};

module.exports = { sendOTP, sendResetOTP };

