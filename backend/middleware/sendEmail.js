//npm i nodemailer
const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
  const transPorter = nodeMailer.createTransport({
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transPorter.sendMail(mailOptions);
};
