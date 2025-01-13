import nodemailer from "nodemailer";

import {
  WelcomeEmailTemplate,
  VerificationEmailTemplate,
  resetLinkTemplate,
} from "./emailTemplate.js";

export const WelcomeEmail = (newUser) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465, // Correct port for secure SMTP
    auth: {
      user: "sainimohit251484@gmail.com",
      pass: "ndoc qouz wuxh tepi", // Ensure this is stored securely
    },
  });

  // Replace placeholders in the template with dynamic data
  const personalizedTemplate = WelcomeEmailTemplate.replace(
    /<span id="username"><\/span>/g,
    newUser.fullName
  ).replace(/<span id="email"><\/span>/g, newUser.email);

  const mailOptions = {
    from: "sainimohit251484@gmail.com",
    to: newUser.email,
    subject: "Welcome to AssoCom!",
    html: personalizedTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};

export const sendVerificationEmail = ({ verificationLink, newUser }) => {
  console.log(verificationLink);
  console.log(newUser.userName);
  try {
    // Create transporter with secure configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465, // Correct port for secure SMTP
      auth: {
        user: "sainimohit251484@gmail.com",
        pass: "ndoc qouz wuxh tepi", // Store this securely in environment variables
      },
    });

    // Define mail options
    const mailOptions = {
      from: "sainimohit251484@gmail.com",
      to: newUser.email,
      subject: "Verify Your Email - AssoCom",
      html: VerificationEmailTemplate(newUser.userName, verificationLink),
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Verification email sent successfully:", info.response);
      }
    });
  } catch (err) {
    console.error(
      "An error occurred while sending the verification email:",
      err
    );
  }
};

export const sendResetLink = ({ token, email }) => {
  try {
    // Create transporter with secure configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465, // Correct port for secure SMTP
      auth: {
        user: "sainimohit251484@gmail.com", // Your email address
        pass: "ndoc qouz wuxh tepi", // Store this securely in environment variables
      },
      // debug: true, // Enable debug output
      // logger: true, // Log information
    });

    // Generate the email content using the reset link template
    const htmlContent = resetLinkTemplate(token); // Use the template to insert the reset link

    // Define mail options
    const mailOptions = {
      from: "sainimohit251484@gmail.com", // Your email address
      to: email, // Recipient's email address
      subject: "Password Reset Request - AssoCom",
      html: htmlContent, // Use the generated HTML content
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log(
          "Password reset  token has been send on email successfully:",
          info.response
        );
      }
    });
  } catch (err) {
    console.error(
      "An error occurred while sending the password reset email:",
      err
    );
  }
};
