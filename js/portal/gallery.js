/**
 * Gallery — componente único com lazy load + AVIF/WebP
 */
const GALLERY_FILTERS = ['Todos', 'Louvor', 'Pregação', 'Coral', 'Igreja', 'Comunhão', 'Infantil'];

const PortalGallery = {
  render(container, galeria, options = {}) {
    if (!container || !galeria?.length) {
      if (container) container.innerHTML = '<p class="gallery-empty">Galeria em breve.</p>';
      return;
    }

    const filterId = options.filterId || 'gallery-filters';
    const gridId = options.gridId || 'gallery-grid';
    const total = options.totalArquivo;

    container.innerHTML = `
      <p class="event-gallery-count">
        <strong>${galeria.length} fotos</strong>${total ? ` selecionadas de ${total} no arquivo` : ''} — clique para tela cheia
      </p>
      <div class="galeria__filters" id="${filterId}"></div>
      <div class="galeria__grid" id="${gridId}"></div>
    `;

    document.getElementById(filterId).innerHTML = GALLERY_FILTERS.map((f, i) =>
      `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${f === 'Todos' ? 'all' : f}">${f}</button>`
    ).join('');

    const grid = document.getElementById(gridId);
    const fragment = document.createDocumentFragment();
    const lightboxGroup = options.lightboxGroup || 'galeria';

    galeria.forEach((item, i) => {
      const thumb = item.imagem;
      const full = item.imagemFull || item.imagem;
      const link = document.createElement('a');
      link.href = asset(full);
      link.className = 'galeria__item galeria__item--loading';
      link.dataset.category = item.categoria;
      link.dataset.glightbox = lightboxGroup;
      link.dataset.title = item.titulo || '';
      link.dataset.description = item.categoria || '';

      const picture = ImageService.createPicture(thumb, {
        alt: item.titulo || item.categoria,
        loading: i < 4 ? 'eager' : 'lazy'
      });
      const img = picture.querySelector('img');
      if (i >= 4) {
        img.removeAttribute('src');
        img.dataset.lazySrc = asset(ImageService.variants(thumb).jpg);
        picture.querySelectorAll('source').forEach(s => s.remove());
      }
      img.addEventListener('load', () => link.classList.remove('galeria__item--loading'), { once: true });

      link.appendChild(picture);
      const overlay = document.createElement('div');
      overlay.className = 'galeria__item-overlay';
      overlay.innerHTML = '<i class="fas fa-search-plus"></i>';
      link.appendChild(overlay);
      fragment.appendChild(link);
    });

    grid.appendChild(fragment);
    ImageService.lazyObserve(grid);
    this.initFilters(filterId, gridId);
    this.initLightbox(lightboxGroup);
  },

  initFilters(filterId, gridId) {
    document.getElementById(filterId)?.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        document.querySelectorAll(`#${filterId} .filter-btn`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll(`#${gridId} .galeria__item`).forEach(item => {
          item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
        });
      });
    });
  },

  initLightbox(group) {
    const run = () => {
      if (typeof GLightbox === 'undefined') return;

      const links = document.querySelectorAll(`[data-glightbox="${group}"]`);
      const total = links.length;
      if (!total) return;

      let counterEl = document.querySelector('.glightbox-counter-premium');

      const lightbox = GLightbox({
        selector: `[data-glightbox="${group}"]`,
        touchNavigation: true,
        keyboardNavigation: true,
        loop: true,
        zoomable: true,
        draggable: true,
        openEffect: 'fade',
        closeEffect: 'fade',
        slideEffect: 'slide'
      });

      const updateCounter = (index = 0) => {
        if (!counterEl) {
          counterEl = document.createElement('div');
          counterEl.className = 'glightbox-counter-premium';
          counterEl.setAttribute('aria-live', 'polite');
          document.body.appendChild(counterEl);
        }
        counterEl.textContent = `${index + 1} / ${total}`;
      };

      const removeCounter = () => counterEl?.remove();

      lightbox.on('open', () => updateCounter(lightbox.index || 0));
      lightbox.on('slide_changed', ({ current }) => updateCounter(current?.index ?? 0));
      lightbox.on('close', removeCounter);
    };

    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 });
    else setTimeout(run, 400);
  }
};
