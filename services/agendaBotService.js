/**
 * AgendaBotService — datas livres a partir de disponibilidade.json + eventos.json
 * Não confirma reservas; apenas filtra o calendário e monta mensagem WhatsApp.
 */
const AgendaBotService = {
  DISCLAIMER:
    'As datas exibidas representam disponibilidade no calendário do portal e estão sujeitas à confirmação pelo Ministério Elias Silva. A reserva somente é efetivada após confirmação da equipe.',

  occupiedDateSet(eventos = []) {
    const today = Ministry.today();
    const set = new Set();

    eventos.forEach(ev => {
      if (!ev?.data) return;
      if (ev.disponivel === true && !ev.status && !ev.cidade) return;

      const d = Ministry.parseDate(ev.data);
      if (!d || d < today) return;
      set.add(ev.data.slice(0, 10));
    });

    return set;
  },

  availableSlots(eventos = [], slots = []) {
    const occupied = this.occupiedDateSet(eventos);
    const today = Ministry.today();

    return slots
      .filter(slot => slot?.data && slot.disponivel !== false)
      .filter(slot => {
        const d = Ministry.parseDate(slot.data);
        return d && d >= today;
      })
      .filter(slot => !occupied.has(slot.data.slice(0, 10)))
      .sort((a, b) => a.data.localeCompare(b.data));
  },

  groupByMonth(slots = []) {
    const groups = {};

    slots.forEach(slot => {
      const d = Ministry.parseDate(slot.data);
      if (!d) return;

      const sortKey = slot.data.slice(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const key = sortKey;

      if (!groups[key]) {
        groups[key] = { label, sortKey, items: [] };
      }
      groups[key].items.push(slot);
    });

    return Object.values(groups).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  },

  formatDayShort(dateStr) {
    const d = Ministry.parseDate(dateStr);
    if (!d) return '—';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  },

  formatDateLong(dateStr) {
    return Ministry.formatDate(dateStr);
  },

  buildWhatsAppMessage(form, dateStr) {
    const lines = [
      'Olá!',
      '',
      'Gostaria de solicitar uma ministração.',
      '',
      'Data escolhida:',
      this.formatDayShort(dateStr) + '/' + dateStr.slice(0, 4),
      '',
      'No calendário do portal essa data aparecia como disponível.',
      '',
      `Igreja:\n${form.igreja || '—'}`,
      '',
      `Cidade:\n${form.cidade || '—'}`,
      '',
      `Estado:\n${form.estado || '—'}`,
      '',
      `Pastor:\n${form.pastor || '—'}`,
      '',
      `Telefone:\n${form.telefone || '—'}`
    ];

    if (form.observacoes?.trim()) {
      lines.push('', `Observações:\n${form.observacoes.trim()}`);
    }

    lines.push('', 'Aguardo confirmação.', '', 'Muito obrigado.');
    return lines.join('\n');
  },

  whatsAppUrl(phone, message) {
    const n = String(phone || '').replace(/\D/g, '');
    return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
  }
};
