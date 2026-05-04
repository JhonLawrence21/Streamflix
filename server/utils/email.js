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
  },
  connectionTimeout: 4000,
  greetingTimeout: 4000,
  socketTimeout: 4000
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

const sendEmail = (mailOptions) => {
  return new Promise((resolve) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("[Email] Error:", err.message);
      } else {
        console.log("[Email] Sent:", info.messageId);
      }
      resolve();
    });
  });
};

const sendOTP = async (email, otp) => {
  printOTP("Signup", email, otp);
  await sendEmail({
    from: `"StreamFlix" <${emailUser}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. Valid for 10 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
  });
};

const sendResetOTP = async (email, otp) => {
  printOTP("Password Reset", email, otp);
  await sendEmail({
    from: `"StreamFlix" <${emailUser}>`,
    to: email,
    subject: "Password Reset OTP",
    text: `Your reset OTP is ${otp}. Valid for 10 minutes.`,
    html: `<p>Your reset OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`
  });
};

module.exports = { sendOTP, sendResetOTP };

