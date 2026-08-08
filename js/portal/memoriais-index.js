/**
 * Memoriais Index — timeline por ano/mês via ContentService
 */
const PortalMemoriaisIndex = {
  async init() {
    const container = document.getElementById('memoriais-timeline');
    if (!container) return;
    const base = document.body.dataset.basePath || '';
    await ContentService.init(base);
    PortalSEO.forMemoriaisIndex();
    this.render(container);
    if (typeof SkeletonUI !== 'undefined') SkeletonUI.doneAll();
    if (typeof PremiumExperience !== 'undefined') PremiumExperience.spotlight();
  },

  render(container) {
    const groups = ContentService.groupMemoriaisByYearMonth();

    if (!groups.length) {
      container.innerHTML = `<div class="timeline-empty"><i class="fas fa-archive"></i><p>Em breve novos memoriais.</p><a href="index.html#agenda" class="btn btn--outline">Ver Agenda</a></div>`;
      return;
    }

    container.innerHTML = groups.map(({ year, meses }) => `
      <section class="timeline-section__year">
        <h2 class="timeline-year">${year}</h2>
        ${meses.map(mes => `
          <div class="timeline-month">
            <h3 class="timeline-month__label">${mes.label.charAt(0).toUpperCase() + mes.label.slice(1)}</h3>
            <div class="timeline">${mes.eventos.map(ev => this.card(ev)).join('')}</div>
          </div>`).join('')}
      </section>`).join('');
  },

  card(ev) {
    return `
      <article class="timeline__item">
        <a href="${ContentService.memorialUrl(ev.slug)}" class="timeline-card">
          <h3 class="timeline-card__city">📍 ${ev.cidade} / ${ev.estado}</h3>
          <p class="timeline-card__church">${ev.titulo}</p>
          ${ev.pastor ? `<p class="timeline-card__pastor">${ev.pastor}</p>` : ''}
          <div class="timeline-card__meta">
            <span><i class="far fa-calendar"></i> ${Ministry.formatDateShort(ev.data)}</span>
            ${ev.galeria?.length ? `<span><i class="fas fa-camera"></i> ${ev.galeria.length} fotos</span>` : ''}
          </div>
          <span class="timeline-card__badge">Ver memorial</span>
        </a>
      </article>`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'memoriais') PortalMemoriaisIndex.init();
});
