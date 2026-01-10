
document.addEventListener('DOMContentLoaded', function () {
  var currentPath = window.location.pathname;
  var navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(function (link) {
    var linkPath = link.getAttribute('href');

    // Normalize paths to handle both / and /index.html as the same page
    if (currentPath.endsWith('/')) {
      currentPath += 'index.html';
    }
    if (linkPath.endsWith('/')) {
      linkPath += 'index.html';
    }
    
    // Adjust linkPath for root relative links like "/index.html" vs "/"
    // If currentPath is exactly "/" (root), and linkPath is "/index.html", treat them as a match
    if (currentPath === "/" && linkPath === "/index.html") {
      link.classList.add('header-link-active');
      link.classList.remove('header-link');
    }
    // For other cases, check if the currentPath ends with the linkPath
    else if (currentPath.endsWith(linkPath) && linkPath !== "/") {
      link.classList.add('header-link-active');
      link.classList.remove('header-link');
    }
  });
});
