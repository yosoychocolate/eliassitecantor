/**
 * Render Videoteca — catálogo cinematográfico
 */
function renderVideoCardCompact(video) {
  const id = VideoService.id(video);
  if (!id) return '';
  return `
    <article class="videoteca-card videoteca-card--compact" data-youtube-id="${id}" data-video-title="${video.titulo}" tabindex="0" role="button">
      <div class="videoteca-card__thumb">
        <img src="${VideoService.thumbFor(video)}" alt="${video.titulo}" loading="lazy">
        <span class="videoteca-card__play"><i class="fas fa-play"></i></span>
        ${video.isNovo ? '<span class="videoteca-card__badge">Novo</span>' : ''}
      </div>
      <p class="videoteca-card__title">${video.titulo}</p>
      ${VideoService.formatViews(video.views) ? `<p class="videoteca-card__meta">${VideoService.formatViews(video.views)}</p>` : ''}
    </article>`;
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
        <h2 class="visually-hidden">${featured.titulo}</h2>
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
}

function renderLancamentosVideoteca() {
  renderVideoFeatured();
  renderVideotecaCarousel();
}

function initVideotecaNav() {
  document.querySelectorAll('[data-videoteca-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-videoteca-nav]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`videoteca-${btn.dataset.videotecaNav}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
