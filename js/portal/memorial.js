/**
 * Memorial — template único via ContentService
 */
const PortalMemorial = {
  async init() {
    const root = document.getElementById('app');
    const slug = PortalRouter.getEventSlug();
    const base = PortalRouter.resolveBasePath();

    await ContentService.init(base);

    if (!slug) {
      root.innerHTML = `<div class="container event-section"><p>Evento não especificado. <a href="${base}memoriais.html">Ver memoriais</a></p></div>`;
      return;
    }

    const ev = await ContentService.getEvento(slug);
    if (!ev) {
      root.innerHTML = '<div class="container event-section"><p>Memorial não encontrado.</p></div>';
      return;
    }

    if (!Ministry.isMemorial(ev)) {
      root.innerHTML = `<div class="container event-section"><p>Evento ainda não realizado. <a href="${base}index.html#agenda">Ver Agenda</a></p></div>`;
      return;
    }

    AnalyticsService.trackMemorial(slug, ev.cidade);
    PortalSEO.forEvent(ev, base);
    if (typeof SchemaOrg !== 'undefined') SchemaOrg.memorial(ev);
    this.render(root, ev, base);
    this.initParallax();
    if (typeof SkeletonUI !== 'undefined') SkeletonUI.doneAll();
    if (typeof PremiumExperience !== 'undefined') PremiumExperience.spotlight();
  },

  render(root, ev, base) {
    const hero = asset(ev.heroImage || ev.galeria?.[0]?.imagemFull);
    const descHtml = (ev.descricao || '').split('\n\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');

    root.innerHTML = `
      <section class="event-hero event-hero--parallax" id="event-hero">
        <div class="event-hero__parallax-bg" style="background-image:url('${hero}')"></div>
        <div class="event-hero__overlay"></div>
        <div class="container event-hero__content">
          <nav class="breadcrumb"><a href="${base}index.html">Home</a><span>/</span><a href="${base}memoriais.html">Memoriais</a><span>/</span><span>${ev.cidade}/${ev.estado}</span></nav>
          <p class="event-hero__type">${ev.tipo || 'Evento'}</p>
          <h1 class="event-hero__title">${ev.titulo}</h1>
          ${ev.testemunho ? `<p class="event-hero__quote">"${ev.testemunho}"</p>` : ''}
          <div class="event-meta">
            <div class="event-meta__item"><i class="far fa-calendar"></i><span>${Ministry.formatDate(ev.data)}</span></div>
            <div class="event-meta__item"><i class="fas fa-map-marker-alt"></i><span>${ev.cidade} — ${ev.estado}</span></div>
            ${ev.pastor ? `<div class="event-meta__item"><i class="fas fa-user-tie"></i><span>${ev.pastor}</span></div>` : ''}
          </div>
        </div>
      </section>
      <section class="event-section"><div class="container"><div id="share-bar"></div></div></section>
      <section class="event-section"><div class="container"><div class="event-info-grid event-info-grid--memorial">
        <div class="event-info-card"><i class="fas fa-map-marker-alt"></i><strong>Local</strong><span>${ev.titulo}<br>${ev.cidade} — ${ev.estado}</span></div>
        ${ev.pastor ? `<div class="event-info-card"><i class="fas fa-user-tie"></i><strong>Pastor</strong><span>${ev.pastor}</span></div>` : ''}
        <div class="event-info-card"><i class="far fa-calendar-check"></i><strong>Data</strong><span>${Ministry.formatDate(ev.data)}</span></div>
        <div class="event-info-card"><i class="fas fa-music"></i><strong>Tipo</strong><span>${ev.tipo || '—'}</span></div>
        ${ev.galeria?.length ? `<div class="event-info-card"><i class="fas fa-camera"></i><strong>Fotos</strong><span>${ev.galeria.length}${ev.galeriaTotal ? ` de ${ev.galeriaTotal}` : ''}</span></div>` : ''}
      </div></div></section>
      ${descHtml ? `<section class="event-section"><div class="container"><h2 class="event-section__title"><i class="fas fa-book-open"></i> Sobre o Culto</h2><div class="event-relato">${descHtml}</div></div></section>` : ''}
      ${ev.louvores?.length ? `<section class="event-section"><div class="container"><h2 class="event-section__title"><i class="fas fa-compact-disc"></i> Louvores</h2><ul class="event-louvores">${ev.louvores.map(l => `<li><i class="fas fa-play"></i> ${l}</li>`).join('')}</ul></div></section>` : ''}
      <section class="event-section"><div class="container"><h2 class="event-section__title"><i class="fas fa-video"></i> Vídeos</h2><div class="event-videos">${ev.videos?.length ? ev.videos.map(v => `<a href="https://youtube.com/watch?v=${youtubeId(v.youtube)}" class="event-video-card" target="_blank" rel="noopener"><i class="fas fa-play-circle"></i><span>${v.titulo}</span></a>`).join('') : '<div class="event-video-placeholder"><i class="fas fa-film"></i><span>Em breve</span></div>'}</div></div></section>
      ${ev.galeria?.length ? `<section class="event-section" id="galeria"><div class="container"><h2 class="event-section__title"><i class="fas fa-camera"></i> Galeria</h2><div id="memorial-gallery"></div></div></section>` : ''}
      <div class="event-back"><a href="${base}memoriais.html" class="btn btn--outline"><i class="fas fa-arrow-left"></i> Voltar</a></div>`;

    ShareService.renderBar(document.getElementById('share-bar'), ev);

    if (ev.galeria?.length) {
      PortalGallery.render(document.getElementById('memorial-gallery'), ev.galeria, {
        totalArquivo: ev.galeriaTotal,
        lightboxGroup: 'memorial'
      });
    }
  },

  initParallax() {
    const hero = document.getElementById('event-hero');
    const bg = hero?.querySelector('.event-hero__parallax-bg');
    if (!bg) return;
    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      bg.style.transform = `translate3d(0, ${rect.top * 0.35}px, 0) scale(1.08)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'memorial') PortalMemorial.init();
});
