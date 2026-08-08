const PremiumExperience = {
  init() {
    this.hero();
    this.scrollProgress();
    this.pageTransition();
    this.spotlight();
    this.glowButtons();
  },

  hero() {
    const hero = document.querySelector('.hero--dynamic');
    if (!hero) return;
    hero.classList.add('hero--cinematic');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wrap = hero.querySelector('.hero__video-wrap');
    if (!wrap || wrap.querySelector('.hero__particles')) return;

    const p = document.createElement('div');
    p.className = 'hero__particles';
    p.setAttribute('aria-hidden', 'true');
    p.innerHTML = Array.from({ length: 16 }, () => {
      const s = 1 + Math.random() * 2;
      return `<span class="hero__particle" style="left:${10 + Math.random() * 80}%;width:${s}px;height:${s}px;animation-duration:${12 + Math.random() * 8}s;animation-delay:${Math.random() * 12}s"></span>`;
    }).join('');
    wrap.prepend(p);
  },

  scrollProgress() {
    if (document.getElementById('scroll-progress')) return;
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.className = 'scroll-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Progresso da leitura');
    document.body.prepend(bar);

    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  },

  pageTransition() {
    document.body.classList.add('page-enter');
    document.querySelectorAll('a[href$=".html"]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || a.target === '_blank') return;
      a.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || href.startsWith('#')) return;
        e.preventDefault();
        document.body.classList.add('page-leave');
        setTimeout(() => { location.href = href; }, 260);
      });
    });
  },

  spotlight() {
    document.querySelectorAll('.disc-card, .videoteca-card, .video-card-dynamic, .testemunho-card, .timeline-card').forEach(card => {
      card.classList.add('card-spotlight');
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--spot-y', (e.clientY - r.top) + 'px');
      });
    });
  },

  glowButtons() {
    document.querySelectorAll('.hero .btn--primary').forEach(b => b.classList.add('btn--glow'));
  }
};

document.addEventListener('DOMContentLoaded', () => PremiumExperience.init());
