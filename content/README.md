# Portal do Ministério — Administração via ContentService

**Nenhum componente lê JSON diretamente.** Tudo passa por `services/contentService.js`.

## ContentService

```javascript
await ContentService.init();
const eventos = await ContentService.getEventos();
const musica = await ContentService.getLatestMusica();
const memorial = await ContentService.getEvento('dourados-ms');
const stats = await ContentService.computeStats();
const narrativa = await ContentService.getNarrativaTimeline();
```

### Migrar para Firebase / Supabase / API

```javascript
ContentService.useAdapter(new ApiDataAdapter('https://api.seudominio.com'));
await ContentService.init();
```

## Estrutura `/content`

```
content/
├── config.json      → WhatsApp, nome do site, ano de início
├── eventos.json     → Cultos, memoriais, galeria inline, vídeos
├── musicas.json     → Lançamentos (YouTube, Spotify, Deezer, Apple)
├── videos.json      → Videografia
├── testemunhos.json → Depoimentos
├── timeline.json    → Linha do tempo da carreira
└── agenda.json      → Referência (agenda é auto-calculada dos eventos futuros)
```

## Adicionar um novo culto

Edite **`content/eventos.json`** — adicione ao array `eventos`:

```json
{
  "slug": "cidade-uf",
  "titulo": "Nome da Igreja",
  "cidade": "Cidade",
  "estado": "UF",
  "data": "2026-12-15",
  "pastor": "Pr. Nome",
  "tipo": "Culto de Louvor e Adoração",
  "descricao": "Relato do culto...",
  "testemunho": "Frase de destaque",
  "heroImage": "assets/images/eventos/pasta/hero.jpg",
  "louvores": ["Música 1"],
  "videos": [{ "titulo": "Registro", "youtube": "ID_YOUTUBE" }],
  "galeria": [
    { "categoria": "Louvor", "imagem": "assets/.../thumbs/foto.jpg", "imagemFull": "assets/.../display/foto.jpg", "titulo": "Legenda" }
  ],
  "galeriaTotal": 100,
  "coords": { "x": 50, "y": 50 }
}
```

## Scripts utilitários

- `node scripts/generate-sitemap.js https://seudominio.com` — gera `sitemap.xml` + `robots.txt`
- `scripts/generate-gallery-thumbs.ps1` — miniaturas JPG
- `scripts/generate-webp.ps1` — prepara WebP/AVIF (ver ImageService)

## URLs de memorial

- `memorial.html?evento=slug`
- `memorial/slug` (com redirect)
- SEO: defina `siteUrl` em `config.json`

### Agenda → Memorial automático

Quando a **data passar**, o evento:
- sai da **Agenda** (home)
- entra nos **Memoriais** (timeline + mapa)
- nunca é apagado

## Galeria — categorias

`Louvor` · `Pregação` · `Coral` · `Igreja` · `Comunhão` · `Infantil`

Use miniaturas em `thumbs/` e versão média em `display/` (script: `scripts/generate-gallery-thumbs.ps1`).

## Novo lançamento musical

Edite **`content/musicas.json`** — adicione no início:

```json
{
  "titulo": "Nome",
  "data": "2026-08-07",
  "ano": 2026,
  "capa": "assets/images/...",
  "youtube": "ID",
  "spotify": "URL",
  "deezer": "URL",
  "apple": "URL",
  "letra": "Texto opcional",
  "audio": "assets/music/faixa.mp3",
  "novo": true
}
```

Atualiza automaticamente: hero, lançamentos, discografia.

## Videoteca Oficial — catálogo cinematográfico

Edite **`content/videos.json`** — cole o link do YouTube e metadados opcionais:

```json
{
  "titulo": "Carta do Rei",
  "youtube": "https://www.youtube.com/watch?v=XXXXXXXX",
  "descricao": "Uma canção sobre esperança...",
  "tipo": "clipe-oficial",
  "data": "2023-03-10",
  "destaque": true,
  "album": "Promessas",
  "compositor": "Elias Silva",
  "views": 430000,
  "duracao": "4:48"
}
```

**Tipos:** `clipe-oficial` · `ao-vivo` · `congressos` · `participacao` · `entrevista` · `playback`

**Campo `destaque`:** quando `true`, o vídeo aparece no banner principal da home — mesmo que não seja o mais recente. Útil para promover um lançamento específico ou clipe importante.

**Campos opcionais:** `album`, `compositor`, `views`, `duracao`, `descricao` — alimentam a ficha técnica e o modal do player.

O portal gera automaticamente: miniatura oficial, banner cinematográfico, carrossel «Últimos clipes», playlists por categoria, ficha técnica e sugestão «Assistir também» ao terminar o vídeo.

Catálogo completo em **`videoteca.html`**. Na home, apenas os três vídeos mais recentes.

## Hoje na História

Edite **`content/historia-dia.json`** — entradas por mês/dia:

```json
{
  "mes": 8,
  "dia": 7,
  "tipo": "memorial",
  "ano": 2014,
  "texto": "Em 2014, Elias Silva ministrava na...",
  "link": "memoriais.html",
  "linkLabel": "Ver memoriais"
}
```

Se não houver entrada manual, o portal busca automaticamente lançamentos musicais ou memoriais na mesma data.

## Hero automático (prioridade)

1. Último lançamento (`musicas.json`)
2. Próximo evento (`eventos.json` futuro)
3. Memorial mais recente

## Contadores automáticos

Calculados do JSON: anos de ministério, memoriais, cidades, estados, igrejas, fotos.

## SEO automático

Cada memorial atualiza título, description, Open Graph e Twitter Card a partir do JSON.
