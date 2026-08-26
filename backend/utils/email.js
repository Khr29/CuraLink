// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// export const sendEmail = async (to, subject, text) => {
//   try {
//     await transporter.sendMail({
//       from: `"CuraLink" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,html
//     });
//   } catch (error) {
//     console.log("Email Error:", error);
//   }
// };
import nodemailer from "nodemailer";

// Nodemailer's own defaults (connectionTimeout: 2min, socketTimeout: 10min)
// mean a stalled/blocked SMTP connection to Gmail — plausible from a cloud
// host's shared egress IP — hangs any request that awaits sendEmail() for
// minutes with no response sent. Every await sendEmail(...) call site
// (registration, booking, OTP, password reset, etc.) inherits whatever
// bound is set here, so capping it here is what actually caps them all.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"CuraLink" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html   // ✅ only html
    });
  } catch (error) {
    console.log("Email Error:", error.message);
  }
};