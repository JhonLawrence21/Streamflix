const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER || "";
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

console.log("[Email] EMAIL_USER:", emailUser);
console.log("[Email] EMAIL_PASS length:", emailPass.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass
  },
  connectionTimeout: 5000,
  socketTimeout: 5000
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
  printOTP("Signup OTP", email, otp);

  transporter.sendMail({
    from: `"StreamFlix" <${emailUser}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
  }).then(info => {
    console.log("[Email] Sent:", info.messageId);
  }).catch(err => {
    console.log("[Email] Send failed (OTP shown above):", err.message);
  });
};

const sendResetOTP = async (email, otp) => {
  console.log(`[Email] Sending reset OTP to ${email}`);
  printOTP("Reset OTP", email, otp);

  transporter.sendMail({
    from: `"StreamFlix" <${emailUser}>`,
    to: email,
    subject: "Password Reset OTP",
    text: `Your password reset OTP is ${otp}. Valid for 10 minutes.`,
    html: `<p>Your reset OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
  }).then(info => {
    console.log("[Email] Sent:", info.messageId);
  }).catch(err => {
    console.log("[Email] Send failed (OTP shown above):", err.message);
  });
};

module.exports = { sendOTP, sendResetOTP };

