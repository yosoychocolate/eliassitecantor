/**
 * FavoritesService — memoriais favoritos (LocalStorage)
 */
const FavoritesService = {
  KEY: 'ministerio_favoritos',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch {
      return [];
    }
  },

  toggle(slug) {
    const list = this.getAll();
    const i = list.indexOf(slug);
    if (i >= 0) list.splice(i, 1);
    else list.push(slug);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return list.includes(slug);
  },

  has(slug) {
    return this.getAll().includes(slug);
  },

  bindButton(btn, slug) {
    if (!btn) return;
    const update = () => {
      btn.classList.toggle('active', this.has(slug));
    };
    update();
    btn.addEventListener('click', () => {
      this.toggle(slug);
      update();
    });
  },

  async renderSection(container) {
    if (!container) return;
    await ContentService._ensure();
    const slugs = this.getAll();
    if (!slugs.length) {
      container.innerHTML = '<p class="favorites-empty">Nenhum memorial favorito ainda. Clique no ❤ em um memorial.</p>';
      return;
    }
    const eventos = ContentService.getSnapshot().eventos;
    container.innerHTML = `<div class="favorites-grid">${slugs.map(slug => {
      const ev = eventos.find(e => e.slug === slug);
      if (!ev) return '';
      return `
        <a href="${ContentService.memorialUrl(slug)}" class="favorites-card">
          <strong>${ev.cidade} / ${ev.estado}</strong>
          <span>${ev.titulo}</span>
          <small>${Ministry.formatDateShort(ev.data)}</small>
        </a>`;
    }).filter(Boolean).join('')}</div>`;
  }
};
