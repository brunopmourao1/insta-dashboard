# Gestão da Jaque — Checklist Mestre do Projeto

**Responsável:** Bruno Mourão  
**Última atualização:** 2026-04-21  
**Status geral:** Fase 6 em produção — dados reais ativos, @brunomourao1 conectada

---

## Como usar este documento

Ao iniciar qualquer sessão, leia este arquivo primeiro. Ele é a fonte única de verdade sobre o que já foi feito, o que está pendente e o que foi decidido. Atualize o status dos itens conforme avança.

**Legenda de status:**
- `[ ]` — Pendente
- `[x]` — Concluído
- `[~]` — Em andamento
- `[!]` — Bloqueado / requer decisão

---

## URLs de Produção

| Serviço | URL |
|---|---|
| **Frontend (Vercel)** | https://insta-dashboard-five.vercel.app |
| **Backend (Render)** | https://insta-dashboard-71lp.onrender.com |
| **GitHub** | https://github.com/brunopmourao1/insta-dashboard |
| **Credenciais** | admin@gestaojaque.com.br / senha123 |

---

## FASE 1 — Levantamento de Requisitos

- [x] PRD v1.0 criado
- [x] PRD v2.0 criado e salvo em `C:/projetos/insta-dashboard/`
- [x] Stack tecnológica definida (React + Neon + Instagram Graph API)
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

- [x] Criar conta de desenvolvedor na Meta for Developers
- [x] Criar App no Meta Developer Console (App ID: 1675193530163381)
- [x] Obter App ID e App Secret
- [x] Configurar permissões: `instagram_business_basic`, `instagram_business_manage_insights`
- [x] Implementar OAuth flow completo (Instagram Login — sem Facebook Page)
- [x] Tokens de longa duração (60 dias) com renovação automática
- [x] Callback URL configurada: `https://insta-dashboard-71lp.onrender.com/api/instagram/callback`
- [x] Testar endpoints da Graph API (métricas de conta, posts, stories, demographics, heatmap)

### Neon (PostgreSQL Serverless)

- [x] Criar projeto no Neon
- [x] Criar tabela `accounts`
- [x] Criar tabela `metrics_history`
- [x] Criar tabela `content_tags`
- [x] Criar tabela `context_notes`
- [x] Testar conexão com string de conexão segura

### Backend Express

- [x] API REST completa em `backend/src/`
- [x] Auth com JWT (login, middleware protect)
- [x] CRUD de contas, métricas, tags, notas
- [x] Rotas Instagram: `/auth-url`, `/callback`, `/sync/:id`, `/sync`, `/refresh-token/:id`, `/media/:id`, `/demographics/:id`, `/heatmap/:id`
- [x] Fix de precisão de user_id (big integer via regex string)
- [x] Fix de métrica `views` (Meta renomeou `impressions`)

---

## FASE 4 — Frontend (React / PWA)

### Setup inicial

- [x] Criar projeto React com Vite em `frontend/`
- [x] Instalar dependências: Tailwind CSS, React Router, Recharts, React Query, Lucide Icons, clsx
- [x] Configurar design system (cores, fontes Manrope/Inter, tokens do Stitch)
- [x] Configurar roteamento (React Router)
- [x] Criar estrutura de pastas: pages/, components/ui/, components/layout/, components/charts/, hooks/, data/, lib/
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
- [x] Tela: Configurações — OAuth connect button, sync/renew por conta, toast feedback, lê params `ig_connected`/`ig_error`
- [x] Tela: Input Rápido Mobile — FAB no AppLayout, visível apenas em mobile

### Integração com API (dados reais)

- [x] Conectar frontend ao backend via React Query
- [x] `useTopPosts` — posts reais com engagement rate calculado
- [x] `useDemographics` — gênero, faixa etária, cidades reais do Instagram
- [x] `useHeatmap` — heatmap e eficiência de horário derivados de posts reais
- [x] `useMetricsSummary`, `useMetrics` — métricas reais sincronizadas
- [x] Exportação CSV e JSON
- [x] Renovação de token com feedback visual

### Qualidade e performance

- [ ] Validar carregamento dos gráficos < 3 segundos (requisito PRD)
- [x] Layout responsivo completo — sidebar drawer mobile, hamburger, grids adaptáveis, PeriodFilter com scroll horizontal
- [x] Todas as páginas corrigidas para mobile: VisaoAguia, Performance, Conteudo, Audiencia
- [ ] Testar no Safari/iPhone (PWA)
- [ ] Testar responsividade em 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- [x] Testar troca de filtros sem reload de página

---

## FASE 5 — Integração e Testes com Dados Reais

- [x] Conectar conta @brunomourao1 via OAuth Instagram
- [x] Sincronizar 30 dias de métricas reais
- [x] Substituir todos os dados mock por dados reais da API
- [x] Testar heatmap com dados reais de posts
- [x] Testar demographics (gênero, faixa etária, cidades)
- [ ] Conectar segunda conta (@queline_ / Jaqueline Assis)
- [ ] Validar dados exibidos vs. Instagram Insights nativo
- [ ] Testar tagging system em posts reais
- [ ] Testar fluxo de anotação de contexto (ex: marcar "Black Friday" na timeline)
- [ ] Testar exportação CSV com dados reais
- [ ] Testar token expirado — fluxo de renovação funciona?

---

## FASE 6 — Deploy e Produção

- [x] Backend deployado no Render: https://insta-dashboard-71lp.onrender.com
- [x] Frontend deployado no Vercel: https://insta-dashboard-five.vercel.app
- [x] Variáveis de ambiente configuradas em produção (Render + Vercel dashboards)
- [x] CORS configurado com FRONTEND_URL no Render
- [x] Vercel SPA routing via `vercel.json` rewrites
- [x] Node >=18 especificado em `package.json` (engines) — necessário para native fetch
- [x] Branch `master` sincronizada com `main` (Render watch main)
- [ ] Configurar domínio personalizado
- [ ] Instalar PWA no iPhone e validar funcionamento offline básico

---

## Decisões já tomadas

| Tema | Decisão |
|---|---|
| **Nome do produto** | **Gestão da Jaque** |
| Stack frontend | React (Mobile-First / PWA) |
| Banco de dados | Neon (PostgreSQL Serverless) |
| Integração | Instagram Graph API — OAuth direto (Instagram Login, sem Facebook Page) |
| Design base | Dark theme, acentos rosa/magenta — fiel ao MCP Stitch |
| Histórico de dados | Banco próprio — independente das limitações do Instagram Insights |
| Modelo de acesso | **Uso pessoal 100%** — sem freemium. Todas as funcionalidades liberadas. |
| Permissões Meta | `instagram_business_basic` + `instagram_business_manage_insights` |
| Retenção de Reels | Ainda mock — Graph API não expõe curva de watch-time por vídeo |

---

## Pendências prioritárias para próxima sessão

1. **Conectar @queline_** — ir em Configurações → "Conectar conta Instagram" → OAuth
2. **Validar dados reais** nas telas de Audiência, Performance e Conteúdo vs. Instagram Insights nativo
3. **Testar fluxo completo** da segunda conta depois de conectada
4. **Instalar PWA no iPhone** — acessar https://insta-dashboard-five.vercel.app no Safari e "Adicionar à tela de início"

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
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |

---

_Documento mantido pelo assistente de IA. Atualizar a cada sessão de trabalho._
