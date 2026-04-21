# Gestão da Jaque — Checklist Mestre do Projeto

**Responsável:** Bruno Mourão  
**Última atualização:** 2026-04-21  
**Status geral:** Fase 4 — Frontend completo com responsividade mobile total

---

## Como usar este documento

Ao iniciar qualquer sessão, leia este arquivo primeiro. Ele é a fonte única de verdade sobre o que já foi feito, o que está pendente e o que foi decidido. Atualize o status dos itens conforme avança.

**Legenda de status:**
- `[ ]` — Pendente
- `[x]` — Concluído
- `[~]` — Em andamento
- `[!]` — Bloqueado / requer decisão

---

## FASE 1 — Levantamento de Requisitos

- [x] PRD v1.0 criado
- [x] PRD v2.0 criado e salvo em `C:/projetos/insta-dashboard/`
- [x] Stack tecnológica definida (React + Neon + Google Stitch + Instagram Graph API)
- [x] Modelagem de dados definida (accounts, metrics_history, content_tags, context_notes)
- [x] Roadmap de desenvolvimento definido no PRD v2.0

---

## FASE 2 — Design e Prototipação (Stitch)

**Projeto Stitch:** `projects/15735539119614228185`

### Telas existentes no Stitch

- [x] Visão de Águia — `screens/16ce6340afe8418f8ab66cbf734fef1a`
- [x] Performance Individual — `screens/dcc28ac73265454b85f4204ca6105410`
- [x] Análise de Conteúdo & Heatmap — `screens/b91e35a7e5de4278b8280c5dcba9fb9e`
- [x] Audiência & demografia — `screens/9b05b1eb584148be965313db98d5b9fa`
- [x] Configurações & Gestão de Contas — `screens/0155325ea6d14939be374503d591fc60`

### Ajustes de design no Stitch (fazer manualmente na interface web)

> ⚠️ As edições via MCP Stitch estão sujeitas a timeout. Fazer diretamente no projeto `15735539119614228185` em stitch.google.com.

- [ ] **Renomear** produto em todas as telas: "Luminous Zenith" / "IG Intelligence" → **"Gestão da Jaque"**
- [ ] **Remover** botão "Upgrade to Pro" de todas as telas
- [ ] Adicionar filtro **24h** e **15 dias** na barra de filtros temporais
- [ ] Criar seletor de **comparação de períodos** (atual vs. anterior)
- [ ] Adicionar campo de **anotação de contexto** na timeline (Tela Análise de Conteúdo)
- [ ] Expandir "Activity Patterns" com recomendação de **melhor horário** (Tela Audiência)
- [ ] Criar versão **Mobile (375px)** de todas as telas
- [ ] Criar tela de **Login / Autenticação** no Stitch
- [ ] Criar tela de **Input Rápido Mobile** no Stitch

> 💡 Estas correções são só para referência visual. O código já implementa tudo certo desde o início.

---

## FASE 3 — Infraestrutura e Banco de Dados

### Meta / Instagram Graph API

- [ ] Criar conta de desenvolvedor na Meta for Developers
- [ ] Criar App no Meta Developer Console
- [ ] Obter App ID e App Secret
- [ ] Configurar permissões necessárias: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`
- [ ] Gerar Token de Acesso de Longa Duração para cada conta
- [ ] Testar endpoints da Graph API (métricas de conta, posts, stories)

### Neon (PostgreSQL Serverless)

- [ ] Criar projeto no Neon
- [ ] Criar tabela `accounts` (id, ig_username, access_token, token_expiry, is_active)
- [ ] Criar tabela `metrics_history` (id, account_id, date, reach, impressions, engagement_rate, followers)
- [ ] Criar tabela `content_tags` (id, post_id, account_id, tag, created_at)
- [ ] Criar tabela `context_notes` (id, account_id, date, note, created_at)
- [ ] Testar conexão com string de conexão segura

### Google Stitch (ETL / Orquestração)

- [ ] Configurar fluxo de coleta diária de métricas via Graph API
- [ ] Configurar job de renovação automática de tokens
- [ ] Configurar job de backup incremental no Neon
- [ ] Testar pipeline completo end-to-end

---

## FASE 4 — Frontend (React / PWA)

### Setup inicial

- [x] Criar projeto React com Vite em `frontend/`
- [x] Instalar dependências: Tailwind CSS, React Router, Recharts, React Query, Lucide Icons, clsx
- [x] Configurar design system (cores, fontes Manrope/Inter, tokens do Stitch)
- [x] Configurar roteamento (React Router)
- [x] Criar estrutura de pastas: pages/, components/ui/, components/layout/, components/charts/, hooks/, data/, lib/
- [x] Criar dados mock em `src/data/mock.js` (accounts, métricas, alertas, heatmap, audiência, posts)
- [x] Criar constantes do app (APP_NAME, PERIOD_FILTERS, NAV_ITEMS)
- [x] Configurar PWA (manifest.json, service worker)
- [x] Configurar variáveis de ambiente (.env)

### Componentes base

- [x] Layout shell: `AppLayout` (sidebar + topbar + outlet)
- [x] `Sidebar` com nav ativa, logo "Gestão da Jaque", sem freemium
- [x] `Topbar` com busca, navegação e ícones
- [x] `PeriodFilter` com 24h | 7d | 15d | 30d | Este Mês | Custom + toggle "Comparar com período anterior"
- [x] `KpiCard` com valor, label, variação % e ícone
- [x] `AccountSelector` — dropdown com contas, avatar, check ativo
- [x] `ReachAreaChart` — gráfico de área Recharts (reach + impressions)
- [x] `RetentionChart` — curva de retenção de Reels com ReferenceLine 50%
- [x] `HeatmapGrid` — grid dia × horário com 5 níveis de intensidade
- [x] `TagsPieChart` — donut chart de temas/tags
- [x] `FollowerGrowthChart` — crescimento de seguidores
- [x] `FAB` — botão flutuante mobile (+) com modal de anotação rápida (apenas mobile, oculto em desktop)

### Telas / Páginas

- [x] Tela: Login — formulário e-mail/senha, glow decorativo, navegação para dashboard
- [x] Tela: Visão de Águia — KPIs, comparativo de perfis, alertas, filtros completos
- [x] Tela: Performance Individual — KPIs, retenção de Reels, eficiência de horário, heatmap
- [x] Tela: Análise de Conteúdo — top posts, tagging pie, timeline + modal de anotação de evento
- [x] Tela: Audiência & Demographics — crescimento, gênero, faixa etária, localidades, activity bars + "Melhor horário"
- [x] Tela: Configurações — contas conectadas + status token, App ID/Secret, exportação CSV/JSON com toggles
- [x] Tela: Input Rápido Mobile — FAB no AppLayout, visível apenas em mobile

### Integração com API

- [x] Conectar frontend ao Neon via API REST ou Neon Serverless Driver
- [x] Implementar fetch de métricas com React Query (cache + revalidação)
- [x] Implementar exportação CSV
- [x] Implementar exportação JSON
- [x] Implementar renovação de token com alerta visual

### Qualidade e performance

- [ ] Validar carregamento dos gráficos < 3 segundos (requisito PRD)
- [x] Layout responsivo completo — sidebar drawer mobile, hamburger, grids adaptáveis, PeriodFilter com scroll horizontal
- [x] Todas as páginas corrigidas para mobile: VisaoAguia, Performance, Conteudo, Audiencia
- [ ] Testar no Safari/iPhone (PWA)
- [ ] Testar responsividade em 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- [x] Testar troca de filtros sem reload de página

---

## FASE 5 — Integração e Testes Finais

- [ ] Conectar pelo menos 2 contas reais do Instagram
- [ ] Validar dados exibidos vs. dados no Instagram Insights nativo
- [ ] Testar heatmap com dados reais de 30 dias
- [ ] Testar tagging system em posts reais
- [ ] Testar fluxo de anotação de contexto (ex: marcar "Black Friday" na timeline)
- [ ] Testar exportação CSV com dados reais
- [ ] Testar token expirado — fluxo de renovação funciona?

---

## FASE 6 — Deploy e Produção

- [ ] Definir hospedagem do frontend (Vercel / Netlify recomendado)
- [ ] Configurar domínio personalizado
- [ ] Configurar HTTPS
- [ ] Configurar variáveis de ambiente em produção (App ID, App Secret, Neon URL)
- [ ] Instalar PWA no iPhone e validar funcionamento offline básico
- [ ] Deploy em produção

---

## Decisões já tomadas

| Tema | Decisão |
|---|---|
| **Nome do produto** | **Gestão da Jaque** |
| Stack frontend | React (Mobile-First / PWA) |
| Banco de dados | Neon (PostgreSQL Serverless) |
| Orquestração | Google Stitch |
| Integração | Instagram Graph API (conectar futuramente, desenvolvimento inicial com dados mock) |
| Design base | Dark theme, acentos rosa/magenta — fiel ao MCP Stitch (project 15735539119614228185) |
| Histórico de dados | Banco próprio — independente das limitações do Instagram Insights |
| Modelo de acesso | **Uso pessoal 100%** — sem freemium, sem "Upgrade to Pro". Todas as funcionalidades liberadas. |
| Fase atual da API | Sem conexão real por enquanto — usar dados mock no desenvolvimento |

---

## Decisões pendentes

_Nenhuma no momento. Todas as decisões iniciais foram tomadas._

---

## Referências e recursos

| Item | Local |
|---|---|
| PRD v2.0 | `C:/projetos/insta-dashboard/PRD - Dashboard de Inteligência Instagram v2.0.md` |
| Planejamento | `C:/projetos/insta-dashboard/Planejamento.md` |
| Telas Stitch | Project ID `15735539119614228185` (servidor MCP Google Stitch) |
| PRD no Drive | Disponível via MCP Google Drive |
| Meta Developer | https://developers.facebook.com |
| Neon Console | https://console.neon.tech |
| Stitch | Servidor MCP configurado na sessão |

---

_Documento mantido pelo assistente de IA. Atualizar a cada sessão de trabalho._
