import axios from "axios";

/**
 * Sends a transactional email using Brevo (formerly Sendinblue) REST API.
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || "Smart Task App",
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html || `<p>${text}</p>`,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  } catch (error) {
    const detail = error.response?.data?.message || error.message;
    throw new Error(`Brevo email failed: ${detail}`);
  }
};

export default sendEmail;
