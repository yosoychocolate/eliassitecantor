const SkeletonUI = {
  tpl: {
    grid: n => `<div class="skeleton skeleton--grid">${'<div class="skeleton__block"></div>'.repeat(n)}</div>`,
    list: n => `<div class="skeleton skeleton--list">${'<div class="skeleton__block"></div>'.repeat(n)}</div>`,
    hero: () => '<div class="skeleton skeleton--hero"><div class="skeleton__block"></div></div>'
  },

  mount() {
    const ids = {
      'lancamento-featured': 'hero', 'discografia-grid': 'grid', 'videografia-grid': 'grid',
      'agenda-list': 'list', 'ministry-stats': 'grid', 'historia-timeline': 'list',
      'testemunhos-grid': 'grid', 'meus-memoriais': 'grid', 'app': 'hero', 'memoriais-timeline': 'list'
    };
    Object.entries(ids).forEach(([id, type]) => {
      const el = document.getElementById(id);
      if (!el || el.querySelector('.skeleton')) return;
      el.classList.add('skeleton-wrap', 'is-loading');
      el.insertAdjacentHTML('afterbegin', type === 'grid' ? this.tpl.grid(4) : type === 'list' ? this.tpl.list(3) : this.tpl.hero());
    });
  },

  doneAll() {
    document.querySelectorAll('.skeleton-wrap.is-loading').forEach(el => {
      el.classList.remove('is-loading');
      el.classList.add('is-loaded');
      setTimeout(() => el.querySelector('.skeleton')?.remove(), 450);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => SkeletonUI.mount());
