# Portal Oficial do Ministério Elias Silva

## Política Editorial — v1.0

**Vigência:** 7 de agosto de 2026  
**Status:** Ativa · Code Freeze do sistema  
**Aplica-se a:** Todo conteúdo publicado em `/content` e mídia associada

---

## Objetivo

Todo conteúdo publicado deve preservar a história do ministério com **qualidade**, **consistência** e **organização**.

O portal é um **acervo permanente**, não uma rede social.

---

## Princípios

1. **Qualidade sobre quantidade** — menos fotos excelentes valem mais do que centenas medianas.
2. **História que cresce** — biografia e memoriais são acrescentados, nunca apagados ou reescritos.
3. **Consistência** — mesmo padrão de texto, fotos e dados em todo memorial.
4. **Permanência** — cada culto realizado merece registro; nenhum evento se perde.
5. **Respeito** — tom simples, acolhedor e reverente em todos os textos.

---

## Antes de publicar um memorial

Verificar **todos** os itens:

- [ ] Nome oficial da igreja
- [ ] Cidade e estado corretos
- [ ] Data correta
- [ ] Nome correto do pastor anfitrião
- [ ] Texto revisado (ortografia e tom)
- [ ] Fotos selecionadas e otimizadas
- [ ] Vídeos funcionando (embed YouTube)
- [ ] Links testados (memorial, compartilhamento, externo)

> **Nunca publicar informações incompletas.**  
> Se faltar dado essencial, aguardar — o memorial pode ficar em rascunho local até estar pronto.

---

## Fotos

**Priorizar qualidade.**

Cada memorial deve possuir aproximadamente:

| Tipo | Quantidade |
|------|------------|
| Foto de capa (hero) | 1 |
| Fotos de destaque | 6–12 |
| Galeria completa | até 40 |

### Evitar

- Fotos repetidas ou muito semelhantes
- Fotos desfocadas
- Pessoas cortadas de forma inadequada
- Excesso de imagens do mesmo ângulo/momento
- Publicar o acervo bruto inteiro (originais full-res ficam em backup externo)

### Fluxo técnico

1. Selecionar e curar fotos
2. Gerar thumbs e display: `scripts/generate-gallery-thumbs.ps1`
3. Registrar em `content/eventos.json` (campo `galeria`)
4. Manter originais em cópia externa — **não enviar ao deploy de produção**

---

## Texto

Cada memorial deve responder, de forma natural, às perguntas:

| Pergunta | Exemplo de conteúdo |
|----------|---------------------|
| **Onde foi?** | Igreja, cidade, estado |
| **Quando foi?** | Data e contexto (domingo, congresso, etc.) |
| **Quem recebeu o ministério?** | Pastor, liderança, igreja anfitriã |
| **Como foi o culto?** | Louvor, pregação, participação |
| **O que marcou aquele momento?** | Testemunho, frase, clima especial |

### Tom

- Simples, respeitoso e acolhedor
- Evitar linguagem promocional ou sensacionalista
- Preferir relato narrativo a lista de bullet points secos

### Exemplo (referência)

> *Na noite de domingo, a Igreja Assembleia de Deus Belém, em Dourados/MS, recebeu o cantor Elias Silva para um culto marcado por momentos de louvor, comunhão e ministração da Palavra. A igreja participou intensamente, tornando esta data um marco especial na história do ministério.*

---

## Vídeos

- **Sempre** utilizar o vídeo oficial do canal YouTube do ministério
- Incorporar via embed — **nunca** hospedar vídeo no servidor do portal
- Não duplicar o mesmo vídeo em memoriais diferentes
- Verificar se o embed carrega antes de publicar

---

## Biografia

- **Nunca substituir** informações antigas
- **Apenas acrescentar** novos capítulos ou marcos
- A história deve **crescer**, nunca ser reescrita

### Capítulos sugeridos

1. Infância  
2. Conversão  
3. Chamado ministerial  
4. Primeiros discos  
5. Congressos  
6. Gideões  
7. Família (Léia Silva)  
8. Ministério atualmente  

Arquivo: `content/biografia.json` e `content/timeline.json`

---

## Agenda e memoriais

Quando um evento **terminar** (data passada ou `realizado: true`):

1. Retirar da percepção de “próximo evento” (automático por data)
2. Criar ou **completar** o memorial correspondente em `content/eventos.json`
3. Adicionar fotos curadas
4. Adicionar vídeos oficiais
5. Publicar relato textual

> Assim **nenhum culto é perdido** — a agenda mostra o futuro; os memoriais guardam o passado.

---

## Versionamento

Separar claramente duas dimensões:

| Dimensão | Onde registrar | Exemplo |
|----------|----------------|---------|
| **Versão do sistema** | Rodapé, `CHANGELOG.md` | v1.0, v1.1 |
| **Versão do conteúdo** | `content/config.json` → `contentUpdatedAt` | Atualizado em 15/03/2027 |

O portal continua **vivo** quando o conteúdo é atualizado — mesmo sem mudanças no código.

---

## Backup

Antes de **qualquer alteração importante**:

1. Fazer backup da pasta `content/`
2. Versionar no Git (commit com mensagem clara)
3. Manter cópia externa das **fotos originais** (HD, nuvem ou disco dedicado)

> **O conteúdo do ministério é mais valioso do que o próprio código.**

### Checklist de backup

- [ ] `content/` exportado ou commitado
- [ ] Fotos originais em storage externo
- [ ] Anotar o que foi alterado (memorial, data, responsável)

---

## Identidade visual (referência)

Consultar evolução do guia de marca conforme disponível:

| Elemento | Valor atual no portal |
|--------|------------------------|
| Cor principal | `#D4AF37` (dourado) |
| Fundo | `#090909` |
| Tipografia display | Cormorant Garamond |
| Tipografia UI | Montserrat |
| Logo / favicon | `assets/icons/favicon.svg` |

Documentar versões clara/escura da logo quando o guia oficial for finalizado.

---

## Página «Legado» (recomendação futura)

**Não confundir** com galeria ou biografia resumida.

Seria uma **linha do tempo narrativa** dos momentos mais marcantes:

- Nascimento  
- Conversão  
- Início na música  
- Primeiro álbum  
- Grandes congressos  
- Gideões  
- Casamento com Léia Silva  
- Marcos do ministério  
- Eventos históricos  

**Público:** fãs, igrejas, pesquisadores, futuras gerações.

**Base técnica existente:** `content/timeline.json` + seção «História do Ministério» na home. Uma página dedicada `legado.html` pode ser conteúdo puro (v1.0.x) ou evolução v1.1 — **não é prioridade de código**; é prioridade de **conteúdo e curadoria**.

---

## Classificação de alterações (Code Freeze)

Durante a v1.0 do sistema, toda mudança deve ser classificada:

| Tipo | Permitido | Exemplos |
|------|-----------|----------|
| 📝 Conteúdo | ✅ | Novo memorial, biografia, fotos, textos |
| 🐛 Bugfix | ✅ | Link quebrado, erro de exibição |
| 🔒 Segurança | ✅ | CSP, HTTPS |
| ⚡ Performance | ✅ | Compressão de imagem |
| ✨ Funcionalidade | ❌ v1.1+ | Legado (página), CMS, login |

---

## Responsabilidade editorial

| Papel | Responsabilidade |
|-------|------------------|
| **Curador de conteúdo** | Textos, fotos, aprovação final antes de publicar |
| **Técnico (quando necessário)** | JSON, deploy, bugfix — não decide conteúdo |
| **Ministério** | Aprovação de relatos, fotos e representação oficial |

---

## Revisão desta política

Revisar anualmente ou quando:

- Novo tipo de conteúdo for introduzido
- Versão 1.1 do sistema for lançada
- Volume de memoriais ultrapassar 20 cidades

---

*Portal Oficial do Ministério Elias Silva*  
*Política Editorial v1.0 · 7 de agosto de 2026*
