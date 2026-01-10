document.addEventListener('DOMContentLoaded', function () {
    const paymentForm = document.getElementById('payment-form');
    const invoiceIdInput = document.getElementById('invoice_id');
    const paymentLinkInput = document.getElementById('payment_link');

    paymentForm.addEventListener('submit', function (event) {
        const paymentLink = paymentLinkInput.value.trim();
        const invoiceId = invoiceIdInput.value.trim();

        if (paymentLink) {
            event.preventDefault(); // Stop the form from submitting to Formspree
            window.location.href = paymentLink; // Redirect to the payment link
        } else if (!invoiceId) {
            event.preventDefault(); // Stop submission if both are empty
            alert('Please enter an Invoice ID or a Payment Link.');
        }
        // If only invoiceId is present, the form will submit to Formspree by default.
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