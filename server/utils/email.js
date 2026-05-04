const sgMail = require("@sendgrid/mail");

const sgApiKey = process.env.SENDGRID_API_KEY || "";
const senderEmail = process.env.SENDER_EMAIL || "noreply@streamflix.com";

if (sgApiKey) {
  sgMail.setApiKey(sgApiKey);
  console.log("[Email] SendGrid configured with sender:", senderEmail);
} else {
  console.log("[Email] SENDGRID_API_KEY not set. OTP will show in server logs.");
}

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
  printOTP("Signup", email, otp);

  if (!sgApiKey) return;

  try {
    await sgMail.send({
      to: email,
      from: senderEmail,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
    });
    console.log("[Email] OTP sent via SendGrid to", email);
  } catch (err) {
    console.log("[Email] SendGrid error:", err.message || err.response?.body);
  }
};

const sendResetOTP = async (email, otp) => {
  printOTP("Password Reset", email, otp);

  if (!sgApiKey) return;

  try {
    await sgMail.send({
      to: email,
      from: senderEmail,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. Valid for 10 minutes.`,
      html: `<p>Your reset OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
    });
    console.log("[Email] Reset OTP sent via SendGrid to", email);
  } catch (err) {
    console.log("[Email] SendGrid error:", err.message || err.response?.body);
  }
};

module.exports = { sendOTP, sendResetOTP };

