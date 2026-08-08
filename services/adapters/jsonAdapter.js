/**
 * JSON Data Adapter — origem atual (content/*.json)
 * Futuro: substituir por ApiAdapter (Firebase, Supabase, REST)
 */
class JsonDataAdapter {
  constructor(basePath = '') {
    this.basePath = basePath;
  }

  file(name) {
    return `${this.basePath}content/${name}`;
  }

  async loadAll() {
    const [config, eventos, musicas, videos, testemunhos, timeline, biografia, historiaDia, disponibilidade] = await Promise.all([
      this.fetch('config.json'),
      this.fetch('eventos.json'),
      this.fetch('musicas.json'),
      this.fetch('videos.json'),
      this.fetch('testemunhos.json'),
      this.fetch('timeline.json'),
      this.fetch('biografia.json'),
      this.fetch('historia-dia.json'),
      this.fetch('disponibilidade.json')
    ]);

    return {
      config: config.config || config,
      eventos: eventos.eventos || [],
      musicas: musicas.lancamentos || [],
      videos: videos.videos || [],
      testemunhos: testemunhos.depoimentos || [],
      timeline: timeline.marcos || [],
      biografia: biografia.marcos || [],
      versiculos: (config.versiculos || biografia.versiculos || []),
      historiaDia: historiaDia.entradas || [],
      disponibilidade: disponibilidade.slots ? disponibilidade : { slots: [], aviso: disponibilidade.aviso || '' }
    };
  }

  async fetch(file) {
    const url = this.file(file);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('[ContentService] HTTP', res.status, url);
        return {};
      }
      return await res.json();
    } catch (err) {
      console.warn('[ContentService] Falha ao carregar', url, err);
      return {};
    }
  }
}

/** Stub para migração futura — implementar fetch remoto aqui */
class ApiDataAdapter {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }
  async loadAll() {
    const res = await fetch(`${this.apiBase}/portal`);
    if (!res.ok) throw new Error('ApiAdapter: falha ao carregar portal');
    return res.json();
  }
}
