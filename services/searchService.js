/**
 * SearchService — busca global unificada
 */
const SearchService = {
  async index() {
    await ContentService._ensure();
    const d = ContentService.getSnapshot();
    const results = [];

    d.musicas.forEach(m => {
      results.push({
        type: 'musica',
        title: m.titulo,
        subtitle: `${m.ano} · Lançamento`,
        keywords: [m.titulo, String(m.ano), m.tipo].join(' ').toLowerCase(),
        href: '#discografia'
      });
    });

    d.eventos.forEach(ev => {
      const isMem = Ministry.isMemorial(ev);
      results.push({
        type: isMem ? 'memorial' : 'evento',
        title: isMem ? `Memorial — ${ev.titulo}` : `${ev.cidade} — ${ev.titulo}`,
        subtitle: [ev.cidade, ev.estado, ev.pastor, Ministry.formatDate(ev.data)].filter(Boolean).join(' · '),
        keywords: [ev.slug, ev.titulo, ev.cidade, ev.estado, ev.pastor, ev.tipo].join(' ').toLowerCase(),
        href: isMem ? ContentService.memorialUrl(ev.slug) : '#agenda',
        slug: ev.slug
      });
    });

    d.testemunhos.forEach(t => {
      results.push({
        type: 'testemunho',
        title: t.nome,
        subtitle: t.cargo,
        keywords: [t.nome, t.cargo, t.texto].join(' ').toLowerCase(),
        href: '#depoimentos'
      });
    });

    return results;
  },

  async search(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const index = await this.index();
    return index
      .filter(item => item.keywords.includes(q) || item.keywords.split(' ').some(w => w.startsWith(q)))
      .slice(0, 12);
  }
};
