const nodemailer = require("nodemailer");

// Preload config
const emailUser = process.env.EMAIL_USER || "";
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

console.log("[Email] EMAIL_USER:", emailUser);
console.log("[Email] EMAIL_PASS length:", emailPass.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

const printOTP = (label, email, otp) => {
  console.log("");
  console.log("============================================");
  console.log(`  [OTP] ${label}`);
  console.log(`  [OTP] Email: ${email}`);
  console.log(`  [OTP] Code: ${otp}`);
  console.log("============================================");
  console.log("");
};

const sendOTP = async (email, otp) => {
  console.log(`[Email] Sending signup OTP to ${email}`);

  try {
    let info = await transporter.sendMail({
      from: `"StreamFlix" <${emailUser}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #E50914;">Your OTP Code</h2>
          <p style="font-size: 28px; letter-spacing: 8px; font-weight: bold;">${otp}</p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    console.log("[Email] Message sent:", info.messageId);
  } catch (error) {
    console.error("[Email] Send failed:", error.message);
    printOTP("Signup (use this code)", email, otp);
  }
};

const sendResetOTP = async (email, otp) => {
  console.log(`[Email] Sending reset OTP to ${email}`);

  try {
    let info = await transporter.sendMail({
      from: `"StreamFlix" <${emailUser}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #E50914;">Password Reset OTP</h2>
          <p style="font-size: 28px; letter-spacing: 8px; font-weight: bold;">${otp}</p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    console.log("[Email] Message sent:", info.messageId);
  } catch (error) {
    console.error("[Email] Send failed:", error.message);
    printOTP("Password Reset (use this code)", email, otp);
  }
};

module.exports = { sendOTP, sendResetOTP };

