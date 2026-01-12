document.addEventListener('DOMContentLoaded', function () {
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
