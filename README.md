# Portal Oficial do Ministério Elias Silva

**Versão 1.0** · Publicado em 7 de agosto de 2026

Site estático premium para o ministério de **Elias Ferreira da Silva** — música gospel, agenda, memoriais de cultos e arquivo histórico permanente.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  Páginas HTML (index, memoriais, memorial, tv, admin) │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  js/portal/*  — Renderização e componentes de UI        │
│  js/premium/* — Experiência premium (skeleton, SEO)     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  services/*   — Camada de dados (ContentService, etc.)  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  content/*    — ÚNICA fonte de dados (JSON)             │
└─────────────────────────────────────────────────────────┘
```

**Regra de ouro:** nenhum componente lê JSON diretamente. Sempre use `ContentService`.

---

## Estrutura de pastas

```
site cantor/
├── content/           ← Dados do site (editar aqui)
│   ├── config.json    ← Configurações gerais
│   ├── eventos.json   ← Eventos, memoriais e galerias
│   ├── musicas.json   ← Discografia
│   ├── videos.json    ← Videografia
│   ├── testemunhos.json
│   ├── timeline.json
│   └── biografia.json
├── services/          ← Lógica de dados
├── js/
│   ├── portal/        ← Renderização por página
│   └── premium/       ← Polish e SEO
├── css/               ← Estilos
├── assets/            ← Imagens, ícones, áudio
├── scripts/           ← Ferramentas (sitemap, thumbs)
├── docs/              ← Relatórios de auditoria
├── index.html         ← Home
├── memoriais.html     ← Lista de memoriais
├── memorial.html      ← Template único de memorial
├── tv.html            ← Modo TV
├── manifest.json      ← PWA
├── sw.js              ← Service Worker
├── netlify.toml       ← Deploy Netlify
├── vercel.json        ← Deploy Vercel
├── _headers           ← Headers Cloudflare/Netlify
└── _redirects         ← URLs limpas
```

---

## Desenvolvimento local

```powershell
# Servir o site
npx serve "site cantor" -l 3456

# Abrir
http://localhost:3456
```

> **Memorial:** use `memorial.html?evento=dourados-ms` ou `#dourados-ms` se o servidor remover query strings.

---

## Como adicionar um memorial

1. Abra `content/eventos.json`
2. Adicione um objeto com `"realizado": true` (ou data passada):

```json
{
  "slug": "cidade-uf",
  "titulo": "Nome da Igreja",
  "cidade": "Cidade",
  "estado": "UF",
  "data": "2026-08-02",
  "tipo": "Culto de Louvor",
  "pastor": "Pr. Nome",
  "testemunho": "Frase de destaque opcional",
  "descricao": "Relato do culto...",
  "heroImage": "assets/images/eventos/cidade/hero.jpg",
  "coords": { "x": 50, "y": 60 },
  "galeria": [
    {
      "titulo": "Louvor",
      "categoria": "Louvor",
      "imagem": "assets/images/eventos/cidade/thumbs/foto01.jpg",
      "imagemFull": "assets/images/eventos/cidade/display/foto01.jpg"
    }
  ],
  "louvores": ["Deus de Israel", "Carta do Rei"],
  "videos": [{ "titulo": "Culto completo", "youtube": "ID_DO_YOUTUBE" }]
}
```

3. Regenerar sitemap (ver abaixo)
4. O memorial aparece automaticamente em **Memoriais** e no mapa

---

## Como adicionar uma música

Edite `content/musicas.json`:

```json
{
  "titulo": "Nome da Música",
  "data": "2026-01-15",
  "ano": 2026,
  "capa": "assets/images/capa.jpg",
  "youtube": "ID_YOUTUBE",
  "spotify": "https://open.spotify.com/track/...",
  "tipo": "single",
  "novo": true
}
```

> Links `#` são ocultados automaticamente até URLs reais serem inseridas.

---

## Como adicionar um vídeo

Edite `content/videos.json`:

```json
{
  "titulo": "Nome do Clipe",
  "youtube": "ID_YOUTUBE",
  "thumb": "assets/images/thumb.jpg",
  "thumbFallback": "assets/images/eventos/dourados/hero-dourados.jpg",
  "ano": 2026,
  "tipo": "clipe-oficial",
  "novo": true,
  "data": "2026-01-15"
}
```

Tipos: `clipe-oficial`, `ao-vivo`, `playback`, `participacao`

---

## Como atualizar conteúdo

| O quê | Arquivo |
|-------|---------|
| WhatsApp, URL do site | `content/config.json` |
| Eventos e memoriais | `content/eventos.json` |
| Discografia | `content/musicas.json` |
| Vídeos | `content/videos.json` |
| Testemunhos | `content/testemunhos.json` |
| Timeline | `content/timeline.json` |
| Biografia | `content/biografia.json` |

Após editar, recarregue o site. Não é necessário rebuild.

---

## Como gerar sitemap

```bash
node scripts/generate-sitemap.js https://ministerioeliassilva.com.br
```

Gera `sitemap.xml` e atualiza `robots.txt`.

---

## Como otimizar imagens

### Miniaturas da galeria (recomendado)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-gallery-thumbs.ps1
```

Cria thumbs (~34 KB) e versões display para lightbox.

### WebP (opcional)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-webp.ps1
```

**Boas práticas:**
- Hero: ~300 KB max
- Thumbs: ~40 KB max
- Display/lightbox: ~200 KB max
- Use nomes descritivos e pastas por evento

---

## Como publicar o site

### Netlify

1. Conecte o repositório
2. Build command: `node scripts/generate-sitemap.js https://seudominio.com.br`
3. Publish directory: `.` (raiz)
4. `netlify.toml` já configura redirects e headers

### Cloudflare Pages

1. Conecte o repositório
2. Build command: `node scripts/generate-sitemap.js https://seudominio.com.br`
3. Build output: `.`
4. `_headers` e `_redirects` são aplicados automaticamente

### Vercel

1. Importe o projeto
2. `vercel.json` já configura rewrites, redirects e headers
3. Deploy automático a cada push

### Apache (hospedagem tradicional)

- `.htaccess` inclui redirects, CSP e cache
- Faça upload de todos os arquivos via FTP

---

## Documentação

- [Auditoria RC v1.0](docs/RELATORIO-AUDITORIA.md)
- [Relatório SEO](docs/RELATORIO-SEO.md)
- [Relatório de Engenharia](docs/ENGINEERING_REPORT.md)
- [Política Editorial](docs/POLITICA-EDITORIAL.md)
- [Roadmap](docs/ROADMAP.md)
- [Changelog](CHANGELOG.md)

---

## Licença e créditos

© 2026 Elias Ferreira da Silva. Todos os direitos reservados.

Portal Oficial do Ministério Elias Silva — **Versão 1.0**
