import nodemailer from "nodemailer";
import { WelcomeEmailTemplate } from "./emailTemplate.js"; // Importing the email template

// The function to send the welcome email
export const WelcomeEmail = (newUser) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465, // Correct port for secure SMTP
    auth: {
      user: "assocom007@gmail.com", // Use the new email
      pass: "xhhu enqd eiqk twkj", // Use the new app password
    },
  });

  // Replace placeholders in the template with dynamic data
  const personalizedTemplate = WelcomeEmailTemplate.replace(
    /<span id="username"><\/span>/g,
    newUser.userName
  ).replace(/<span id="email"><\/span>/g, newUser.email);

  const mailOptions = {
    from: "assocom007@gmail.com", // Use the new email
    to: newUser.email,
    subject: "Welcome to AssoCom!",
    html: personalizedTemplate,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
      console.log("Full Info: ", info); // Detailed info for debugging
    }
  });
};
