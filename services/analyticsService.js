/**
 * AnalyticsService — métricas locais (preparado para API futura)
 */
const AnalyticsService = {
  KEY: 'ministerio_analytics',

  _read() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '{}');
    } catch {
      return {};
    }
  },

  _write(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  track(type, id, meta = {}) {
    const data = this._read();
    if (!data[type]) data[type] = {};
    if (!data[type][id]) data[type][id] = { count: 0, meta: {} };
    data[type][id].count++;
    data[type][id].lastVisit = Date.now();
    data[type][id].meta = { ...data[type][id].meta, ...meta };
    data._sessions = (data._sessions || 0) + 1;
    this._write(data);
  },

  trackPage(page, meta) {
    this.track('pages', page, meta);
  },

  trackMemorial(slug, cidade) {
    this.track('memoriais', slug, { cidade });
    this.trackPage(`memorial:${slug}`, { cidade });
  },

  trackMusica(titulo) {
    this.track('musicas', titulo);
  },

  getDashboard() {
    const data = this._read();
    const top = (obj) => Object.entries(obj || {})
      .map(([id, v]) => ({ id, count: v.count, meta: v.meta }))
      .sort((a, b) => b.count - a.count);

    const memorials = top(data.memoriais);
    const musicas = top(data.musicas);
    const cidades = {};
    memorials.forEach(m => {
      const c = m.meta?.cidade || '—';
      cidades[c] = (cidades[c] || 0) + m.count;
    });

    return {
      memorialTop: memorials[0],
      musicaTop: musicas[0],
      cidadeTop: Object.entries(cidades).sort((a, b) => b[1] - a[1])[0],
      totalSessions: data._sessions || 0,
      memorials,
      musicas
    };
  }
};
