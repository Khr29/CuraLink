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
//       from: `"MediLink" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,html
//     });
//   } catch (error) {
//     console.log("Email Error:", error);
//   }
// };
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"MediLink" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html   // ✅ only html
    });
  } catch (error) {
    console.log("Email Error:", error.message);
  }
};