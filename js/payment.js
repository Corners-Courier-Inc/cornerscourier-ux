document.addEventListener('DOMContentLoaded', function () {
    const paymentForm = document.getElementById('payment-form');
    const invoiceIdInput = document.getElementById('invoice_id');
    const paymentLinkInput = document.getElementById('payment_link');

    paymentForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Stop the form from submitting

        const submitButton = paymentForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        const formData = new FormData(paymentForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.invoice_id && !data.payment_link) {
            alert('Please enter an Invoice ID or a Payment Link.');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting...';

        try {
            const response = await fetch('/api/send-payment-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                window.location.href = '/thank-you.html';
            } else {
                const errorData = await response.json();
                alert(`Failed to submit payment info: ${errorData.message || 'Unknown error'}`);
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error('Error submitting payment form:', error);
            alert('An unexpected error occurred. Please try again.');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });

    const navLinks = document.querySelectorAll('nav a');
    const currentPath = window.location.pathname.split('/').pop(); // e.g., "services.html" or "" for index.html

    navLinks.forEach(link => {
        link.classList.remove('header-link-active'); // Remove active class from all links first

        // Get the filename from the link's href attribute
        const linkPath = link.getAttribute('href').split('/').pop();

        if (currentPath === "" && linkPath === "index.html") {
            // Special case for home page
            link.classList.add('header-link-active');
        } else if (currentPath === linkPath) {
            // For all other pages
            link.classList.add('header-link-active');
        }
    });
});