/**
 * Nav — Navegação compartilhada do portal
 */
function renderSiteNav(options = {}) {
  const el = document.getElementById('site-nav');
  if (!el) return;

  const {
    base = '',
    active = '',
    ministry = true
  } = options;

  const logo = ministry ? 'Ministério Elias Silva' : 'Elias Silva';
  const isHome = active === 'home';
  const prefix = base;

  el.innerHTML = `
    <header class="header scrolled" id="header">
      <nav class="nav container">
        <a href="${prefix}index.html" class="nav__logo">${logo}</a>
        <div class="nav__menu" id="nav-menu">
          <ul class="nav__list">
            <li><a href="${isHome ? '#home' : prefix + 'index.html'}" class="nav__link ${active === 'home' ? 'active' : ''}">Home</a></li>
            <li><a href="${isHome ? '#sobre' : prefix + 'index.html#sobre'}" class="nav__link">Sobre</a></li>
            <li><a href="${isHome ? '#agenda' : prefix + 'index.html#agenda'}" class="nav__link ${active === 'agenda' ? 'active' : ''}">Agenda</a></li>
            <li><a href="${prefix}memoriais.html" class="nav__link ${active === 'memoriais' ? 'active' : ''}">Memoriais</a></li>
            <li><a href="${prefix}discografia.html" class="nav__link">Música</a></li>
            <li><a href="${prefix}videoteca.html" class="nav__link">Videoteca</a></li>
            <li><a href="${prefix}videoteca.html#videoteca-parcerias-section" class="nav__link">Patrocínios</a></li>
            <li><a href="${isHome ? '#contato' : prefix + 'index.html#contato'}" class="nav__link">Contato</a></li>
          </ul>
          <div class="nav__contact">
            <a href="https://wa.me/5511970472292" class="nav__whatsapp" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-whatsapp" aria-hidden="true"></i>
              <span class="nav__whatsapp-copy">
                <span class="nav__whatsapp-label">WhatsApp — Agenda</span>
                <strong class="nav__whatsapp-number">(11) 97047-2292</strong>
              </span>
            </a>
          </div>
        </div>
        <button class="nav__toggle" id="nav-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-menu">
          <i class="fas fa-bars nav__toggle-icon nav__toggle-icon--menu" aria-hidden="true"></i>
          <i class="fas fa-times nav__toggle-icon nav__toggle-icon--close" aria-hidden="true"></i>
        </button>
      </nav>
    </header>
  `;
}

function renderSiteFooter(base = '') {
  const el = document.getElementById('site-footer');
  if (!el) return;

  el.innerHTML = `
    <footer class="footer">
      <div class="container footer__inner">
        <a href="${base}index.html" class="footer__logo">Ministério Elias Silva</a>
        <p class="footer__tagline">Portal Oficial do Ministério Elias Silva</p>
        <p class="footer__version">Versão 1.0 · Publicado em 7 de agosto de 2026</p>
        <p class="footer__copy">&copy; 2026 Elias Ferreira da Silva. Todos os direitos reservados.</p>
        <div class="footer__social">
          <a href="${base}tv.html" aria-label="Modo TV" title="Modo TV"><i class="fas fa-tv"></i></a>
          <a href="https://www.facebook.com/CANTORELIASSILVAOFICIAL" target="_blank" rel="noopener noreferrer" aria-label="Facebook oficial"><i class="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/cantoreliassilvaoficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram oficial"><i class="fab fa-instagram"></i></a>
          <a href="https://www.youtube.com/@cantoreliassilvaoficial" target="_blank" rel="noopener noreferrer" aria-label="Canal oficial no YouTube"><i class="fab fa-youtube"></i></a>
          <a href="https://www.tiktok.com/@cantoreliassilvaoficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok oficial"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (body.dataset.navBase !== undefined) {
    renderSiteNav({
      base: body.dataset.navBase || '',
      active: body.dataset.navActive || '',
      ministry: body.dataset.navMinistry !== 'false'
    });
    renderSiteFooter(body.dataset.navBase || '');
  }
});
