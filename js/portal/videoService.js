/**
 * VideoService — YouTube, destaque, metadados e catálogo
 */
const VideoService = {
  CHANNEL: 'https://www.youtube.com/@cantoreliassilvaoficial',
  PLACEHOLDER_ID: 'dQw4w9WgXcQ',

  /** Ordem oficial dos clipes enviados pelo ministério */
  OFFICIAL_CLIP_IDS: [
    '1zlCHxJHG_c',
    'PlKtFfpkf2Y',
    '1X7ELRya8fk',
    'wHVY4VyjE4k',
    'wpy85XiINlI'
  ],

  CATEGORIES: [
    { id: 'clipe-oficial', icon: '🎬', label: 'Clipes Oficiais' },
    { id: 'ao-vivo', icon: '🎤', label: 'Ao Vivo' },
    { id: 'congressos', icon: '🙏', label: 'Congressos' },
    { id: 'entrevista', icon: '📺', label: 'Entrevistas' },
    { id: 'participacao', icon: '🤝', label: 'Participações' },
    { id: 'playback', icon: '🎵', label: 'Playback' }
  ],

  TIPO_LABEL: {
    'clipe-oficial': 'Clipe Oficial',
    'clipes-amigos': 'Clipe Amigo',
    parcerias: 'Patrocínio e Parceria',
    'ao-vivo': 'Apresentação ao Vivo',
    congressos: 'Congresso',
    entrevista: 'Entrevista',
    participacao: 'Participação Especial',
    playback: 'Playback'
  },

  AMIGOS_INTRO: 'Alguns artistas fazem parte da caminhada do ministério de Elias Silva. Nesta seção estão reunidos clipes publicados em seu canal como forma de apoio, incentivo e divulgação.',

  PARCERIAS_INTRO: 'Empresas e parceiros que caminham junto com o Ministério Elias Silva. Aqui estão reunidos os registros oficiais de patrocínios e parcerias publicados no canal.',

  PARTNER_TIPOS: ['clipes-amigos', 'parcerias'],

  id(video) {
    const yt = youtubeId(video?.youtube);
    if (yt && yt !== '#') return yt;
    if (video?.arquivo) {
      const base = String(video.arquivo).split('/').pop().replace(/\.[^.]+$/, '');
      return base ? `local-${base}` : '';
    }
    return '';
  },

  isLocal(video) {
    return Boolean(video?.arquivo);
  },

  src(video) {
    return video?.arquivo ? asset(video.arquivo) : '';
  },

  isRealVideo(video) {
    if (video?.arquivo) return true;
    const id = youtubeId(video?.youtube);
    return Boolean(id && id !== this.PLACEHOLDER_ID);
  },

  officialClips(list) {
    const all = this.ministryPlayable(list).filter(v => v.tipo === 'clipe-oficial');
    const ordered = this.OFFICIAL_CLIP_IDS
      .map(clipId => all.find(v => this.id(v) === clipId))
      .filter(Boolean);
    return ordered.length ? ordered : all;
  },

  thumbUrl(id, quality = 'maxresdefault') {
    return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : '';
  },

  thumbFor(video) {
    if (video?.tipo === 'parcerias') return '';
    const yt = youtubeId(video?.youtube);
    if (yt) return this.thumbUrl(yt);
    if (video?.thumb) return asset(video.thumb);
    return asset(video?.thumbFallback || '');
  },

  parceriaCoverHtml(video, extraClass = '') {
    const parceiro = video?.parceiro || '';
    const telefone = this.parceriaTelefone(video);
    const subtitle = parceiro || 'Registro oficial de parceria';
    return `
      <div class="videoteca-parceria-card__panel ${extraClass}" aria-hidden="true">
        <span class="videoteca-parceria-card__badge">Parceria</span>
        <h4 class="videoteca-parceria-card__title">${video.titulo}</h4>
        <p class="videoteca-parceria-card__subtitle">${subtitle}</p>
        ${telefone ? `<p class="videoteca-parceria-card__phone">${telefone}</p>` : ''}
        <span class="videoteca-parceria-card__cta"><i class="fas fa-play"></i> Assistir</span>
      </div>`;
  },

  parceriaTelefone(video) {
    return (video?.telefone || '').trim();
  },

  parceriaWhatsappDigits(video) {
    const raw = video?.whatsapp || video?.telefone || '';
    return String(raw).replace(/\D/g, '');
  },

  parceriaWhatsappHref(video) {
    const digits = this.parceriaWhatsappDigits(video);
    return digits ? `https://wa.me/${digits}` : '';
  },

  parceriaContatoHtml(video, { variant = 'overlay' } = {}) {
    const telefone = this.parceriaTelefone(video);
    if (!telefone) return '';

    const href = this.parceriaWhatsappHref(video);
    const cls = variant === 'info'
      ? 'video-modal__parceria-info'
      : 'video-modal__parceria-contato';
    const linkCls = `${cls}-link`;
    const inner = `<i class="fab fa-whatsapp" aria-hidden="true"></i><span class="${cls}-numero">${telefone}</span>`;

    const link = href
      ? `<a href="${href}" class="${linkCls}" target="_blank" rel="noopener noreferrer">${inner}</a>`
      : `<span class="${linkCls}">${inner}</span>`;

    return `
      <div class="${cls}">
        <span class="${cls}-label">WhatsApp</span>
        ${link}
      </div>`;
  },

  parceriaModalItemHtml(video) {
    const telefone = this.parceriaTelefone(video);
    return `
      <span class="video-modal__parceria-link" aria-hidden="true">
        <span class="video-modal__parceria-link-kicker">Parceria</span>
        <span class="video-modal__parceria-link-row">
          <span class="video-modal__parceria-link-title">${video.titulo}</span>
          <i class="fas fa-play" aria-hidden="true"></i>
        </span>
        ${telefone ? `<span class="video-modal__parceria-link-phone">${telefone}</span>` : ''}
      </span>`;
  },

  thumbMarkup(video, { modal = false } = {}) {
    if (video?.tipo === 'parcerias') {
      return modal ? this.parceriaModalItemHtml(video) : this.parceriaCoverHtml(video);
    }
    return `<img src="${this.thumbFor(video)}" alt="${video.titulo}" loading="lazy">`;
  },

  channelUrl() {
    return ContentService.getSnapshot()?.config?.redes?.youtube || this.CHANNEL;
  },

  playable(list) {
    return (list || Portal.videos || []).filter(v => this.isRealVideo(v));
  },

  /** Vídeos do ministério — exclui clipes de parceiros e patrocínios */
  ministryPlayable(list) {
    return this.playable(list).filter(v => !this.PARTNER_TIPOS.includes(v.tipo));
  },

  friendClips(list) {
    return this.playable(list).filter(v => v.tipo === 'clipes-amigos');
  },

  partnerClips(list) {
    return this.playable(list).filter(v => v.tipo === 'parcerias');
  },

  partnerEntries(list) {
    return (list || Portal.videos || []).filter(v => v.tipo === 'parcerias');
  },

  featured() {
    const all = this.ministryPlayable();
    return all.find(v => v.destaque) || all[0] || null;
  },

  recent(limit = 12) {
    return this.ministryPlayable().slice(0, limit);
  },

  byCategory(list, catId) {
    return this.ministryPlayable(list).filter(v => v.tipo === catId);
  },

  formatDateLong(video) {
    if (!video?.data) return video?.ano ? String(video.ano) : '—';
    const d = Ministry.parseDate(video.data);
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  formatDateShort(video) {
    if (video?.data) {
      return `Lançado em ${Ministry.parseDate(video.data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
    }
    return video?.ano ? `Lançado em ${video.ano}` : '';
  },

  formatViews(views) {
    if (!views) return '';
    if (views >= 1_000_000) {
      const m = views / 1_000_000;
      return `${m % 1 === 0 ? m : m.toFixed(1).replace('.', ',')} mi views`;
    }
    if (views >= 1_000) return `${Math.round(views / 1_000)} mil views`;
    return `${views} views`;
  },

  nextVideo(current) {
    if (current?.tipo === 'clipes-amigos') {
      const clips = this.friendClips();
      if (!current) return clips[1] || clips[0] || null;
      const idx = clips.findIndex(v => this.id(v) === this.id(current));
      if (idx === -1) return clips[0] || null;
      return clips[idx + 1] || clips[0] || null;
    }
    if (current?.tipo === 'parcerias') {
      const clips = this.partnerClips();
      if (!current) return clips[1] || clips[0] || null;
      const idx = clips.findIndex(v => this.id(v) === this.id(current));
      if (idx === -1) return clips[0] || null;
      return clips[idx + 1] || clips[0] || null;
    }
    const clips = this.officialClips();
    if (!current) return clips[1] || clips[0] || null;
    const idx = clips.findIndex(v => this.id(v) === this.id(current));
    if (idx === -1) return clips[0] || null;
    return clips[idx + 1] || clips[0] || null;
  },

  relatedFor(video) {
    if (video?.tipo === 'clipes-amigos') {
      return this.friendClips()
        .filter(v => this.id(v) !== this.id(video))
        .slice(0, 4);
    }
    if (video?.tipo === 'parcerias') {
      return this.partnerClips()
        .filter(v => this.id(v) !== this.id(video))
        .slice(0, 4);
    }
    return this.officialClips()
      .filter(v => this.id(v) !== this.id(video))
      .slice(0, 4);
  },

  metaFromVideo(video) {
    const next = this.nextVideo(video);
    const isAmigo = video?.tipo === 'clipes-amigos';
    const isParceria = video?.tipo === 'parcerias';
    const partnerName = video?.parceiro || video?.artista;
    return {
      video,
      title: video.titulo,
      descricao: video.descricao || '',
      next,
      related: this.relatedFor(video),
      sheet: {
        lancamento: this.formatDateLong(video),
        categoria: this.TIPO_LABEL[video.tipo] || video.tipo || '—',
        album: video.album || '—',
        compositor: partnerName || video.compositor || (isAmigo || isParceria ? '—' : 'Elias Silva'),
        compositorLabel: isParceria ? 'Parceiro' : (isAmigo ? 'Artista' : 'Compositor'),
        telefone: isParceria ? this.parceriaTelefone(video) : ''
      }
    };
  },

  bindThumbFallback(img, video) {
    const id = this.id(video);
    if (!id) return;
    img.addEventListener('error', function onErr() {
      if (this.dataset.fallback === 'hq') {
        this.src = asset(video.thumbFallback || 'assets/images/hero-bg.png');
        return;
      }
      this.dataset.fallback = 'hq';
      this.src = VideoService.thumbUrl(id, 'hqdefault');
    }, { once: false });
  }
};

function bindVideoCardThumbs(root, catalog) {
  root?.querySelectorAll('[data-youtube-id] img').forEach(img => {
    const card = img.closest('[data-youtube-id]');
    if (!card) return;
    const video = (catalog || Portal.videos || []).find(v => VideoService.id(v) === card.dataset.youtubeId);
    if (video) VideoService.bindThumbFallback(img, video);
  });
}

function findVideoMeta(id) {
  return (Portal.videos || []).find(v => VideoService.id(v) === id)
    || (Portal.musicas || []).find(m => youtubeId(m.youtube) === id)
    || null;
}

/** Abre o player a partir de um card ou botão com data-youtube-id */
function openVideoCard(card, e) {
  if (!card?.dataset?.youtubeId) return;
  if (card.closest('.videoteca-carousel__nav, .videoteca-playlist__header')) return;

  if (typeof dismissHomeOpening === 'function') {
    dismissHomeOpening({ animated: false });
  }

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const id = card.dataset.youtubeId;
  const video = findVideoMeta(id);
  openYoutube(id, video || { titulo: card.dataset.videoTitle || '' });
}

/** Um único handler de clique — sempre usa o data-youtube-id do card clicado */
function initVideoCardClicks() {
  if (initVideoCardClicks._done) return;
  initVideoCardClicks._done = true;

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-youtube-id]');
    if (!card || card.dataset.videoClickBound) return;
    openVideoCard(card, e);
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-youtube-id]');
    if (!card || card.tagName === 'BUTTON') return;
    e.preventDefault();
    openVideoCard(card);
  });
}

function bindVideoCards(root, relatedAll) {
  bindVideoCardThumbs(root, relatedAll?.length ? relatedAll : (Portal.videos || []));
  root?.querySelectorAll('[data-youtube-id]').forEach(card => {
    if (card.dataset.videoClickBound) return;
    card.dataset.videoClickBound = '1';
    card.addEventListener('click', e => openVideoCard(card, e));
  });
}

document.addEventListener('DOMContentLoaded', () => initVideoCardClicks());

function initVideotecaCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(wrap => {
    if (wrap.dataset.carouselBound) return;
    wrap.dataset.carouselBound = '1';
    const track = wrap.querySelector('[data-carousel-track]');
    const prev = wrap.querySelector('[data-carousel-prev]');
    const next = wrap.querySelector('[data-carousel-next]');
    if (!track) return;
    const step = () => Math.min(track.clientWidth * 0.85, 720);
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  });
}
