/**
 * ImageService — AVIF → WebP → JPG fallback
 */
const ImageService = {
  variants(src) {
    if (!src || src.startsWith('http')) {
      return { avif: src, webp: src, jpg: src };
    }
    const base = src.replace(/\.(jpe?g|png|webp|avif)$/i, '');
    return {
      avif: `${base}.avif`,
      webp: `${base}.webp`,
      jpg: /\.(jpe?g|png)$/i.test(src) ? src : `${base}.jpg`
    };
  },

  createPicture(src, { alt = '', className = '', loading = 'lazy', sizes = '100vw' } = {}) {
    const v = this.variants(src);
    const picture = document.createElement('picture');
    if (className) picture.className = className;

    const avif = document.createElement('source');
    avif.type = 'image/avif';
    avif.srcset = asset(v.avif);

    const webp = document.createElement('source');
    webp.type = 'image/webp';
    webp.srcset = asset(v.webp);

    const img = document.createElement('img');
    img.src = asset(v.jpg);
    img.alt = alt;
    img.loading = loading;
    img.decoding = 'async';
    img.dataset.srcAvif = asset(v.avif);
    img.dataset.srcWebp = asset(v.webp);

    img.addEventListener('error', function fallback() {
      if (this.dataset.fallback === '1') return;
      this.dataset.fallback = '1';
      this.src = asset(src);
    }, { once: true });

    picture.append(avif, webp, img);
    return picture;
  },

  lazyObserve(container) {
    const imgs = container.querySelectorAll('img[data-lazy-src]');
    if (!imgs.length) return;

    const load = (img) => {
      img.src = img.dataset.lazySrc;
      img.removeAttribute('data-lazy-src');
      if (img.dataset.lazySrcset) {
        img.srcset = img.dataset.lazySrcset;
        img.removeAttribute('data-lazy-srcset');
      }
    };

    if (!('IntersectionObserver' in window)) {
      imgs.forEach(load);
      return;
    }

    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        o.unobserve(entry.target);
      });
    }, { rootMargin: '250px', threshold: 0.01 });

    imgs.forEach(img => obs.observe(img));
  }
};
