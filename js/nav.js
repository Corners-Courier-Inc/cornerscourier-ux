document.addEventListener('DOMContentLoaded', function () {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');

  // Helper to extract a normalized page name (e.g. /services.html -> services, /services -> services)
  function getNormalizedPageName(path) {
    let name = path.split('/').pop().split('#')[0].replace('.html', '').trim();
    if (name === '' || name === 'index') {
      return 'home';
    }
    return name;
  }

  const currentPage = getNormalizedPageName(currentPath);

  navLinks.forEach(function (link) {
    const linkPath = link.getAttribute('href');
    if (!linkPath) return;

    // Ignore external or protocol links
    if (linkPath.startsWith('http') || linkPath.startsWith('tel:') || linkPath.startsWith('mailto:')) {
      return;
    }

    const linkPage = getNormalizedPageName(linkPath);

    // If it's a link to the quote section on the home page, only active if we are on home
    if (currentPage === linkPage && !linkPath.includes('#quote')) {
      link.classList.add('header-link-active');
      link.classList.remove('header-link');
    }
  });
});
