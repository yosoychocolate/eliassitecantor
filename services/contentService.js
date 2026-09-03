/**
 * ContentService — única porta de acesso a dados do portal
 *
 * Uso:
 *   await ContentService.init();
 *   const eventos = await ContentService.getEventos();
 *   const ev = await ContentService.getEvento('dourados-ms');
 *
 * Trocar origem: ContentService.useAdapter(new ApiDataAdapter(url))
 */
const ContentService = {
  _adapter: null,
  _data: null,
  _basePath: '',
  _ready: null,

  useAdapter(adapter) {
    this._adapter = adapter;
    this._data = null;
    this._ready = null;
  },

  getAdapter() {
    if (!this._adapter) {
      this._adapter = new JsonDataAdapter(this._basePath);
    }
    return this._adapter;
  },

  async init(basePath = '') {
    if (this._basePath !== basePath) {
      this._basePath = basePath;
      this._adapter = null;
      this._data = null;
      this._ready = null;
    }
    if (!this._ready) {
      this._ready = this._load()
        .then(data => {
          this._data = data;
          return data;
        })
        .catch(err => {
          this._ready = null;
          this._data = null;
          throw err;
        });
    }
    return this._ready;
  },

  async _load() {
    const raw = await this.getAdapter().loadAll();
    return {
      basePath: this._basePath,
      config: raw.config || {},
      eventos: raw.eventos || [],
      musicas: this._processMusicas(raw.musicas || [], raw.config),
      videos: this._processVideos(raw.videos || [], raw.config),
      testemunhos: raw.testemunhos || [],
      timeline: (raw.timeline || []).sort((a, b) => a.ano - b.ano),
      biografia: raw.biografia || [],
      versiculos: raw.versiculos || [],
      historiaDia: raw.historiaDia || [],
      disponibilidade: raw.disponibilidade || { slots: [], aviso: '' }
    };
  },

  _processMusicas(list, config) {
    const dias = config?.diasNovoLancamento || 90;
    const now = Date.now();
    return list
      .map(m => ({
        ...m,
        isNovo: m.novo || (m.data && (now - new Date(m.data).getTime()) < dias * 86400000)
      }))
      .sort((a, b) => new Date(b.data || b.ano) - new Date(a.data || a.ano));
  },

  _processVideos(videos, config) {
    const dias = config?.diasNovoLancamento || 90;
    const now = Date.now();
    return videos
      .map(v => ({
        ...v,
        isNovo: v.novo || (v.data && (now - new Date(v.data).getTime()) < dias * 86400000)
      }))
      .sort((a, b) => new Date(b.data || b.ano) - new Date(a.data || a.ano));
  },

  async _ensure() {
    if (!this._data) await this.init(this._basePath);
    return this._data;
  },

  getSnapshot() {
    return this._data || {
      config: {}, eventos: [], musicas: [], videos: [],
      testemunhos: [], timeline: [], biografia: [], versiculos: [], historiaDia: [],
      disponibilidade: { slots: [], aviso: '' }
    };
  },

  async getConfig() { return (await this._ensure()).config; },
  async getEventos() { return (await this._ensure()).eventos; },
  async getMusicas() { return (await this._ensure()).musicas; },
  async getVideos() { return (await this._ensure()).videos; },
  async getTestemunhos() { return (await this._ensure()).testemunhos; },
  async getTimeline() { return (await this._ensure()).timeline; },
  async getBiografia() { return (await this._ensure()).biografia; },
  async getVersiculos() { return (await this._ensure()).versiculos; },

  async getEvento(slug) {
    const eventos = await this.getEventos();
    return eventos.find(e => e.slug === slug) || null;
  },

  async getMemoriais() {
    const eventos = await this.getEventos();
    return eventos.filter(ev => Ministry.isMemorial(ev));
  },

  async getAgenda() {
    const eventos = await this.getEventos();
    return eventos
      .filter(ev => Ministry.isAgenda(ev))
      .sort((a, b) => {
        if (!a.data) return 1;
        if (!b.data) return -1;
        return a.data.localeCompare(b.data);
      });
  },

  async getRecentMemorial() {
    const memoriais = await this.getMemoriais();
    return memoriais.filter(e => e.data).sort((a, b) => b.data.localeCompare(a.data))[0] || null;
  },

  async getNextEvento() {
    const agenda = await this.getAgenda();
    return agenda.find(e => e.data) || agenda[0] || null;
  },

  async getLatestMusica() {
    const musicas = await this.getMusicas();
    return musicas[0] || null;
  },

  async getLatestVideo() {
    const videos = await this.getVideos();
    return videos[0] || null;
  },

  getHistoriaDoDia(date = new Date()) {
    const d = this.getSnapshot();
    const mes = date.getMonth() + 1;
    const dia = date.getDate();

    const explicit = (d.historiaDia || []).find(e => e.mes === mes && e.dia === dia);
    if (explicit) return { ...explicit, mes, dia };

    const musica = d.musicas.find(m => {
      if (!m.data) return false;
      const dt = Ministry.parseDate(m.data);
      return dt.getMonth() + 1 === mes && dt.getDate() === dia;
    });
    if (musica) {
      return {
        mes, dia, tipo: 'lancamento', ano: musica.ano,
        texto: `Neste dia foi lançado ${musica.titulo}.`,
        link: 'discografia.html', linkLabel: 'Ver discografia'
      };
    }

    const memorial = d.eventos
      .filter(ev => Ministry.isMemorial(ev) && ev.data)
      .find(ev => {
        const dt = Ministry.parseDate(ev.data);
        return dt.getMonth() + 1 === mes && dt.getDate() === dia;
      });
    if (memorial) {
      return {
        mes, dia, tipo: 'memorial', ano: Ministry.parseDate(memorial.data).getFullYear(),
        texto: `Em ${memorial.cidade}/${memorial.estado}, ${memorial.titulo}.`,
        link: memorialHref(memorial.slug), linkLabel: 'Ver memorial'
      };
    }

    return null;
  },

  /** Entrada curada quando não há match exato no dia */
  getHistoriaFallback(date = new Date()) {
    const d = this.getSnapshot();
    const entradas = d.historiaDia || [];
    if (!entradas.length) return null;
    const start = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((date - start) / 86400000);
    const entry = entradas[dayOfYear % entradas.length];
    return {
      ...entry,
      mes: date.getMonth() + 1,
      dia: date.getDate(),
      rotativo: true
    };
  },

  async getMemoriaisByEstado() {
    const map = {};
    (await this.getMemoriais()).forEach(ev => {
      if (!map[ev.estado]) map[ev.estado] = [];
      map[ev.estado].push(ev);
    });
    return map;
  },

  async computeStats() {
    const d = await this._ensure();
    const memoriais = d.eventos.filter(ev => Ministry.isMemorial(ev));
    const cidades = new Set(memoriais.map(e => e.cidade));
    const estados = new Set(memoriais.map(e => e.estado));
    const igrejas = new Set(memoriais.map(e => e.titulo));
    const fotos = memoriais.reduce((s, e) => s + (e.galeria?.length || 0), 0);
    const videosCount = d.videos.length + memoriais.reduce((s, e) => s + (e.videos?.length || 0), 0);

    return {
      anosMinisterio: new Date().getFullYear() - (d.config.artistaDesde || 1986),
      cidades: cidades.size,
      estados: estados.size,
      memoriais: memoriais.length,
      igrejas: igrejas.size,
      eventos: d.eventos.length,
      fotos,
      videos: videosCount,
      musicas: d.musicas.length
    };
  },

  async getNarrativaTimeline() {
    return NarrativeService.build(await this._ensure());
  },

  basePath() {
    return this._basePath;
  },

  asset(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this._basePath}${path.replace(/^\//, '')}`;
  },

  isProductionHost() {
    const siteUrl = this.getSnapshot()?.config?.siteUrl;
    if (!siteUrl) return false;
    try {
      return location.hostname === new URL(siteUrl).hostname;
    } catch {
      return /ministerioeliassilva\.com\.br$/i.test(location.hostname);
    }
  },

  memorialUrl(slug) {
    const base = this._basePath;
    const siteUrl = this.getSnapshot().config?.siteUrl;
    if (siteUrl && this.isProductionHost()) {
      return `${siteUrl.replace(/\/$/, '')}/memorial/${slug}`;
    }
    return `${base}memorial.html?evento=${slug}`;
  },

  memorialPath(slug) {
    return `${this._basePath}memorial/${slug}`;
  },

  groupMemoriaisByYearMonth() {
    const memoriais = this.getSnapshot().eventos.filter(ev => Ministry.isMemorial(ev) && ev.data);
    const tree = {};
    memoriais.forEach(ev => {
      const d = Ministry.parseDate(ev.data);
      const year = d.getFullYear();
      const monthKey = d.getMonth();
      const month = d.toLocaleDateString('pt-BR', { month: 'long' });
      if (!tree[year]) tree[year] = {};
      if (!tree[year][monthKey]) tree[year][monthKey] = { label: month, eventos: [] };
      tree[year][monthKey].eventos.push(ev);
    });
    return Object.keys(tree)
      .sort((a, b) => Number(b) - Number(a))
      .map(year => ({
        year,
        meses: Object.keys(tree[year]).sort((a, b) => Number(b) - Number(a)).map(k => tree[year][k])
      }));
  }
};

/* Helpers globais delegados ao serviço (compatibilidade) */
function asset(path) { return ContentService.asset(path); }
function memorialHref(slug) { return ContentService.memorialUrl(slug); }
function youtubeId(urlOrId) {
  if (!urlOrId) return '';
  if (urlOrId.length === 11 && !urlOrId.includes('/')) return urlOrId;
  const m = urlOrId.match(/(?:v=|\/)([\w-]{11})/);
  return m ? m[1] : urlOrId;
}
function youtubeThumb(id) {
  return `https://img.youtube.com/vi/${youtubeId(id)}/maxresdefault.jpg`;
}

async function loadPortal(basePath = '') {
  return ContentService.init(basePath);
}

// Proxy Portal para código legado
const Portal = new Proxy({}, {
  get(_, prop) {
    if (prop === 'basePath') return ContentService._basePath;
    return ContentService.getSnapshot()[prop];
  }
});

function getMemoriais() { return ContentService.getSnapshot().eventos.filter(ev => Ministry.isMemorial(ev)); }
function getAgendaEventos() {
  return ContentService.getSnapshot().eventos
    .filter(ev => Ministry.isAgenda(ev))
    .sort((a, b) => (!a.data ? 1 : !b.data ? -1 : a.data.localeCompare(b.data)));
}
function getEventoBySlug(slug) { return ContentService.getSnapshot().eventos.find(e => e.slug === slug); }
function getLatestMusica() { return ContentService.getSnapshot().musicas[0]; }
function getLatestVideo() { return ContentService.getSnapshot().videos[0]; }
function getRecentMemorial() {
  return getMemoriais().filter(e => e.data).sort((a, b) => b.data.localeCompare(a.data))[0];
}
function getNextEvento() { return getAgendaEventos().find(e => e.data) || getAgendaEventos()[0]; }
function computeStats() {
  const d = ContentService.getSnapshot();
  const memoriais = getMemoriais();
  return {
    anosMinisterio: new Date().getFullYear() - (d.config.artistaDesde || 1986),
    cidades: new Set(memoriais.map(e => e.cidade)).size,
    estados: new Set(memoriais.map(e => e.estado)).size,
    memoriais: memoriais.length,
    igrejas: new Set(memoriais.map(e => e.titulo)).size,
    eventos: d.eventos.length,
    fotos: memoriais.reduce((s, e) => s + (e.galeria?.length || 0), 0),
    videos: d.videos.length,
    musicas: d.musicas.length
  };
}
function groupMemoriaisByYearMonth() { return ContentService.groupMemoriaisByYearMonth(); }
function getMemoriaisByEstado() {
  const map = {};
  getMemoriais().forEach(ev => {
    if (!map[ev.estado]) map[ev.estado] = [];
    map[ev.estado].push(ev);
  });
  return map;
}
