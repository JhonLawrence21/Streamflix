const nodemailer = require("nodemailer");

const emailUser = (process.env.EMAIL_USER || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
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
  try {
    const info = await transporter.sendMail({
      from: `"StreamFlix" <${emailUser}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
    });
    console.log("[Email] OTP sent to", email, "|", info.messageId);
  } catch (err) {
    console.log("[Email] Send failed:", err.message);
    printOTP("Signup OTP", email, otp);
  }
};

const sendResetOTP = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"StreamFlix" <${emailUser}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. Valid for 10 minutes.`,
      html: `<p>Your reset OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
    });
    console.log("[Email] Reset OTP sent to", email, "|", info.messageId);
  } catch (err) {
    console.log("[Email] Send failed:", err.message);
    printOTP("Reset OTP", email, otp);
  }
};

module.exports = { sendOTP, sendResetOTP };

