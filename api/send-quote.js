module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const {
      name, email, phone, service_type, other_service_description,
      dimensions, pickup_street_address, pickup_city, pickup_state, pickup_zip,
      delivery_street_address, delivery_city, delivery_state, delivery_zip,
      message, distance
    } = req.body;

    const brevoApiKey = process.env.BREVO_API_KEY;
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!brevoApiKey || !recipientEmail || !senderEmail) {
      console.error("Missing environment variables for quote form.");
      res.status(500).json({ message: "Server configuration error." });
      return;
    }

    // Combine address parts
    const pickupAddress = `${pickup_street_address}, ${pickup_city}, ${pickup_state} ${pickup_zip}`;
    const deliveryAddress = `${delivery_street_address}, ${delivery_city}, ${delivery_state} ${delivery_zip}`;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name, email: senderEmail },
        to: [{ email: recipientEmail }],
        replyTo: { email, name },
        subject: `New Quote Request-CornersCourier: ${service_type}`,
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; line-height: 1.5;">
              <h2>New Quote Request</h2>
              <hr>
              <h3>Contact Details</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <hr>
              <h3>Shipment Details</h3>
              <p><strong>Service Type:</strong> ${service_type}</p>
              ${other_service_description ? `<p><strong>Other Service Description:</strong> ${other_service_description}</p>` : ''}
              <p><strong>Dimensions:</strong> ${dimensions || 'Not provided'}</p>
              <p><strong>Description:</strong></p>
              <p>${message.replace(/\n/g, "<br>")}</p>
              <hr>
              <h3>Routing</h3>
              <p><strong>Pickup Address:</strong><br>${pickupAddress}</p>
              <p><strong>Delivery Address:</strong><br>${deliveryAddress}</p>
              <p><strong>Estimated Distance:</strong> ${distance} miles</p>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Brevo API error on quote form:", errorBody);
      res.status(response.status).json({ message: "Failed to send quote request.", error: errorBody });
      return;
    }

    res.status(200).json({ message: "Quote request sent successfully!" });

  } catch (error) {
    console.error("Error handling quote form submission:", error);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
};
