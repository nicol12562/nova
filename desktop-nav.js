// Nova AI · Native Desktop Integration Helper
(() => {
  'use strict';

  if (!window.novaDesktop) {
    return; // Running in standard web browser
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject native drag region at top of the window for Windows
    const dragBar = document.createElement('div');
    dragBar.id = 'nova-desktop-dragbar';
    dragBar.innerHTML = `
      <div class="desktop-drag-content">
        <span class="desktop-logo-icon">✦</span>
        <span class="desktop-app-title">Nova AI — Desktop</span>
        <span class="desktop-shortcut-badge">Ctrl + Alt + N</span>
      </div>
    `;
    document.body.prepend(dragBar);

    // 2. Intercept internal anchor clicks to navigate within Electron smoothly
    document.body.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Handle internal routes
      if (href.startsWith('/') || href.startsWith('./') || href.endsWith('.html')) {
        let cleanRoute = href;
        if (cleanRoute.startsWith('./')) cleanRoute = '/' + cleanRoute.slice(2);
        if (cleanRoute.endsWith('.html')) {
          cleanRoute = '/' + cleanRoute.replace('.html', '').replace('/index', '');
        }
        if (cleanRoute === '') cleanRoute = '/';

        e.preventDefault();
        window.novaDesktop.navigate(cleanRoute);
      }
    });

    console.log('Nova AI Desktop environment initialized.');
  });
})();
