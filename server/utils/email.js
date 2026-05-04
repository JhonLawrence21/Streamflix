const sgMail = require("@sendgrid/mail");

const sgApiKey = (process.env.SENDGRID_API_KEY || "").trim();
const senderEmail = (process.env.SENDER_EMAIL || "noreply@streamflix.com").trim();

console.log("[Email] SENDGRID_API_KEY length:", sgApiKey.length);
console.log("[Email] SENDGRID_API_KEY starts with:", sgApiKey.substring(0, 6));
console.log("[Email] SENDER_EMAIL:", senderEmail);

if (sgApiKey && sgApiKey.startsWith("SG.")) {
  sgMail.setApiKey(sgApiKey);
  console.log("[Email] SendGrid API key set");
} else {
  console.log("[Email] Invalid or missing SENDGRID_API_KEY. OTP will show in server logs.");
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

  if (!sgApiKey || !sgApiKey.startsWith("SG.")) return;

  try {
    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: "StreamFlix"
      },
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <b style="font-size:24px">${otp}</b>. Valid for 10 minutes.</p>`
    };
    await sgMail.send(msg);
    console.log("[Email] SendGrid SUCCESS: OTP sent to", email);
  } catch (err) {
    console.log("[Email] SendGrid ERROR:", err.message);
    if (err.response && err.response.body && err.response.body.errors) {
      console.log("[Email] SendGrid details:", JSON.stringify(err.response.body.errors));
    }
  }
};

const sendResetOTP = async (email, otp) => {
  printOTP("Password Reset", email, otp);

  if (!sgApiKey || !sgApiKey.startsWith("SG.")) return;

  try {
    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: "StreamFlix"
      },
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. Valid for 10 minutes.`,
      html: `<p>Your reset OTP is <b style="font-size:24px">${otp}</b>. Valid for 10 minutes.</p>`
    };
    await sgMail.send(msg);
    console.log("[Email] SendGrid SUCCESS: Reset OTP sent to", email);
  } catch (err) {
    console.log("[Email] SendGrid ERROR:", err.message);
    if (err.response && err.response.body && err.response.body.errors) {
      console.log("[Email] SendGrid details:", JSON.stringify(err.response.body.errors));
    }
  }
};

module.exports = { sendOTP, sendResetOTP };

