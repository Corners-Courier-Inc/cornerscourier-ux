module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const { invoice_id, payment_link } = req.body;

    // Basic validation: ensure at least one field is filled
    if (!invoice_id && !payment_link) {
      res.status(400).json({ message: "Please provide an Invoice ID or a Payment Link." });
      return;
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!brevoApiKey || !recipientEmail || !senderEmail) {
      console.error("Missing environment variables for payment form.");
      res.status(500).json({ message: "Server configuration error." });
      return;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Website Payment Form", email: senderEmail },
        to: [{ email: recipientEmail }],
        subject: `New Payment Submission from Website`,
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; line-height: 1.5;">
              <h2>New Payment Information Submitted</h2>
              <hr>
              <p><strong>Invoice ID:</strong> ${invoice_id || 'Not provided'}</p>
              <p><strong>Payment Link:</strong> ${payment_link || 'Not provided'}</p>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Brevo API error on payment form:", errorBody);
      res.status(response.status).json({ message: "Failed to send payment info.", error: errorBody });
      return;
    }

    res.status(200).json({ message: "Payment info sent successfully!" });

  } catch (error) {
    console.error("Error handling payment form submission:", error);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
};
