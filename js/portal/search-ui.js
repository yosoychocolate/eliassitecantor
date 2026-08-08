/**
 * Global Search UI
 */
const SearchUI = {
  init() {
    const wrap = document.getElementById('global-search');
    if (!wrap) return;

    const compact = window.matchMedia('(min-width: 1024px)').matches;

    wrap.innerHTML = compact
      ? `<div class="search-box search-box--compact" id="search-box">
          <button type="button" class="search-box__toggle" aria-label="Abrir busca" aria-expanded="false">
            <i class="fas fa-search"></i>
          </button>
          <div class="search-box__field">
            <i class="fas fa-search" aria-hidden="true"></i>
            <input type="search" id="search-input" placeholder="Buscar…" autocomplete="off" aria-label="Busca global" enterkeyhint="search">
            <button type="button" class="search-box__close" aria-label="Fechar busca"><i class="fas fa-times"></i></button>
            <div class="search-results" id="search-results" hidden></div>
          </div>
        </div>`
      : `<div class="search-box">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input type="search" id="search-input" placeholder="Buscar…" autocomplete="off" aria-label="Busca global" enterkeyhint="search">
          <div class="search-results" id="search-results" hidden></div>
        </div>`;

    const box = wrap.querySelector('.search-box');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    let timer;

    if (compact) {
      const toggle = box.querySelector('.search-box__toggle');
      const close = box.querySelector('.search-box__close');
      const open = () => {
        box.classList.add('is-open');
        toggle?.setAttribute('aria-expanded', 'true');
        setTimeout(() => input?.focus(), 120);
      };
      const shut = () => {
        box.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
        if (results) results.hidden = true;
        if (input) input.value = '';
      };
      toggle?.addEventListener('click', open);
      close?.addEventListener('click', shut);
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && box.classList.contains('is-open')) shut();
      });
    }

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
                <small>${item.subtitle}</small>
              </a>`).join('')
          : '<p class="search-result__empty">Nenhum resultado</p>';
      }, 200);
    });

    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) {
        results.hidden = true;
        if (compact && box.classList.contains('is-open') && !box.querySelector('.search-box__field')?.contains(e.target)) {
          box.classList.remove('is-open');
          box.querySelector('.search-box__toggle')?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  },

  typeLabel(type) {
    return { musica: 'Música', memorial: 'Memorial', evento: 'Agenda', testemunho: 'Testemunho' }[type] || type;
  }
};

document.addEventListener('DOMContentLoaded', () => SearchUI.init());
