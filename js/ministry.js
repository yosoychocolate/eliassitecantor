/**
 * Ministry — Helpers compartilhados: classificação agenda/memorial, URLs, datas
 */
const Ministry = {
  CATEGORY_GROUPS: {
    louvor: { label: 'Louvor', match: ['louvor', 'louvor-especial'] },
    ministeracao: { label: 'Ministração', match: ['ministeracao', 'palavra-adoracao'] },
    coral: { label: 'Coral', match: ['coral'] },
    igreja: { label: 'Igreja', match: ['louvor-congregacional', 'igreja'] },
    infantil: { label: 'Ministério Infantil', match: ['infantil'] },
    comunhao: { label: 'Comunhão', match: ['bastidores', 'comunhao'] }
  },

  today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },

  parseDate(dateStr) {
    if (!dateStr) return null;
    return new Date(`${dateStr}T12:00:00`);
  },

  /** memorial = realizado ou data já passou */
  isMemorial(ev) {
    if (ev.realizado === true) return true;
    if (ev.realizado === false) return false;
    const d = this.parseDate(ev.data);
    return d ? d < this.today() : false;
  },

  isAgenda(ev) {
    return !this.isMemorial(ev);
  },

  memorialUrl(ev) {
    if (!ev.slug) return null;
    return `memorial.html?evento=${ev.slug}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return 'Em breve';
    return this.parseDate(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  },

  formatDateShort(dateStr) {
    if (!dateStr) return 'Em breve';
    return this.parseDate(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  weekdayShort(dateStr) {
    if (!dateStr) return '';
    return this.parseDate(dateStr)
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .replace(/\.$/, '')
      .toLowerCase();
  },

  agendaDateParts(dateStr) {
    const d = dateStr ? this.parseDate(dateStr) : null;
    if (!d) return { day: '—', weekday: '', month: 'breve' };
    return {
      day: String(d.getDate()).padStart(2, '0'),
      weekday: this.weekdayShort(dateStr),
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace(/\.$/, '')
    };
  },

  telefoneExibicao(config = {}) {
    if (config.telefoneExibicao) return config.telefoneExibicao;
    const digits = String(config.whatsapp || '').replace(/\D/g, '');
    if (digits.length >= 12 && digits.startsWith('55')) {
      return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    return digits;
  },

  whatsappHref(config = {}, message = '') {
    const phone = String(config.whatsapp || '5511970472292').replace(/\D/g, '');
    const base = `https://wa.me/${phone}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  },

  groupByYear(eventos) {
    const map = {};
    eventos.forEach(ev => {
      const year = ev.data ? ev.data.slice(0, 4) : 'Em breve';
      if (!map[year]) map[year] = [];
      map[year].push(ev);
    });
    return Object.keys(map)
      .sort((a, b) => {
        if (a === 'Em breve') return 1;
        if (b === 'Em breve') return -1;
        return Number(b) - Number(a);
      })
      .map(year => ({
        year,
        eventos: map[year].sort((a, b) => {
          if (!a.data) return 1;
          if (!b.data) return -1;
          return b.data.localeCompare(a.data);
        })
      }));
  },

  galleryGroup(category) {
    for (const [group, cfg] of Object.entries(this.CATEGORY_GROUPS)) {
      if (cfg.match.includes(category)) return group;
    }
    return category;
  }
};
