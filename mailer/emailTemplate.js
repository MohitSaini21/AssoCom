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

      /* Additional styling */
      .unsubscribe {
        color: #ff0000;
        font-size: 14px;
        margin-top: 20px;
      }

      .unsubscribe a {
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Welcome to AssoCom!</h1>
      </div>
      <div class="content">
        <h2>Hello <span id="username"></span>,</h2>
        <p>
          We're excited to welcome you to AssoCom! Your account has been successfully created with the following details:
        </p>
        <p><strong>Username:</strong> <span id="username"></span></p>
        <p><strong>Email:</strong> <span id="email"></span></p>
        <p>
          AssoCom is designed to help you collaborate, connect, and achieve your goals. Feel free to explore our platform and make the most of the features available.
        </p>
        <p>
          If you need assistance or have any questions, don't hesitate to reach out to our support team. We're here to help!
        </p>
        <p>
          Best regards,<br>
          The AssoCom Team
        </p>
      </div>
      <div class="footer">
        <p>© 2024 AssoCom. All rights reserved.</p>
        <p><a href="https://assocom.onrender.com/home">Visit our website</a></p>
      </div>
      <div class="footer unsubscribe">
        <p>If you no longer wish to receive these emails, you can <a href="https://assocom.onrender/home">unsubscribe here</a>.</p>
      </div>
    </div>
  </body>
</html>
`;
