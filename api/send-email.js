module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const { name, email, phone, subject, message } = req.body;

    const brevoApiKey = process.env.BREVO_API_KEY;
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!brevoApiKey || !recipientEmail || !senderEmail) {
      console.error("Missing environment variables");
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
        sender: {
          name: name,
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
          },
        ],
        replyTo: {
            email: email,
            name: name
        },
        subject: `New Messag-CornersCourier: ${subject}`,
        htmlContent: `
          <html>
            <head></head>
            <body>
              <h2>New Contact Form</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <hr>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, "<br>")}</p>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Brevo API error:", errorBody);
      res.status(response.status).json({ message: "Failed to send message.", error: errorBody });
      return;
    }

    res.status(200).json({ message: "Message sent successfully!" });

  } catch (error) {
    console.error("Error handling form submission:", error);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
};
