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
    'ao-vivo': 'Apresentação ao Vivo',
    congressos: 'Congresso',
    entrevista: 'Entrevista',
    participacao: 'Participação Especial',
    playback: 'Playback'
  },

  AMIGOS_INTRO: 'Alguns artistas fazem parte da caminhada do ministério de Elias Silva. Nesta seção estão reunidos clipes publicados em seu canal como forma de apoio, incentivo e divulgação.',

  id(video) {
    const id = youtubeId(video?.youtube);
    return id && id !== '#' ? id : '';
  },

  isRealVideo(video) {
    const id = this.id(video);
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
    const id = this.id(video);
    if (!id) return asset(video?.thumb || video?.thumbFallback || '');
    if (video?.thumb && !String(video.thumb).startsWith('http')) return asset(video.thumb);
    return this.thumbUrl(id);
  },

  channelUrl() {
    return ContentService.getSnapshot()?.config?.redes?.youtube || this.CHANNEL;
  },

  playable(list) {
    return (list || Portal.videos || []).filter(v => this.isRealVideo(v));
  },

  /** Vídeos do ministério — exclui clipes de artistas parceiros */
  ministryPlayable(list) {
    return this.playable(list).filter(v => v.tipo !== 'clipes-amigos');
  },

  friendClips(list) {
    return this.playable(list).filter(v => v.tipo === 'clipes-amigos');
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
    return this.officialClips()
      .filter(v => this.id(v) !== this.id(video))
      .slice(0, 4);
  },

  metaFromVideo(video) {
    const next = this.nextVideo(video);
    const isAmigo = video?.tipo === 'clipes-amigos';
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
        compositor: video.artista || video.compositor || (isAmigo ? '—' : 'Elias Silva'),
        compositorLabel: isAmigo ? 'Artista' : 'Compositor'
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

/** Um único handler de clique — sempre usa o data-youtube-id do card clicado */
function initVideoCardClicks() {
  if (initVideoCardClicks._done) return;
  initVideoCardClicks._done = true;

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-youtube-id]');
    if (!card || card.closest('.videoteca-carousel__nav, .videoteca-playlist__header')) return;

    const id = card.dataset.youtubeId;
    if (!id) return;

    e.preventDefault();
    e.stopPropagation();

    const video = (Portal.videos || []).find(v => VideoService.id(v) === id);
    openYoutube(id, video || { titulo: card.dataset.videoTitle || '' });
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-youtube-id]');
    if (!card || card.tagName === 'BUTTON') return;
    e.preventDefault();
    const id = card.dataset.youtubeId;
    if (!id) return;
    const video = (Portal.videos || []).find(v => VideoService.id(v) === id);
    openYoutube(id, video || { titulo: card.dataset.videoTitle || '' });
  });
}

function bindVideoCards(root, relatedAll) {
  bindVideoCardThumbs(root, relatedAll?.length ? relatedAll : (Portal.videos || []));
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
