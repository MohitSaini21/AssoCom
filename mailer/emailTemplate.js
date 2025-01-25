export const WelcomeEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AssoCom</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f7fc;
        margin: 0;
        padding: 0;
      }

      .email-container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .header {
        text-align: center;
        padding: 20px 0;
        background-color: #007bff;
        color: white;
        border-radius: 8px 8px 0 0;
      }

      .header h1 {
        margin: 0;
        font-size: 24px;
      }

      .content {
        padding: 20px;
      }

      .content h2 {
        color: #333;
      }

      .content p {
        font-size: 16px;
        color: #555;
        line-height: 1.6;
      }

      .footer {
        text-align: center;
        padding: 10px;
        font-size: 14px;
        color: #888;
      }

      .footer a {
        color: #007bff;
        text-decoration: none;
      }

      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Welcome to AssoCom!</h1>
      </div>
      <div class="content">
        <h2>Hi <span id="username"></span>,</h2>
        <p>
          We're thrilled to have you on board! Your account has been successfully created with the following details:
        </p>
        <p><strong>Username:</strong> <span id="username"></span></p>
        <p><strong>Email:</strong> <span id="email"></span></p>
        <p>
          AssoCom is here to help you connect, collaborate, and achieve your goals. Feel free to explore our platform and take full advantage of all the features available.
        </p>
        <p>
          If you have any questions or need assistance, our support team is always here to help.
        </p>
        <p>
          Best regards,<br>
          The AssoCom Team
        </p>
      </div>
      <div class="footer">
        <p>© 2024 AssoCom. All rights reserved.</p>
        <p><a href="https://assocom.com">Visit our website</a></p>
      </div>
    </div>
  </body>
</html>
`;
export const VerificationEmailTemplate = (username, verificationLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f7fc;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 50px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #007bff;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
    }
    .verify-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007bff;
      border: none;
      border-radius: 5px;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }
    .verify-button:hover {
      background-color: #0056b3;
    }
    .footer {
      margin-top: 20px;
      font-size: 14px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to AssoCom, ${username}!</h1>
    <p>Thank you for signing up. To complete your registration, please verify your email address by clicking the button below:</p>
    <a href="${verificationLink}" class="verify-button">Verify Email</a>
    <p>If the button doesn't work, copy and paste the following link into your browser:</p>
    <p>${verificationLink}</p>
    <div class="footer">
      <p>If you did not sign up for AssoCom, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const resetLinkTemplate = (token) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Change Password Request</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          font-size: 1.5rem;
          text-align: center;
        }
        p {
          font-size: 1rem;
          line-height: 1.6;
          color: #555;
          text-align: center;
        }
        .token {
          font-family: "Courier New", Courier, monospace;
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
          background-color: #f1f1f1;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          margin-top: 20px;
        }
        .footer {
          font-size: 0.9rem;
          color: #777;
          text-align: center;
          margin-top: 30px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Change Request AssoCom</h1>
        <p>
          Hello, <br />
          We received a request to change the password for your account. If you
          did not request this change, please ignore this email. Otherwise, you
          can reset your password by using the token below:
        </p>
        <p class="token">
          ${token}
        </p>
        <p>
          The token will expire in 10 min. If you need further assistance, please
          contact our support team.
        </p>
        <p class="footer">
          If you did not request this change, please contact our support
          immediately at <a href="mailto:mohitsainisaini@gmail.com">mohitsainisaini@gmail.com</a>.
        </p>
      </div>
    </body>
  </html>
`;
