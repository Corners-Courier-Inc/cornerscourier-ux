document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingId = urlParams.get('trackingId');
    if (trackingId) {
        const subjectInput = document.querySelector('input[name="subject"]');
        if (subjectInput) {
            subjectInput.value = `Tracking ID: ${trackingId}`;
        }
    }

    if (window.location.hash === '#contact') {
        const contactFormSection = document.getElementById('contact');
        if (contactFormSection) {
            contactFormSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const contactForm = document.querySelector('#contact form'); // Select the form inside the #contact div
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            const form = event.target;
            const formData = new FormData(form);
            const formspreeEndpoint = form.action;

            try {
                const response = await fetch(formspreeEndpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Important for Formspree AJAX submission
                    }
                });

                if (response.ok) {
                    // On successful submission to Formspree, redirect to thank-you page
                    window.location.href = '/thank-you'; // Changed to /thank-you
                } else {
                    // Handle Formspree errors (e.g., rate limiting, invalid fields)
                    const errorData = await response.json();
                    console.error('Formspree submission error:', errorData);
                    alert('There was an error submitting your form. Please try again.');
                }
            } catch (error) {
                console.error('Network or other error:', error);
                alert('There was a problem connecting to the server. Please check your internet connection and try again.');
            }
        });
    }
});