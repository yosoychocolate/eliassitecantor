/**
 * VideoModal — player + ficha técnica + próximo vídeo
 * Usa iframe direto (recriado a cada clique) para garantir o clipe correto.
 */
const VideoModal = {
  currentMeta: null,
  currentVideoId: null,
  openGeneration: 0,

  open(id, videoOrMeta) {
    const video = resolveVideoMeta(id, videoOrMeta);
    const videoId = video ? VideoService.id(video) : (youtubeId(id) || id);
    if (!videoId) return;

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
    this._renderParceriaContato(resolvedMeta.video);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
    modal.querySelector('.video-modal__content')?.scrollTo(0, 0);
    document.getElementById('video-modal-upnext')?.classList.remove('is-visible');

    this.mountPlayer(videoId, gen, video);
  },

  mountPlayer(id, gen, video) {
    const host = document.getElementById('video-player-host');
    if (!host) return;

    host.innerHTML = '';
    host.dataset.videoId = id;

    const resolved = video || (Portal.videos || []).find(v => VideoService.id(v) === id);

    if (resolved && VideoService.isLocal(resolved)) {
      const vid = document.createElement('video');
      vid.src = VideoService.src(resolved);
      vid.controls = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.className = 'video-player-native';
      vid.title = resolved.titulo || 'Vídeo';
      vid.setAttribute('controlsList', 'nodownload');
      vid.addEventListener('loadeddata', () => {
        if (gen !== this.openGeneration) return;
        host.dataset.videoId = id;
      });
      host.appendChild(vid);
      vid.play().catch(() => {});
      return;
    }

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
    const parceiro = meta.video?.parceiro;
    let title = meta.title || '';
    if (meta.video?.tipo === 'clipes-amigos' && artista) title = `${meta.title} · ${artista}`;
    if (meta.video?.tipo === 'parcerias' && parceiro) title = `${meta.title} · ${parceiro}`;
    document.getElementById('video-modal-title').textContent = title;
    document.getElementById('video-modal-desc').textContent = meta.descricao || '';

    const contatoInfo = this._ensureParceriaInfoEl();
    if (contatoInfo) {
      if (meta.video?.tipo === 'parcerias' && VideoService.parceriaTelefone(meta.video)) {
        contatoInfo.innerHTML = VideoService.parceriaContatoHtml(meta.video, { variant: 'info' });
        contatoInfo.hidden = false;
      } else {
        contatoInfo.innerHTML = '';
        contatoInfo.hidden = true;
      }
    }

    const sheet = document.getElementById('video-modal-sheet');
    if (sheet && meta.sheet) {
      sheet.innerHTML = `
        <dl class="video-modal__sheet">
          <div><dt>Lançamento</dt><dd>${meta.sheet.lancamento}</dd></div>
          <div><dt>Categoria</dt><dd>${meta.sheet.categoria}</dd></div>
          <div><dt>Álbum</dt><dd>${meta.sheet.album}</dd></div>
          <div><dt>${meta.sheet.compositorLabel || 'Compositor'}</dt><dd>${meta.sheet.compositor}</dd></div>
          ${meta.sheet.telefone ? `<div><dt>WhatsApp</dt><dd>${meta.sheet.telefone}</dd></div>` : ''}
        </dl>`;
    } else if (sheet) {
      sheet.innerHTML = '';
    }

    const catalog = Portal.videos || [];
    const nextId = meta.next ? VideoService.id(meta.next) : '';
    const relatedFiltered = (meta.related || []).filter(v => VideoService.id(v) !== nextId);

    const nextEl = document.getElementById('video-modal-next');
    if (nextEl && meta.next) {
      const isParceria = meta.next.tipo === 'parcerias';
      nextEl.innerHTML = `
        <p class="video-modal__related-title">Próximo vídeo</p>
        <button type="button" class="video-modal__next-card${isParceria ? ' video-modal__next-card--parceria' : ''}" data-youtube-id="${nextId}" data-video-title="${meta.next.titulo}">
          ${VideoService.thumbMarkup(meta.next, { modal: true })}
          ${isParceria ? '' : `<span>${meta.next.titulo}</span>`}
        </button>`;
      if (!isParceria) bindVideoCardThumbs(nextEl, catalog);
      bindVideoCards(nextEl, catalog);
    } else if (nextEl) {
      nextEl.innerHTML = '';
    }

    const relatedEl = document.getElementById('video-modal-related');
    if (relatedEl && relatedFiltered.length) {
      const allParcerias = relatedFiltered.every(v => v.tipo === 'parcerias');
      relatedEl.innerHTML = `
        <p class="video-modal__related-title">Assistir também</p>
        <div class="video-modal__related-grid${allParcerias ? ' video-modal__related-grid--parcerias' : ''}">
          ${relatedFiltered.map(v => {
            const vid = VideoService.id(v);
            const isParceria = v.tipo === 'parcerias';
            return `<button type="button" class="video-modal__related-item${isParceria ? ' video-modal__related-item--parceria' : ''}" data-youtube-id="${vid}" data-video-title="${v.titulo}">
              ${VideoService.thumbMarkup(v, { modal: true })}
              ${isParceria ? '' : `<span>${v.titulo}</span>`}
            </button>`;
          }).join('')}
        </div>`;
      if (!allParcerias) bindVideoCardThumbs(relatedEl, catalog);
      bindVideoCards(relatedEl, catalog);
    } else if (relatedEl) {
      relatedEl.innerHTML = '';
    }
  },

  _ensureParceriaInfoEl() {
    let el = document.getElementById('video-modal-parceria-info');
    if (el) return el;

    const desc = document.getElementById('video-modal-desc');
    if (!desc) return null;

    el = document.createElement('div');
    el.id = 'video-modal-parceria-info';
    el.className = 'video-modal__parceria-info-wrap';
    el.hidden = true;
    desc.insertAdjacentElement('afterend', el);
    return el;
  },

  _renderParceriaContato(video) {
    const wrap = document.querySelector('.video-modal__iframe-wrap');
    if (!wrap) return;

    let overlay = wrap.querySelector('.video-modal__parceria-contato');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'video-modal__parceria-contato-host';
      wrap.appendChild(overlay);
    }

    if (video?.tipo === 'parcerias' && VideoService.parceriaTelefone(video)) {
      overlay.innerHTML = VideoService.parceriaContatoHtml(video, { variant: 'overlay' });
      overlay.hidden = false;
      wrap.classList.add('video-modal__iframe-wrap--parceria');
    } else {
      overlay.innerHTML = '';
      overlay.hidden = true;
      wrap.classList.remove('video-modal__iframe-wrap--parceria');
    }
  },

  close() {
    const modal = document.getElementById('video-modal');
    this.openGeneration += 1;
    this.currentVideoId = null;
    this._renderParceriaContato(null);

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
  const video = resolveVideoMeta(id, videoOrMeta);
  const videoId = video ? VideoService.id(video) : (youtubeId(id) || id);
  if (!videoId) return;
  VideoModal.open(videoId, video || videoOrMeta);
}

function resolveVideoMeta(videoId, videoOrMeta) {
  if (videoOrMeta?.titulo && VideoService.id(videoOrMeta) === videoId) return videoOrMeta;
  return (Portal.videos || []).find(v => VideoService.id(v) === videoId) || null;
}
