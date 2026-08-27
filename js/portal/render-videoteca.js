/**
 * Render Videoteca — catálogo cinematográfico
 */
function renderVideoCardCompact(video) {
  const id = VideoService.id(video);
  if (!id) return '';
  return `
    <button type="button" class="videoteca-card videoteca-card--compact" data-youtube-id="${id}" data-video-title="${video.titulo}" aria-label="${video.titulo}">
      <div class="videoteca-card__thumb">
        <img src="${VideoService.thumbFor(video)}" alt="${video.titulo}" loading="lazy">
        <span class="videoteca-card__play"><i class="fas fa-play"></i></span>
        ${video.isNovo ? '<span class="videoteca-card__badge">Novo</span>' : ''}
      </div>
      <p class="videoteca-card__title">${video.titulo}</p>
      ${VideoService.formatViews(video.views) ? `<p class="videoteca-card__meta">${VideoService.formatViews(video.views)}</p>` : ''}
    </button>`;
}

function renderVideoFeatured() {
  const el = document.getElementById('videoteca-featured');
  if (!el) return;

  const featured = VideoService.featured();
  const id = featured && VideoService.id(featured);
  if (!id) { el.innerHTML = ''; return; }

  const thumb = VideoService.thumbFor(featured);
  const label = featured.destaque ? 'Em destaque' : 'Novo lançamento';
  const isHome = document.body.dataset.page === 'home';
  const meta = `${VideoService.formatDateShort(featured)}${VideoService.formatViews(featured.views) ? ` · ${VideoService.formatViews(featured.views)}` : ''}`;

  const infoBlock = isHome
    ? `<div class="videoteca-cinema__info videoteca-cinema__info--compact container">
        <div class="videoteca-cinema__info-row">
          ${featured.isNovo || featured.destaque ? `<span class="videoteca-cinema__badge">${label}</span>` : ''}
          <p class="videoteca-cinema__meta">${meta}</p>
        </div>
        <h2 class="videoteca-cinema__title videoteca-cinema__title--home">${featured.titulo}</h2>
      </div>`
    : `<div class="videoteca-cinema__info container">
        ${featured.isNovo || featured.destaque ? `<span class="videoteca-cinema__badge">${label}</span>` : ''}
        <h2 class="videoteca-cinema__title">${featured.titulo}</h2>
        ${featured.descricao ? `<p class="videoteca-cinema__desc">"${featured.descricao}"</p>` : ''}
        <p class="videoteca-cinema__meta">${meta}</p>
        <button type="button" class="btn btn--primary btn--lg" data-youtube-id="${id}"><i class="fas fa-play"></i> Assistir agora</button>
      </div>`;

  el.innerHTML = `
    <div class="videoteca-cinema${isHome ? ' videoteca-cinema--home' : ''}">
      <button type="button" class="videoteca-cinema__screen" data-youtube-id="${id}" aria-label="Assistir ${featured.titulo}">
        <span class="videoteca-cinema__media">
          <img src="${thumb}" alt="${featured.titulo}" loading="eager" decoding="async">
          <span class="videoteca-cinema__shade" aria-hidden="true"></span>
          ${isHome ? `<span class="videoteca-cinema__caption"><span class="videoteca-cinema__caption-title">${featured.titulo}</span></span>` : ''}
        </span>
        <span class="videoteca-cinema__play"><i class="fas fa-play"></i> Assistir agora</span>
      </button>
      ${infoBlock}
    </div>`;

  const img = el.querySelector('.videoteca-cinema__screen img');
  if (img) VideoService.bindThumbFallback(img, featured);
  bindVideoCards(el, Portal.videos);
}

function renderVideotecaChannel() {
  const el = document.getElementById('videoteca-channel');
  if (!el) return;
  const url = VideoService.channelUrl();
  el.innerHTML = `
    <div class="videoteca-channel">
      <div class="videoteca-channel__brand">
        <span class="videoteca-channel__icon" aria-hidden="true">📺</span>
        <div>
          <strong class="videoteca-channel__label">Canal Oficial</strong>
          <span class="videoteca-channel__handle">@cantoreliassilvaoficial</span>
        </div>
      </div>
      <a href="${url}" class="btn btn--primary videoteca-channel__cta" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-youtube"></i> Inscreva-se
      </a>
    </div>`;
}

function renderVideotecaCarousel() {
  const el = document.getElementById('videoteca-carousel');
  if (!el) return;

  const items = VideoService.recent(10).filter(v => VideoService.id(v) !== VideoService.id(VideoService.featured()));
  if (!items.length) { el.innerHTML = ''; return; }

  el.innerHTML = `
    <div class="videoteca-carousel" data-carousel>
      <div class="videoteca-carousel__header">
        <h3 class="videoteca-carousel__title">Últimos clipes</h3>
        <div class="videoteca-carousel__nav">
          <button type="button" class="videoteca-carousel__btn" data-carousel-prev aria-label="Anterior">◀</button>
          <button type="button" class="videoteca-carousel__btn" data-carousel-next aria-label="Próximo">▶</button>
        </div>
      </div>
      <div class="videoteca-carousel__track" data-carousel-track tabindex="0">
        ${items.map(v => renderVideoCardCompact(v)).join('')}
      </div>
    </div>`;

  bindVideoCards(el, Portal.videos);
}

function renderVideoCardAmigo(video) {
  const id = VideoService.id(video);
  if (!id) return '';
  const artista = video.artista || video.compositor || '';
  return `
    <article class="videoteca-amigo-card" data-youtube-id="${id}" data-video-title="${video.titulo}" tabindex="0" role="button">
      <div class="videoteca-amigo-card__thumb">
        <img src="${VideoService.thumbFor(video)}" alt="${video.titulo}" loading="lazy">
        <span class="videoteca-amigo-card__play" aria-hidden="true"><i class="fas fa-play"></i></span>
      </div>
      <div class="videoteca-amigo-card__body">
        <h4 class="videoteca-amigo-card__title">${video.titulo}</h4>
        ${artista ? `<p class="videoteca-amigo-card__artist">${artista}</p>` : ''}
        <span class="videoteca-amigo-card__cta"><i class="fas fa-play"></i> Assistir</span>
      </div>
    </article>`;
}

function renderVideoCardParceria(video) {
  const id = VideoService.id(video);
  if (!id) return '';
  return `
    <article class="videoteca-parceria-card" data-youtube-id="${id}" data-video-title="${video.titulo}" tabindex="0" role="button">
      ${VideoService.parceriaCoverHtml(video)}
    </article>`;
}

function renderVideotecaParcerias() {
  const el = document.getElementById('videoteca-parcerias');
  if (!el) return;

  const items = VideoService.partnerClips();
  const cadastrados = VideoService.partnerEntries().length;

  if (!cadastrados) {
    el.innerHTML = '';
    return;
  }

  const grid = items.length
    ? `<div class="videoteca-amigos__grid">${items.map(v => renderVideoCardParceria(v)).join('')}</div>`
    : '<p class="videoteca-parcerias__empty">Os vídeos de parceria serão publicados em breve nesta seção.</p>';

  el.innerHTML = `
    <section class="videoteca-amigos videoteca-parcerias" id="videoteca-parcerias-section">
      <header class="videoteca-amigos__header">
        <h3 class="videoteca-amigos__title">🤝 Patrocínios e Parcerias</h3>
        <p class="videoteca-amigos__intro">${VideoService.PARCERIAS_INTRO}</p>
      </header>
      ${grid}
    </section>`;

  bindVideoCards(el, Portal.videos);
}

function renderVideotecaAmigos() {
  const el = document.getElementById('videoteca-amigos');
  if (!el) return;

  const items = VideoService.friendClips();
  if (!items.length) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = `
    <section class="videoteca-amigos" id="videoteca-clipes-amigos">
      <header class="videoteca-amigos__header">
        <h3 class="videoteca-amigos__title">🤝 Clipes Amigos</h3>
        <p class="videoteca-amigos__intro">${VideoService.AMIGOS_INTRO}</p>
      </header>
      <div class="videoteca-amigos__grid">
        ${items.map(v => renderVideoCardAmigo(v)).join('')}
      </div>
    </section>`;

  bindVideoCards(el, Portal.videos);
}

function renderVideotecaPlaylists() {
  const el = document.getElementById('videoteca-sections');
  if (!el) return;

  const all = VideoService.playable();
  const sections = VideoService.CATEGORIES
    .map(cat => ({ cat, items: VideoService.byCategory(all, cat.id) }))
    .filter(s => s.items.length);

  if (!sections.length) {
    el.innerHTML = '<p class="videoteca-empty">Em breve novos vídeos oficiais.</p>';
    return;
  }

  el.innerHTML = sections.map(({ cat, items }) => `
    <div class="videoteca-playlist" id="videoteca-${cat.id}" data-carousel>
      <div class="videoteca-playlist__header">
        <h3 class="videoteca-playlist__title">${cat.icon} ${cat.label}</h3>
        <div class="videoteca-carousel__nav">
          <button type="button" class="videoteca-carousel__btn" data-carousel-prev aria-label="Anterior">◀</button>
          <button type="button" class="videoteca-carousel__btn" data-carousel-next aria-label="Próximo">▶</button>
        </div>
      </div>
      <div class="videoteca-playlist__track" data-carousel-track>
        ${items.map(v => renderVideoCardCompact(v)).join('')}
      </div>
    </div>`).join('');

  bindVideoCards(el, all);
}

function renderVideoteca() {
  renderVideotecaChannel();
  renderVideotecaPlaylists();
  renderVideotecaAmigos();
  renderVideotecaParcerias();
}

function renderLancamentosVideoteca() {
  renderVideoFeatured();
  renderVideotecaCarousel();
}

function videotecaTargetId(navKey) {
  return navKey === 'parcerias-section' ? 'videoteca-parcerias-section' : `videoteca-${navKey}`;
}

function scrollToVideotecaTarget(targetId, { smooth = true } = {}) {
  const el = document.getElementById(targetId);
  if (!el) return false;

  const margin = parseInt(getComputedStyle(el).scrollMarginTop, 10);
  const offset = Number.isFinite(margin) && margin > 0
    ? margin
    : ((document.getElementById('header')?.offsetHeight || 80) + 24);

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior: smooth ? 'smooth' : 'instant' });
  return true;
}

function setVideotecaPageFocus(targetId) {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.classList.remove('videoteca-page--focus-parcerias', 'videoteca-page--focus-amigos');

  if (targetId === 'videoteca-parcerias-section') {
    main.classList.add('videoteca-page--focus-parcerias');
    return;
  }
  if (targetId === 'videoteca-clipes-amigos') {
    main.classList.add('videoteca-page--focus-amigos');
  }
}

function setVideotecaNavActive(targetId) {
  const navKey = targetId === 'videoteca-parcerias-section'
    ? 'parcerias-section'
    : targetId.replace(/^videoteca-/, '');

  document.querySelectorAll('[data-videoteca-nav]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.videotecaNav === navKey);
  });
  activateVideotecaMainNav(targetId);
}

function goToVideotecaSection(targetId, { smooth = true, updateHash = true } = {}) {
  if (!document.getElementById(targetId)) return false;

  if (updateHash) {
    history.replaceState(null, '', `#${targetId}`);
  }

  setVideotecaNavActive(targetId);
  setVideotecaPageFocus(targetId);

  const isPanelSection = targetId === 'videoteca-parcerias-section' || targetId === 'videoteca-clipes-amigos';

  if (isPanelSection) {
    const anchor = document.querySelector('.videoteca-nav');
    if (anchor) {
      const margin = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 80;
      const top = anchor.getBoundingClientRect().top + window.scrollY - margin - 12;
      window.scrollTo({ top: Math.max(0, top), left: 0, behavior: smooth ? 'smooth' : 'instant' });
    }
    return true;
  }

  scrollToVideotecaTarget(targetId, { smooth });
  requestAnimationFrame(() => scrollToVideotecaTarget(targetId, { smooth: false }));
  window.setTimeout(() => scrollToVideotecaTarget(targetId, { smooth: false }), 350);

  return true;
}

function activateVideotecaMainNav(sectionId) {
  document.querySelectorAll('.nav__list .nav__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isPatrocinios = href.includes('videoteca-parcerias-section');
    const isVideoteca = /videoteca\.html$/i.test(href.split('#')[0]) || href === 'videoteca.html';
    if (isPatrocinios) {
      link.classList.toggle('active', sectionId === 'videoteca-parcerias-section');
    } else if (isVideoteca) {
      link.classList.toggle('active', sectionId !== 'videoteca-parcerias-section');
    }
  });
}

function applyVideotecaHashNav({ smooth = true } = {}) {
  const sectionId = (location.hash || '').replace(/^#/, '');
  if (!sectionId.startsWith('videoteca-')) return false;
  return goToVideotecaSection(sectionId, { smooth, updateHash: false });
}

function initVideotecaNav() {
  document.querySelectorAll('[data-videoteca-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      goToVideotecaSection(videotecaTargetId(btn.dataset.videotecaNav), { smooth: true });
    });
  });

  document.querySelectorAll('.nav__link[href*="videoteca-parcerias-section"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const onVideoteca = document.body.dataset.page === 'videoteca'
        || /videoteca\.html?$/i.test(location.pathname)
        || location.pathname.endsWith('/videoteca');
      if (!onVideoteca) return;
      e.preventDefault();
      goToVideotecaSection('videoteca-parcerias-section', { smooth: true });
    });
  });

  window.addEventListener('hashchange', () => applyVideotecaHashNav({ smooth: true }));
}
