/**
 * AgendaBot — assistente virtual para solicitar ministração (sem confirmação automática)
 */
const AgendaBot = {
  _root: null,
  _messages: null,
  _actions: null,
  _inputWrap: null,
  _input: null,
  _phone: '5511970472292',
  _form: {},
  _selectedDate: null,
  _step: null,

  async init() {
    if (location.protocol === 'file:' || document.getElementById('agenda-bot')) return;

    try {
      await ContentService.init(document.body.dataset.basePath || '');
    } catch {
      return;
    }

    this._phone = ContentService.getSnapshot()?.config?.whatsapp || this._phone;
    this._mount();
  },

  _mount() {
    const root = document.createElement('div');
    root.id = 'agenda-bot';
    root.className = 'agenda-bot';
    root.innerHTML = `
      <button type="button" class="agenda-bot__launcher" aria-expanded="false" aria-controls="agenda-bot-panel">
        <span class="agenda-bot__launcher-icon" aria-hidden="true">💬</span>
        <span>Agendar Ministração</span>
      </button>
      <div class="agenda-bot__panel" id="agenda-bot-panel" role="dialog" aria-label="Assistente de agenda" hidden>
        <header class="agenda-bot__head">
          <div class="agenda-bot__head-info">
            <strong>Ministério Elias Silva</strong>
            <span>Assistente de convites</span>
          </div>
          <button type="button" class="agenda-bot__close" aria-label="Fechar"><i class="fas fa-times"></i></button>
        </header>
        <div class="agenda-bot__body">
          <div class="agenda-bot__messages" aria-live="polite"></div>
          <div class="agenda-bot__actions"></div>
        </div>
        <div class="agenda-bot__input-wrap" hidden>
          <input type="text" class="agenda-bot__input" autocomplete="off">
          <button type="button" class="agenda-bot__send" aria-label="Enviar"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>`;

    document.body.appendChild(root);

    this._root = root;
    this._body = root.querySelector('.agenda-bot__body');
    this._messages = root.querySelector('.agenda-bot__messages');
    this._actions = root.querySelector('.agenda-bot__actions');
    this._inputWrap = root.querySelector('.agenda-bot__input-wrap');
    this._input = root.querySelector('.agenda-bot__input');

    root.querySelector('.agenda-bot__launcher').addEventListener('click', () => this.open());
    root.querySelector('.agenda-bot__close').addEventListener('click', () => this.close());
    root.querySelector('.agenda-bot__send').addEventListener('click', e => {
      e.stopPropagation();
      this._submitInput();
    });
    this._input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._submitInput();
      }
    });
    this._input.addEventListener('focus', () => {
      setTimeout(() => this._inputWrap.scrollIntoView({ block: 'end' }), 300);
    });
    root.addEventListener('click', e => e.stopPropagation());
  },

  open() {
    if (!this._root) return;
    this._root.classList.add('is-open');
    document.body.classList.add('agenda-bot-open');
    this._root.querySelector('.agenda-bot__panel').hidden = false;
    this._root.querySelector('.agenda-bot__launcher').setAttribute('aria-expanded', 'true');

    if (!this._step) {
      this._reset();
      this._showWelcome();
    }

    this._scroll();
  },

  close() {
    if (!this._root) return;
    this._root.classList.remove('is-open');
    document.body.classList.remove('agenda-bot-open');
    this._root.querySelector('.agenda-bot__panel').hidden = true;
    this._root.querySelector('.agenda-bot__launcher').setAttribute('aria-expanded', 'false');
    this._hideInput();
  },

  _reset() {
    this._form = {};
    this._selectedDate = null;
    this._step = 'welcome';
    this._messages.innerHTML = '';
    this._actions.innerHTML = '';
  },

  _bot(html, extraClass = '') {
    const el = document.createElement('div');
    el.className = `agenda-bot__bubble agenda-bot__bubble--bot${extraClass ? ` ${extraClass}` : ''}`;
    el.innerHTML = html;
    this._messages.appendChild(el);
    this._scroll();
  },

  _user(text) {
    const el = document.createElement('div');
    el.className = 'agenda-bot__bubble agenda-bot__bubble--user';
    el.textContent = text;
    this._messages.appendChild(el);
    this._scroll();
  },

  _scroll() {
    requestAnimationFrame(() => {
      if (this._body) {
        this._body.scrollTop = this._body.scrollHeight;
      }
    });
  },

  _clearActions() {
    this._actions.innerHTML = '';
  },

  _actionsButtons(buttons) {
    this._clearActions();
    buttons.forEach(({ label, action, primary, date }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'agenda-bot__btn' +
        (primary ? ' agenda-bot__btn--primary' : '') +
        (date ? ' agenda-bot__btn--date' : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        this._user(label.replace(/^□\s*/, ''));
        action();
      });
      this._actions.appendChild(btn);
    });
  },

  _hideInput() {
    this._inputWrap.hidden = true;
    this._input.value = '';
  },

  _askInput(placeholder, step) {
    this._step = step;
    this._input.placeholder = placeholder;
    this._inputWrap.hidden = false;
    this._clearActions();
    setTimeout(() => {
      this._input.focus({ preventScroll: true });
      this._inputWrap.scrollIntoView({ block: 'end', behavior: 'smooth' });
      this._scroll();
    }, 80);
  },

  _submitInput() {
    const val = this._input.value.trim();
    if (!val) return;

    this._user(val);
    this._hideInput();

    const handlers = {
      'form-igreja': () => { this._form.igreja = val; this._askCidade(); },
      'form-cidade': () => { this._form.cidade = val; this._askEstado(); },
      'form-estado': () => { this._form.estado = val; this._askPastor(); },
      'form-pastor': () => { this._form.pastor = val; this._askTelefone(); },
      'form-telefone': () => { this._form.telefone = val; this._askObservacoes(); },
      'form-obs': () => { this._form.observacoes = val; this._finish(); }
    };

    handlers[this._step]?.();
  },

  _showWelcome() {
    this._bot(`<p>👋 Olá! Seja bem-vindo ao <strong>Portal Oficial do Ministério Elias Silva</strong>.</p><p>Como posso ajudar?</p>`);
    this._actionsButtons([
      { label: '📅 Ver datas disponíveis', action: () => this._showDates() },
      { label: '🎵 Conhecer o ministério', action: () => this._showMinistry() },
      { label: '📞 Falar diretamente', action: () => this._directContact(), primary: false }
    ]);
  },

  _showMinistry() {
    this._bot(`<p>O Ministério Elias Silva leva o Evangelho através da música há mais de <strong>40 anos</strong>, com Elias Ferreira da Silva e, em muitas agendas, a dupla <strong>Elias &amp; Léia Silva</strong>.</p><p>Explore memoriais, discografia e videoteca no portal.</p>`);
    this._actionsButtons([
      { label: '📅 Ver datas disponíveis', action: () => this._showDates() },
      { label: '🏠 Voltar ao menu', action: () => this._showWelcome() }
    ]);
  },

  _directContact() {
    const msg = 'Olá! Gostaria de falar com o Ministério Elias Silva sobre uma ministração.';
    this._bot('<p>Vou abrir o WhatsApp para você falar diretamente com a equipe.</p>');
    this._actionsButtons([
      {
        label: 'Abrir WhatsApp',
        primary: true,
        action: () => window.open(AgendaBotService.whatsAppUrl(this._phone, msg), '_blank', 'noopener,noreferrer')
      },
      { label: '🏠 Voltar ao menu', action: () => this._showWelcome() }
    ]);
  },

  _showDates() {
    const snap = ContentService.getSnapshot();
    const slots = AgendaBotService.availableSlots(snap.eventos, snap.disponibilidade?.slots || []);

    if (!slots.length) {
      this._bot('<p>No momento não há datas livres cadastradas no calendário.</p><p>Você pode falar diretamente com a equipe pelo WhatsApp.</p>');
      this._actionsButtons([
        { label: '📞 Falar diretamente', action: () => this._directContact(), primary: true },
        { label: '🏠 Voltar ao menu', action: () => this._showWelcome() }
      ]);
      return;
    }

    this._bot(`<p>Estas são as datas <strong>disponíveis</strong> no momento.</p><small>${AgendaBotService.DISCLAIMER}</small>`);
    this._clearActions();

    const groups = AgendaBotService.groupByMonth(slots);
    groups.forEach(group => {
      const monthEl = document.createElement('div');
      monthEl.className = 'agenda-bot__month';
      monthEl.textContent = `📅 ${group.label.charAt(0).toUpperCase()}${group.label.slice(1)}`;
      this._actions.appendChild(monthEl);

      group.items.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'agenda-bot__btn agenda-bot__btn--date';
        btn.textContent = AgendaBotService.formatDayShort(slot.data);
        btn.addEventListener('click', () => {
          this._user(AgendaBotService.formatDayShort(slot.data));
          this._selectDate(slot.data);
        });
        this._actions.appendChild(btn);
      });
    });

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'agenda-bot__btn';
    back.textContent = '🏠 Voltar ao menu';
    back.addEventListener('click', () => {
      this._user('Voltar ao menu');
      this._showWelcome();
    });
    this._actions.appendChild(back);
  },

  _selectDate(dateStr) {
    this._selectedDate = dateStr;
    this._clearActions();

    this._bot(
      `<p>Você selecionou:</p><p class="agenda-bot__date-pick"><strong>${AgendaBotService.formatDateLong(dateStr)}</strong></p>` +
        `<p>⚠️ <strong>Esta data NÃO está confirmada.</strong></p>` +
        `<p>Ela será enviada para análise do Ministério.</p>`,
      'agenda-bot__bubble--warn'
    );

    this._actionsButtons([
      { label: 'Continuar', action: () => { this._user('Continuar'); this._askIgreja(); }, primary: true },
      { label: 'Escolher outra data', action: () => this._showDates() }
    ]);
  },

  _askIgreja() {
    this._bot('<p>Qual o <strong>nome da igreja</strong> ou evento?</p>');
    this._askInput('Ex.: Assembleia de Deus Belém', 'form-igreja');
  },

  _askCidade() {
    this._bot('<p>Qual a <strong>cidade</strong>?</p>');
    this._askInput('Ex.: Dourados', 'form-cidade');
  },

  _askEstado() {
    this._bot('<p>Qual o <strong>estado</strong>?</p>');
    this._askInput('Ex.: MS', 'form-estado');
  },

  _askPastor() {
    this._bot('<p>Nome do <strong>pastor responsável</strong>:</p>');
    this._askInput('Ex.: Pr. João da Silva', 'form-pastor');
  },

  _askTelefone() {
    this._bot('<p><strong>Telefone</strong> para contato:</p>');
    this._askInput('Ex.: (67) 99999-9999', 'form-telefone');
  },

  _askObservacoes() {
    this._bot('<p><strong>Observações</strong> (opcional):</p><p>Se não houver, digite <em>nenhuma</em>.</p>');
    this._askInput('Observações ou "nenhuma"', 'form-obs');
  },

  _finish() {
    if (this._form.observacoes?.toLowerCase() === 'nenhuma') {
      this._form.observacoes = '';
    }

    const message = AgendaBotService.buildWhatsAppMessage(this._form, this._selectedDate);
    const url = AgendaBotService.whatsAppUrl(this._phone, message);

    this._bot(
      '<p>Pronto! O bot <strong>não confirma</strong> a data — apenas envia sua solicitação.</p>' +
        '<p>Toque abaixo para abrir o WhatsApp com a mensagem pronta. É só apertar <strong>Enviar</strong>.</p>' +
        `<small>${AgendaBotService.DISCLAIMER}</small>`
    );

    this._actionsButtons([
      {
        label: 'Enviar solicitação no WhatsApp',
        primary: true,
        action: () => window.open(url, '_blank', 'noopener,noreferrer')
      },
      { label: 'Nova solicitação', action: () => { this._reset(); this._showWelcome(); } }
    ]);

    this._step = 'done';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AgendaBot.init();
});
