/**
 * Animations — GSAP ScrollTrigger, parallax, counters
 */

function initAllAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  initHeroAnimation();
  initRevealAnimations();
  initParallax();
  initHistoriaReveal();
}

function initHistoriaReveal() {
  gsap.utils.toArray('.historia-item').forEach(item => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 85%' },
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
}

/* ---- Hero entrance ---- */
function initHeroAnimation() {
  gsap.set('.hero__content > *', { opacity: 1, visibility: 'visible' });

  const tl = gsap.timeline({ delay: 0.8 });

  tl.from('.hero__subtitle', {
    autoAlpha: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out',
    immediateRender: false
  })
  .from('.hero__title', {
    autoAlpha: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out',
    immediateRender: false
  }, '-=0.4')
  .from('.hero__tagline', {
    autoAlpha: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out',
    immediateRender: false
  }, '-=0.5')
  .from('.hero__buttons', {
    autoAlpha: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out',
    immediateRender: false
  }, '-=0.4')
  .from('.hero__scroll', {
    autoAlpha: 0,
    duration: 0.6,
    ease: 'power2.out',
    immediateRender: false
  }, '-=0.2');
}

/* ---- Scroll reveal ---- */
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade, .reveal-scale');

  reveals.forEach((el, index) => {
    if (el.closest('.hero')) return;

    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: 0.8,
      delay: (index % 3) * 0.1,
      ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.section__title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 80%'
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out'
    });
  });
}

/* ---- Parallax ---- */
function initParallax() {
  const activeSlide = document.querySelector('#hero-slides .hero-slide.active');
  if (activeSlide) {
    gsap.to(activeSlide, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: 80,
      ease: 'none'
    });
  }

  const sobreImage = document.querySelector('.sobre__image-frame');
  if (sobreImage) {
    gsap.to(sobreImage, {
      scrollTrigger: {
        trigger: '.sobre',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      },
      y: -40,
      ease: 'none'
    });
  }

  gsap.utils.toArray('.hero__glow').forEach((glow, i) => {
    gsap.to(glow, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: i === 0 ? 80 : -80,
      opacity: 0,
      ease: 'none'
    });
  });
}

/* ---- Counter animation ---- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat__number');

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count, 10);
    if (isNaN(target)) return;

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            counter.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });
}
