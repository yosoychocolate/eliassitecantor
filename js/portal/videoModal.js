/**
 * VideoModal — player + ficha técnica + próximo vídeo
 * Usa iframe direto (recriado a cada clique) para garantir o clipe correto.
 */
const VideoModal = {
  currentMeta: null,
  currentVideoId: null,
  openGeneration: 0,

  open(id, videoOrMeta) {
    const videoId = youtubeId(id) || id;
    if (!videoId) return;

    const video = resolveVideoMeta(videoId, videoOrMeta);
    const resolvedMeta = video
      ? VideoService.metaFromVideo(video)
      : {
          video: null,
          title: videoOrMeta?.titulo || videoOrMeta?.title || '',
          descricao: videoOrMeta?.descricao || '',
          next: null,
          related: VideoService.officialClips().filter(v => VideoService.id(v) !== videoId).slice(0, 4),
          sheet: null
        };

    this.currentMeta = resolvedMeta;
    this.currentVideoId = videoId;
    this.openGeneration += 1;
    const gen = this.openGeneration;

    const modal = document.getElementById('video-modal');
    if (!modal) return;

    this.fillPanel(resolvedMeta);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
    modal.querySelector('.video-modal__content')?.scrollTo(0, 0);
    document.getElementById('video-modal-upnext')?.classList.remove('is-visible');

    this.mountIframe(videoId, gen);
  },

  mountIframe(id, gen) {
    const host = document.getElementById('video-player-host');
    if (!host) return;

    host.innerHTML = '';
    host.dataset.videoId = id;

    const iframe = document.createElement('iframe');
    const origin = encodeURIComponent(location.origin);
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`;
    iframe.title = 'Vídeo';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    iframe.setAttribute('loading', 'eager');

    iframe.addEventListener('load', () => {
      if (gen !== this.openGeneration) return;
      host.dataset.videoId = id;
    });

    host.appendChild(iframe);
  },

  fillPanel(meta) {
    const artista = meta.video?.artista;
    const title = meta.video?.tipo === 'clipes-amigos' && artista
      ? `${meta.title} · ${artista}`
      : (meta.title || '');
    document.getElementById('video-modal-title').textContent = title;
    document.getElementById('video-modal-desc').textContent = meta.descricao || '';

    const sheet = document.getElementById('video-modal-sheet');
    if (sheet && meta.sheet) {
      sheet.innerHTML = `
        <dl class="video-modal__sheet">
          <div><dt>Lançamento</dt><dd>${meta.sheet.lancamento}</dd></div>
          <div><dt>Categoria</dt><dd>${meta.sheet.categoria}</dd></div>
          <div><dt>Álbum</dt><dd>${meta.sheet.album}</dd></div>
          <div><dt>${meta.sheet.compositorLabel || 'Compositor'}</dt><dd>${meta.sheet.compositor}</dd></div>
        </dl>`;
    } else if (sheet) {
      sheet.innerHTML = '';
    }

    const catalog = Portal.videos || [];
    const nextEl = document.getElementById('video-modal-next');
    if (nextEl && meta.next) {
      const nid = VideoService.id(meta.next);
      nextEl.innerHTML = `
        <p class="video-modal__related-title">Próximo vídeo</p>
        <button type="button" class="video-modal__next-card" data-youtube-id="${nid}" data-video-title="${meta.next.titulo}">
          <img src="${VideoService.thumbFor(meta.next)}" alt="${meta.next.titulo}" loading="lazy">
          <span>${meta.next.titulo}</span>
        </button>`;
      bindVideoCardThumbs(nextEl, catalog);
    } else if (nextEl) {
      nextEl.innerHTML = '';
    }

    const relatedEl = document.getElementById('video-modal-related');
    if (relatedEl && meta.related?.length) {
      relatedEl.innerHTML = `
        <p class="video-modal__related-title">Assistir também</p>
        <div class="video-modal__related-grid">
          ${meta.related.map(v => {
            const vid = VideoService.id(v);
            return `<button type="button" class="video-modal__related-item" data-youtube-id="${vid}" data-video-title="${v.titulo}">
              <img src="${VideoService.thumbFor(v)}" alt="${v.titulo}" loading="lazy">
              <span>${v.titulo}</span>
            </button>`;
          }).join('')}
        </div>`;
      bindVideoCardThumbs(relatedEl, catalog);
    } else if (relatedEl) {
      relatedEl.innerHTML = '';
    }
  },

  close() {
    const modal = document.getElementById('video-modal');
    this.openGeneration += 1;
    this.currentVideoId = null;

    const host = document.getElementById('video-player-host');
    if (host) {
      host.innerHTML = '';
      delete host.dataset.videoId;
    }

    modal?.classList.remove('active');
    modal?.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
    document.getElementById('video-modal-upnext')?.classList.remove('is-visible');
  }
};

function openYoutube(id, videoOrMeta) {
  const videoId = youtubeId(id);
  if (!videoId) return;
  VideoModal.open(videoId, resolveVideoMeta(videoId, videoOrMeta) || videoOrMeta);
}

function resolveVideoMeta(videoId, videoOrMeta) {
  if (videoOrMeta?.titulo && VideoService.id(videoOrMeta) === videoId) return videoOrMeta;
  return (Portal.videos || []).find(v => VideoService.id(v) === videoId) || null;
}
