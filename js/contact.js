document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Simple client-side validation
      if (!data.name || !data.email || !data.subject || !data.message) {
        alert('Please fill in all required fields.');
        return;
      }

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          window.location.href = '/thank-you.html'; // Redirect on success
        } else {
          const errorData = await response.json();
          alert(`Failed to send message: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An unexpected error occurred. Please try again later.');
      }
    });
  }
});
