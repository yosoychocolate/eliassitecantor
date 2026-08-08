/**
 * Mapas e painéis de memoriais na home
 */
function renderMemorialMap() {
  const mapEl = document.getElementById('memorial-map');
  const listEl = document.getElementById('memorial-states');
  if (!mapEl && !listEl) return;

  const memoriais = getMemoriais();
  const byEstado = getMemoriaisByEstado();
  const estadoNomes = { MS: 'Mato Grosso do Sul', SP: 'São Paulo', PE: 'Pernambuco', PR: 'Paraná', MT: 'Mato Grosso' };

  if (mapEl) {
    mapEl.innerHTML = memoriais.map(ev => `
      <button class="map-pin map-pin--done" style="left:${ev.coords?.x || 50}%;top:${ev.coords?.y || 50}%"
        data-slug="${ev.slug}" title="${ev.cidade} — ${ev.estado}">
        <span class="map-pin__dot"></span><span class="map-pin__label">${ev.cidade}</span>
      </button>`).join('');

    mapEl.querySelectorAll('.map-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const ev = getEventoBySlug(pin.dataset.slug);
        if (ev) showMemorialPanel(ev);
      });
    });
  }

  if (listEl) {
    listEl.innerHTML = Object.keys(byEstado).sort().map(uf => `
      <div class="memorial-state">
        <h3 class="memorial-state__uf"><span class="memorial-state__flag" aria-hidden="true">🇧🇷</span> ${uf} <small>${estadoNomes[uf] || ''}</small></h3>
        <ul class="memorial-state__cities">
          ${byEstado[uf].map(ev => `
            <li><a href="${memorialHref(ev.slug)}" class="memorial-city-link"><i class="fas fa-map-marker-alt"></i> ${ev.cidade} <span class="memorial-city__done">✓</span></a></li>`).join('')}
        </ul>
      </div>`).join('');
  }
}

function renderBrazilMap() {
  const el = document.getElementById('brazil-map');
  if (!el) return;

  const byEstado = getMemoriaisByEstado();
  const ufs = Object.keys(byEstado).sort();

  el.innerHTML = `
    <div class="brazil-map__visual">
      <div class="brazil-map__silhouette" aria-hidden="true"><i class="fas fa-map"></i></div>
      <div class="brazil-map__states">
        ${ufs.map(uf => `
          <button class="brazil-map__state" data-uf="${uf}">
            <span class="brazil-map__dot">●</span> ${uf}
            <small>${byEstado[uf].length} memorial${byEstado[uf].length > 1 ? 'is' : ''}</small>
          </button>`).join('')}
      </div>
    </div>
    <div class="brazil-map__panel" id="brazil-map-panel"></div>`;

  el.querySelectorAll('.brazil-map__state').forEach(btn => {
    btn.addEventListener('click', () => {
      const uf = btn.dataset.uf;
      const panel = document.getElementById('brazil-map-panel');
      if (!panel) return;
      panel.classList.add('active');
      panel.innerHTML = `
        <button class="memorial-panel__close" aria-label="Fechar"><i class="fas fa-times"></i></button>
        <h3>${uf} — Memoriais</h3>
        <ul class="brazil-map__list">
          ${byEstado[uf].map(ev => `
            <li><a href="${memorialHref(ev.slug)}"><strong>${ev.cidade}</strong> — ${ev.titulo}<br><small>${Ministry.formatDateShort(ev.data)}</small></a></li>`).join('')}
        </ul>`;
      panel.querySelector('.memorial-panel__close')?.addEventListener('click', () => panel.classList.remove('active'));
    });
  });
}

function showMemorialPanel(ev) {
  const panel = document.getElementById('memorial-panel');
  if (!panel) return;

  panel.classList.add('active');
  panel.innerHTML = `
    <button class="memorial-panel__close" aria-label="Fechar"><i class="fas fa-times"></i></button>
    <h3>${ev.cidade} — ${ev.estado}</h3>
    <p class="memorial-panel__church">${ev.titulo}</p>
    ${ev.pastor ? `<p class="memorial-panel__pastor"><i class="fas fa-user-tie"></i> ${ev.pastor}</p>` : ''}
    <p class="memorial-panel__date"><i class="far fa-calendar"></i> ${Ministry.formatDate(ev.data)}</p>
    <p class="memorial-panel__tipo">${ev.tipo || ''}</p>
    ${ev.testemunho ? `<blockquote class="memorial-panel__quote">"${ev.testemunho}"</blockquote>` : ''}
    <div class="memorial-panel__meta">
      ${ev.galeria?.length ? `<span><i class="fas fa-camera"></i> ${ev.galeria.length} fotos</span>` : ''}
      <span class="memorial-panel__badge">Realizado</span>
    </div>
    <a href="${memorialHref(ev.slug)}" class="btn btn--primary btn--full">Ver memorial completo</a>`;

  panel.querySelector('.memorial-panel__close')?.addEventListener('click', () => panel.classList.remove('active'));
}

function renderMinistryStats() {
  const el = document.getElementById('ministry-stats');
  if (!el) return;

  const s = computeStats();
  const items = [
    { valor: s.anosMinisterio, sufixo: '+', label: 'Anos de ministério' },
    { valor: s.memoriais, sufixo: '', label: 'Memoriais' },
    { valor: s.cidades, sufixo: '', label: 'Cidades' },
    { valor: s.estados, sufixo: '', label: 'Estados' },
    { valor: s.igrejas, sufixo: '', label: 'Igrejas' },
    { valor: s.fotos, sufixo: '+', label: 'Fotos no acervo' }
  ];

  el.innerHTML = items.map(item => `
    <div class="ministry-stat">
      <span class="ministry-stat__number" data-count="${item.valor}" data-suffix="${item.sufixo}">0</span>
      <span class="ministry-stat__label">${item.label}</span>
    </div>`).join('');

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    el.querySelectorAll('.ministry-stat__number').forEach(counter => {
      const target = parseInt(counter.dataset.count, 10);
      const suffix = counter.dataset.suffix || '';
      ScrollTrigger.create({
        trigger: counter, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 2.5, ease: 'power2.out',
            onUpdate() { counter.textContent = Math.round(this.targets()[0].val) + suffix; }
          });
        }
      });
    });
  }
}

function renderNarrativaTimeline() {
  const el = document.getElementById('historia-timeline');
  if (!el) return;

  ContentService.getNarrativaTimeline().then(items => {
    const groups = NarrativeService.groupByYear(items);
    el.innerHTML = groups.map(({ year, items: yearItems }) => `
      <div class="narrativa-year">
        <h3 class="narrativa-year__label">${year}</h3>
        <div class="narrativa-year__items">
          ${yearItems.map(item => `
            <article class="narrativa-item narrativa-item--${item.tipo}">
              <span class="narrativa-item__icon"><i class="fas ${item.icone || 'fa-circle'}"></i></span>
              <div class="narrativa-item__body">
                <h4>${item.titulo}</h4>
                <p>${item.descricao}${item.sub ? `<br><small>${item.sub}</small>` : ''}</p>
                ${item.link ? `<a href="${item.link}" class="narrativa-item__link">Ver memorial →</a>` : ''}
              </div>
            </article>`).join('')}
        </div>
      </div>`).join('');
  });
}

function renderFavorites() {
  FavoritesService.renderSection(document.getElementById('meus-memoriais'));
}
