/**
 * Global Search UI — ícone no header, painel fixo no body ao abrir
 */
const SearchUI = {
  init() {
    const wrap = document.getElementById('global-search');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="site-search" id="site-search">
        <button type="button" class="site-search__trigger" id="search-trigger" aria-label="Abrir busca" aria-expanded="false" aria-controls="search-drawer">
          <i class="fas fa-search" aria-hidden="true"></i>
        </button>
      </div>`;

    const drawer = document.createElement('div');
    drawer.className = 'site-search__drawer';
    drawer.id = 'search-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="site-search__backdrop" id="search-backdrop" aria-hidden="true"></div>
      <div class="site-search__panel">
        <div class="site-search__bar">
          <i class="fas fa-search site-search__icon" aria-hidden="true"></i>
          <input type="search" id="search-input" placeholder="Buscar…" autocomplete="off" aria-label="Busca global" enterkeyhint="search">
          <button type="button" class="site-search__close" id="search-close" aria-label="Fechar busca">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="search-results" id="search-results" hidden></div>
      </div>`;
    document.body.appendChild(drawer);

    const root = document.getElementById('site-search');
    const trigger = document.getElementById('search-trigger');
    const backdrop = document.getElementById('search-backdrop');
    const closeBtn = document.getElementById('search-close');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    let timer;
    let savedScrollY = 0;

    const lockScroll = () => {
      savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.classList.add('scroll-locked');
      document.body.classList.add('scroll-locked', 'search-open');
    };

    const unlockScroll = () => {
      document.body.classList.remove('search-open');
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, savedScrollY);
    };

    const open = () => {
      lockScroll();
      root?.classList.add('is-open');
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      trigger?.setAttribute('aria-expanded', 'true');
      setTimeout(() => input?.focus({ preventScroll: true }), 120);
    };

    const shut = () => {
      root?.classList.remove('is-open');
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      trigger?.setAttribute('aria-expanded', 'false');
      if (results) results.hidden = true;
      if (input) input.value = '';
      unlockScroll();
    };

    trigger?.addEventListener('click', e => {
      e.stopPropagation();
      open();
    });

    closeBtn?.addEventListener('click', e => {
      e.stopPropagation();
      shut();
    });

    backdrop?.addEventListener('click', shut);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) shut();
    });

    input?.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = input.value.trim();
        if (q.length < 2) {
          results.hidden = true;
          return;
        }
        const items = await SearchService.search(q);
        results.hidden = false;
        results.innerHTML = items.length
          ? items.map(item => `
              <a href="${item.href}" class="search-result search-result--${item.type}">
                <span class="search-result__type">${this.typeLabel(item.type)}</span>
                <strong>${item.title}</strong>
                ${item.subtitle ? `<small>${item.subtitle}</small>` : ''}
              </a>`).join('')
          : '<p class="search-result__empty">Nenhum resultado para &ldquo;' + q.replace(/</g, '&lt;') + '&rdquo;</p>';
      }, 200);
    });

    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && results.hidden) {
        e.preventDefault();
      }
    });
  },

  typeLabel(type) {
    return {
      musica: 'Música',
      memorial: 'Memorial',
      evento: 'Agenda',
      testemunho: 'Depoimento',
      video: 'Vídeo'
    }[type] || type;
  }
};

document.addEventListener('DOMContentLoaded', () => SearchUI.init());
