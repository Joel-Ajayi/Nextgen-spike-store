import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const userVerificationEmail = async (to: string, link: string) => {
  const msg = {
    to, // Change to your recipient
    from: "ajayiayotunde13@gmail.com", // Change to your verified sender
    subject: "Flipkart Account Verification",
    html: `<div>
           <h1>Let's verify your new flipkart account</h1>
           <h5>Your link is active for 24 hours. After that, you will need to resend the verification email.</h5>
           <a href="${link}">Verify account</a>
          </div>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};

export const forgotPasswordEmail = async (to: string, link: string) => {
  const msg = {
    to, // Change to your recipient
    from: "ajayiayotunde13@gmail.com", // Change to your verified sender
    subject: "Forgot Password",
    html: `<div>
           <h1>Hello ${to},Click the link below to change your password</h1>
           <h5>Your link is active for 24 hours. After that, you will need to resend the verification email.</h5>
           <a href="${link}">Verify account</a>
          </div>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};
