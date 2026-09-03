/**
 * SearchService — busca global unificada
 */
const SearchService = {
  _cache: null,

  normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  },

  keywordString(...parts) {
    return this.normalize(parts.filter(Boolean).join(' '));
  },

  matches(keywords, query) {
    const nk = this.normalize(keywords);
    const nq = this.normalize(query);
    if (!nq || nq.length < 2) return false;
    if (nk.includes(nq)) return true;
    const words = nk.split(/[\s,;|/\\—·\-]+/).filter(w => w.length > 1);
    return words.some(w => w.includes(nq) || w.startsWith(nq) || nq.startsWith(w));
  },

  async index() {
    if (this._cache) return this._cache;

    const base = document.body?.dataset?.basePath || '';
    await ContentService.init(base);
    const d = ContentService.getSnapshot();
    const results = [];

    results.push({
      type: 'musica',
      title: 'Discografia — Música',
      subtitle: 'Álbuns e singles do ministério',
      keywords: this.keywordString('musica discografia lancamentos singles albuns gospel'),
      href: 'discografia.html'
    });

    results.push({
      type: 'evento',
      title: 'Agenda de ministrações',
      subtitle: 'Próximos cultos e eventos',
      keywords: this.keywordString('agenda eventos shows cultos ministeracao datas'),
      href: 'index.html#agenda'
    });

    results.push({
      type: 'memorial',
      title: 'Memoriais',
      subtitle: 'Cultos e eventos registrados',
      keywords: this.keywordString('memoriais memorial cultos arquivo historico'),
      href: 'memoriais.html'
    });

    results.push({
      type: 'video',
      title: 'Videoteca',
      subtitle: 'Clipes e vídeos oficiais',
      keywords: this.keywordString('videoteca videos clipes youtube'),
      href: 'videoteca.html'
    });

    (d.musicas || []).forEach(m => {
      results.push({
        type: 'musica',
        title: m.titulo,
        subtitle: `${m.ano || ''} · Lançamento`.trim(),
        keywords: this.keywordString(
          m.titulo, m.ano, m.tipo, m.album, m.compositor,
          'musica discografia lancamento single gospel elias silva'
        ),
        href: 'discografia.html'
      });
    });

    (d.videos || []).forEach(v => {
      results.push({
        type: 'video',
        title: v.titulo,
        subtitle: [v.tipo, v.ano, v.album].filter(Boolean).join(' · '),
        keywords: this.keywordString(
          v.titulo, v.descricao, v.tipo, v.ano, v.album, v.compositor,
          'video clipe videoteca youtube musica'
        ),
        href: 'videoteca.html'
      });
    });

    (d.eventos || []).forEach(ev => {
      const isMem = Ministry.isMemorial(ev);
      results.push({
        type: isMem ? 'memorial' : 'evento',
        title: isMem ? `Memorial — ${ev.titulo}` : `${ev.cidade} — ${ev.titulo}`,
        subtitle: [ev.cidade, ev.estado, ev.pastor, Ministry.formatDate(ev.data)].filter(Boolean).join(' · '),
        keywords: this.keywordString(
          ev.slug, ev.titulo, ev.cidade, ev.estado, ev.pastor, ev.tipo, ev.descricao,
          isMem ? 'memorial' : 'agenda evento'
        ),
        href: isMem ? ContentService.memorialUrl(ev.slug) : 'index.html#agenda',
        slug: ev.slug
      });
    });

    (d.testemunhos || []).forEach(t => {
      results.push({
        type: 'testemunho',
        title: t.nome,
        subtitle: t.cargo || '',
        keywords: this.keywordString(t.nome, t.cargo, t.texto, 'depoimento testemunho'),
        href: 'index.html#depoimentos'
      });
    });

    this._cache = results;
    return results;
  },

  async search(query) {
    const q = query.trim();
    if (q.length < 2) return [];
    const index = await this.index();
    return index
      .filter(item => this.matches(item.keywords, q))
      .slice(0, 12);
  },

  clearCache() {
    this._cache = null;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ContentService.init(document.body?.dataset?.basePath || '')
    .then(() => SearchService.clearCache())
    .catch(() => {});
});
