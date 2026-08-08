/**
 * BackgroundMusic — música ambiente (inicia por padrão; visitante pode pausar)
 */
const BackgroundMusic = {
  audio: null,
  _btn: null,
  _enabled: false,
  _config: null,
  _interactionBound: false,
  _MUTED_KEY: 'bg-music-muted',

  init() {
    if (location.protocol === 'file:') return;

    this._config = {
      src: 'assets/music/teu-amor-e-infinito.mp3',
      titulo: 'Teu Amor É Infinito',
      artista: 'Elias & Léia Silva',
      volume: 0.22,
      loop: true,
      autostart: true
    };

    const snap = typeof ContentService !== 'undefined' ? ContentService.getSnapshot()?.config : null;
    if (snap?.musicaFundo) {
      this._config = { ...this._config, ...snap.musicaFundo };
    }

    this.audio = new Audio(this._config.src);
    this.audio.loop = this._config.loop !== false;
    this.audio.volume = this._config.volume ?? 0.22;
    this.audio.preload = 'auto';

    this._mountToggle();
    this._bindNowPlayingPause();
    this._bindVideoModalPause();

    if (this._config.autostart !== false && !this._isMuted()) {
      this._tryAutostart();
    } else if (!this._isMuted()) {
      this._syncButton(false);
    }
  },

  _isMuted() {
    return localStorage.getItem(this._MUTED_KEY) === '1';
  },

  _mountToggle() {
    if (document.getElementById('bg-music-toggle')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'bg-music-toggle';
    btn.className = 'bg-music-toggle';
    btn.setAttribute('aria-label', 'Música ambiente');
    btn.setAttribute('aria-pressed', 'false');
    btn.title = `${this._config.titulo} — ${this._config.artista}`;
    btn.innerHTML = '<i class="fas fa-music" aria-hidden="true"></i><span class="bg-music-toggle__label">Música</span>';

    btn.addEventListener('click', e => {
      e.stopPropagation();
      this.toggle();
    });
    document.body.appendChild(btn);
    this._btn = btn;
  },

  _tryAutostart() {
    if (!this.audio || this._isMuted()) return;

    this.audio.play().then(() => {
      this._enabled = true;
      this._syncButton(true);
      this._unbindAutostartOnInteraction();
    }).catch(() => {
      this._bindAutostartOnInteraction();
    });
  },

  _bindAutostartOnInteraction() {
    if (this._interactionBound || this._isMuted()) return;
    this._interactionBound = true;

    const start = (e) => {
      if (e?.target?.closest('#agenda-bot, #bg-music-toggle, .agenda-bot__input')) return;
      if (this._isMuted() || (this.audio && !this.audio.paused)) {
        this._unbindAutostartOnInteraction();
        return;
      }
      this.play(true);
    };

    this._interactionStart = start;
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => {
      document.addEventListener(ev, start, { once: false, passive: true });
    });
  },

  _unbindAutostartOnInteraction() {
    if (!this._interactionStart) return;
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => {
      document.removeEventListener(ev, this._interactionStart);
    });
    this._interactionBound = false;
    this._interactionStart = null;
  },

  startOnGesture() {
    if (this._isMuted()) return;
    this.play(true);
  },

  play(fromAutostart = false) {
    if (!this.audio) return;

    this.audio.play().then(() => {
      this._enabled = true;
      localStorage.removeItem(this._MUTED_KEY);
      this._syncButton(true);
      if (fromAutostart) this._unbindAutostartOnInteraction();
    }).catch(() => {
      if (!fromAutostart) this._bindAutostartOnInteraction();
    });
  },

  pause(userAction = true) {
    if (!this.audio) return;
    this.audio.pause();
    this._enabled = false;
    if (userAction) localStorage.setItem(this._MUTED_KEY, '1');
    this._syncButton(false);
  },

  toggle() {
    if (this._enabled && !this.audio.paused) {
      this.pause(true);
    } else {
      this.play();
    }
  },

  _syncButton(on) {
    if (!this._btn) return;
    this._btn.classList.toggle('is-playing', on);
    this._btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    this._btn.setAttribute('aria-label', on ? 'Pausar música ambiente' : 'Ativar música ambiente');
  },

  _bindNowPlayingPause() {
    document.addEventListener('click', e => {
      const playBtn = e.target.closest('[data-play-audio]');
      if (!playBtn || !this.audio) return;
      this.audio.pause();
      this._enabled = false;
      this._syncButton(false);
    });
  },

  _bindVideoModalPause() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;

    const observer = new MutationObserver(() => {
      if (modal.classList.contains('active') && this.audio && !this.audio.paused) {
        this.audio.pause();
        this._wasPlaying = true;
        this._syncButton(false);
      } else if (this._wasPlaying && !this._isMuted()) {
        this._wasPlaying = false;
        this.play();
      }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  BackgroundMusic.init();
});
