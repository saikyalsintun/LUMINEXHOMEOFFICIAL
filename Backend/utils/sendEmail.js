const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Your 16-character App Password
    },
  });
  await transporter.sendMail({
    from: '"Auth System" <no-reply@test.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  });
};
module.exports = sendEmail;