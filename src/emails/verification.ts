const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.SMTP_ID,
  process.env.SMTP_SECRET,
  process.env.SMTP_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.SMTP_REFRESH_TOKEN });

export const forgotPasswordEmail = async (to: string, link: string) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    console.log(accessToken.token);

    console.log({
      SMTP_ID: process.env.SMTP_ID,
      SMTP_SECRET: process.env.SMTP_SECRET,
      SMTP_REFRESH_TOKEN: process.env.SMTP_REFRESH_TOKEN,
      SMTP_REDIRECT_URI: process.env.SMTP_REDIRECT_URI,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "yotstack@gmail.com", // Your Gmail address
        clientId: process.env.SMTP_ID,
        clientSecret: process.env.SMTP_SECRET,
        refreshToken: process.env.SMTP_REFRESH_TOKEN,
        accessToken: accessToken.token, // Use the generated access token
      },
      tls: {
        rejectUnauthorized: false, // Disable certificate validation
      },
    });

    const mailOptions = {
      from: "yotstack@gmail.com",
      to: "ajayiayotunde13@gmail.com",
      subject: "Forgot Your Password ??",
      html: `<div>
      <h1>Hello ${to},Click the link below to change your password</h1>
      <h5>Your link is active for 6 hours. After that, you will need to resend the verification email.</h5>
      <a href="${link}">Verify account</a>
     </div>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
