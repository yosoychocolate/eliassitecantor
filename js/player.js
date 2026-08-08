/**
 * Now Playing — Player fixo estilo Spotify
 */
const NowPlaying = {
  audio: null,
  currentSrc: null,

  init() {
    this.bar = document.getElementById('now-playing');
    this.audio = new Audio();
    this.audio.addEventListener('ended', () => this.setPlaying(false));

    if (!this.bar) return;

    this.titleEl = this.bar.querySelector('.now-playing__title');
    this.btnPlay = this.bar.querySelector('.now-playing__play');
    this.btnPrev = this.bar.querySelector('.now-playing__prev');
    this.btnNext = this.bar.querySelector('.now-playing__next');

    this.btnPlay?.addEventListener('click', () => this.toggle());
    this.btnPrev?.addEventListener('click', () => this.skip(-1));
    this.btnNext?.addEventListener('click', () => this.skip(1));
  },

  play(src, title) {
    if (!src || !this.audio) return;

    if (this.currentSrc === src && !this.audio.paused) {
      this.toggle();
      return;
    }

    this.currentSrc = src;
    this.audio.src = src;

    if (this.bar) {
      this.titleEl.textContent = title || 'Faixa';
      this.bar.classList.add('visible');
      document.body.classList.add('has-now-playing');
    }

    this.audio.play().catch(() => this.demoMode(title));
    this.setPlaying(true);
  },

  toggle() {
    if (!this.audio.src) return;
    if (this.audio.paused) {
      this.audio.play().catch(() => {});
      this.setPlaying(true);
    } else {
      this.audio.pause();
      this.setPlaying(false);
    }
  },

  setPlaying(playing) {
    const icon = this.btnPlay?.querySelector('i');
    if (icon) icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
  },

  skip(dir) {
    if (typeof SiteData === 'undefined' || !SiteData.discografia.length) return;
    const tracks = SiteData.discografia.filter(d => d.audio);
    if (!tracks.length) return;

    let idx = tracks.findIndex(t => t.audio === this.currentSrc);
    idx = (idx + dir + tracks.length) % tracks.length;
    this.play(tracks[idx].audio, tracks[idx].titulo);
  },

  demoMode(title) {
    if (this.titleEl) this.titleEl.textContent = title + ' (demo)';
    this.setPlaying(true);
    setTimeout(() => this.setPlaying(false), 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => NowPlaying.init());
