import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  try {
   
    const cleanPassword = process.env.SMTP_PASSWORD.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, 
      port: Number(process.env.SMTP_PORT) || 465,  
      secure: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: cleanPassword, 
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("EMAIL SENT SUCCESSFULLY → MessageID:", info.messageId);
    return info;

  } catch (error) {
    console.log("EMAIL SENDING FAILED:");
    console.log("Error Name:", error.name);
    console.log("Error Message:", error.message);
    console.log("Full Error:", error);

    throw new Error("Email sending failed. Please check SMTP settings.");
  }
};
