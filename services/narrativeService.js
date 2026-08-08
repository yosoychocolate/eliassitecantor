/**
 * NarrativeService — timeline unificada (biografia + discografia + memoriais)
 */
const NarrativeService = {
  build(data) {
    const items = [];

    (data.biografia || []).forEach(m => {
      items.push({
        ano: m.ano,
        mes: m.mes || 0,
        dia: m.dia || 0,
        titulo: m.titulo,
        descricao: m.descricao,
        tipo: m.tipo || 'biografia',
        icone: m.icone || 'fa-book'
      });
    });

    (data.timeline || []).forEach(m => {
      items.push({
        ano: m.ano,
        mes: 0,
        dia: 0,
        titulo: m.titulo,
        descricao: m.descricao,
        tipo: 'marco',
        icone: 'fa-star'
      });
    });

    (data.musicas || []).forEach(m => {
      const d = m.data ? new Date(m.data + 'T12:00:00') : null;
      items.push({
        ano: d ? d.getFullYear() : m.ano,
        mes: d ? d.getMonth() : 0,
        dia: d ? d.getDate() : 0,
        titulo: m.titulo,
        descricao: `${m.tipo === 'album' ? 'Álbum' : 'Single'} · ${m.ano}`,
        tipo: 'discografia',
        icone: 'fa-compact-disc',
        link: '#discografia'
      });
    });

    (data.eventos || []).filter(ev => Ministry.isMemorial(ev)).forEach(ev => {
      const d = Ministry.parseDate(ev.data);
      items.push({
        ano: d.getFullYear(),
        mes: d.getMonth(),
        dia: d.getDate(),
        titulo: ev.cidade,
        descricao: ev.titulo,
        sub: Ministry.formatDate(ev.data),
        tipo: 'memorial',
        icone: 'fa-church',
        slug: ev.slug,
        link: ContentService.memorialUrl(ev.slug)
      });
    });

    return items.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      if (a.mes !== b.mes) return b.mes - a.mes;
      return b.dia - a.dia;
    });
  },

  groupByYear(items) {
    const map = {};
    items.forEach(item => {
      if (!map[item.ano]) map[item.ano] = [];
      map[item.ano].push(item);
    });
    return Object.keys(map)
      .sort((a, b) => Number(b) - Number(a))
      .map(year => ({ year, items: map[year] }));
  }
};
