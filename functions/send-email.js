// This function will be triggered when a user submits the contact form.
// It sends an email using the Brevo API.

// Make sure to set these environment variables in your Vercel project settings:
// BREVO_API_KEY: Your Brevo API key.
// RECIPIENT_EMAIL: The email address where you want to receive the quotes.
// SENDER_EMAIL: An authenticated email address from your Brevo account.

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { name, email, phone, subject, message } = JSON.parse(event.body);

    const brevoApiKey = process.env.BREVO_API_KEY;
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!brevoApiKey || !recipientEmail || !senderEmail) {
      console.error("Missing environment variables");
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Server configuration error." }),
      };
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
          name: name, // Using the sender's name from the form for Brevo's sender.name
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
          },
        ],
        replyTo: {
            email: email, // Set the reply-to to the user's email
            name: name
        },
        subject: `New Quote Request: ${subject}`,
        htmlContent: `
          <html>
            <head></head>
            <body>
              <h2>New Quote Request</h2>
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
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Failed to send message.", error: errorBody }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent successfully!" }),
    };

  } catch (error) {
    console.error("Error handling form submission:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An error occurred while processing your request." }),
    };
  }
};
