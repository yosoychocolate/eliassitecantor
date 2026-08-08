/**
 * Main — Navigation, scroll, modal, forms, Swiper
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavigation();
  initScrollEffects();
  initVideoModal();
  initContactForm();
  initSwipers();
  initActiveNavLink();
  initImageFallbacks();
  initPWA();
});

function initPWA() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

/* ---- Preloader ---- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const unlock = () => {
    preloader.classList.add('hidden');
    if (!document.querySelector('.video-modal.active')) {
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
      document.body.style.overflow = '';
    }
  };

  window.addEventListener('load', () => setTimeout(unlock, 800));
  setTimeout(unlock, 5000);
  document.body.style.overflow = 'hidden';
}

/* ---- Navigation ---- */
function initNavigation() {
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  const navClose = document.getElementById('nav-close');
  const navLinks = document.querySelectorAll('.nav__link');
  const header = document.getElementById('header');

  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function openMenu() {
    navMenu.classList.add('show');
    overlay.classList.add('active');
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
  }

  function closeMenu() {
    navMenu.classList.remove('show');
    overlay.classList.remove('active');
    if (!document.querySelector('.video-modal.active')) {
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
    }
  }

  navToggle?.addEventListener('click', openMenu);
  navClose?.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeMenu();
    });
  });

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ---- Scroll Effects ---- */
function initScrollEffects() {
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 500);
  });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- Active Nav Link ---- */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );

  sections.forEach(section => observer.observe(section));
}

/* ---- Video Modal ---- */
function initVideoModal() {
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      const videoId = card.dataset.video;
      if (videoId && typeof openYoutube === 'function') {
        openYoutube(videoId, { title: card.dataset.title || '' });
      }
    });
  });
}

/* ---- Contact Form ---- */
const STORAGE_KEY_CONTATO = 'elias-silva-contato';

function initContactForm() {
  const form = document.getElementById('contato-form');
  if (!form) return;

  const fields = ['nome', 'email', 'telefone', 'mensagem'];
  restoreFormDraft(form, fields);
  bindFormDraftSave(form, fields);

  form.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData(form);
    const nome = formData.get('nome');
    const email = formData.get('email');
    const telefone = formData.get('telefone');
    const mensagem = formData.get('mensagem');

    const whatsappMsg = encodeURIComponent(
      `Olá! Meu nome é ${nome}.\nEmail: ${email}\nTelefone: ${telefone || 'Não informado'}\n\n${mensagem}`
    );

    localStorage.removeItem(STORAGE_KEY_CONTATO);

    form.innerHTML = `
      <div class="form__success">
        <i class="fas fa-check-circle"></i>
        <h3>Mensagem enviada!</h3>
        <p>Obrigado pelo contato, ${nome}. Responderemos em breve.</p>
      </div>
    `;

    setTimeout(() => {
      window.open(`https://wa.me/${Portal?.config?.whatsapp || '5511970472292'}?text=${whatsappMsg}`, '_blank');
    }, 1500);
  });

  const telefoneInput = document.getElementById('telefone');
  telefoneInput?.addEventListener('input', e => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, '($1');
    }

    e.target.value = value;
    saveFormDraft(form, fields);
  });
}

function saveFormDraft(form, fields) {
  const draft = {};
  fields.forEach(name => {
    const input = form.querySelector(`[name="${name}"]`);
    if (input) draft[name] = input.value;
  });
  localStorage.setItem(STORAGE_KEY_CONTATO, JSON.stringify(draft));
}

function restoreFormDraft(form, fields) {
  const saved = localStorage.getItem(STORAGE_KEY_CONTATO);
  if (!saved) return;

  try {
    const draft = JSON.parse(saved);
    fields.forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input && draft[name]) input.value = draft[name];
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY_CONTATO);
  }
}

function bindFormDraftSave(form, fields) {
  fields.forEach(name => {
    const input = form.querySelector(`[name="${name}"]`);
    input?.addEventListener('input', () => saveFormDraft(form, fields));
  });
}

/* ---- Swiper Carousels ---- */
function initSwipers() {
  if (typeof Swiper === 'undefined') return;

  document.querySelectorAll('.noticias-swiper').forEach(el => {
    new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 24,
    grabCursor: true,
    pagination: {
      el: '.noticias-swiper .swiper-pagination',
      clickable: true
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
    });
  });

  document.querySelectorAll('.depoimentos-swiper').forEach(el => {
    new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 24,
    grabCursor: true,
    pagination: {
      el: '.depoimentos-swiper .swiper-pagination',
      clickable: true
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
    });
  });
}

/* ---- Image Fallbacks (placeholder quando imagem local não existe) ---- */
function initImageFallbacks() {
  const placeholders = {
    'hero-poster': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80',
    'sobre-cantor': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80',
    'album-coracao-livre': 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80',
    'album-noite-estrelada': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
    'album-alma-brasileira': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
    'video-coracao-livre': 'https://images.unsplash.com/photo-1598488035139-bdbb2231d077?w=800&q=80',
    'video-noite-estrelada': 'https://images.unsplash.com/photo-1571330737116-fde9ada4e088?w=800&q=80',
    'video-alma-brasileira': 'https://images.unsplash.com/photo-1514320291840-75581eae9fdb?w=800&q=80',
    'video-ao-vivo': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    'show-1': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80',
    'show-2': 'https://images.unsplash.com/photo-1459749411175-04bf52929825?w=600&q=80',
    'show-3': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
    'bastidores-1': 'https://images.unsplash.com/photo-1598387181032-a310d89d5ece?w=600&q=80',
    'bastidores-2': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
    'ensaios-1': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80',
    'eventos-1': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    'familia-1': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'
  };

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function handler() {
      const filename = this.src.split('/').pop()?.replace('.jpg', '').replace('.png', '');
      const key = filename?.includes('-') ? filename.split('-').slice(-2).join('-') : filename;

      for (const [name, url] of Object.entries(placeholders)) {
        if (this.src.includes(name) || key === name) {
          this.src = url;
          this.removeEventListener('error', handler);
          break;
        }
      }
    }, { once: false });
  });

  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    const hideVideo = () => { heroVideo.style.display = 'none'; };
    heroVideo.addEventListener('error', hideVideo);
    if (heroVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      hideVideo();
    }
  }
}
