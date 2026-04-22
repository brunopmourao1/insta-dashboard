# Plano de Ação — Gestão da Jaque
**Responsável:** Bruno Mourão  
**Data de criação:** 2026-04-22  
**Status geral:** Core em produção. Faltam validação, segunda conta e documentação.

---

## Como usar este documento

Cada item tem um status, esforço estimado e critério de conclusão claro. Trabalhe de cima para baixo — os blocos estão em ordem de dependência: não faz sentido documentar antes de validar, nem validar antes de corrigir.

**Legenda:**
- `[ ]` Pendente
- `[x]` Concluído
- `[~]` Em andamento

---

## Bloco 1 — Ações Imediatas (sem código)

> Fazer antes de qualquer outra coisa. Algumas corrompem dados se adiadas.

- [ ] **Abrir o app em produção e clicar em "Atualizar"**
  - URL: https://insta-dashboard-five.vercel.app
  - Isso executa o cleanup dos dados históricos de seguidores corrompidos e registra o count de hoje como referência real.
  - Critério: botão fica verde "Atualizado!" por 3 segundos sem erro no console.

- [ ] **Confirmar o cron diário no Render**
  - Acessar https://dashboard.render.com
  - Verificar se o serviço `gestao-jaque-daily-sync` apareceu após o último deploy.
  - Se não aparecer: criar manualmente como "Cron Job" → Build Command: `npm install` → Command: `node src/cron-sync.js` → Schedule: `0 6 * * *`
  - Critério: serviço listado com status "Active".

- [ ] **Conectar a conta @queline_ (Jaqueline Assis)**
  - Ir em Configurações → "Conectar conta Instagram" → OAuth.
  - Fazer login com a conta da Jaqueline durante o fluxo OAuth.
  - Após conectar, clicar em "Sincronizar" na linha da conta.
  - Critério: conta aparece no seletor de contas das páginas, dados carregam ao selecionar.

---

## Bloco 2 — Validação de Dados

> Nenhum dashboard é confiável sem validar os números contra a fonte original.

- [ ] **Comparar métricas do dashboard vs. Instagram Insights nativo**
  - Abrir o Instagram da conta @brunomourao1 → Insights → Últimos 30 dias.
  - Comparar lado a lado com o dashboard (Visão de Águia → filtro 30d):
    - [ ] Alcance total
    - [ ] Impressões totais
    - [ ] Engajamento médio
    - [ ] Número de seguidores atual
  - Registrar qualquer divergência aqui abaixo para investigar.
  - Critério: diferença < 5% (variações esperadas por fuso horário e janela de tempo).

  > Divergências encontradas:
  > _preencher após o teste_

- [ ] **Validar heatmap e eficiência de horário**
  - Verificar se os horários apontados como "Alto" batem com a percepção real de performance dos posts.
  - Critério: pelo menos 3 dos 4 horários listados na "Eficiência de Horário" fazem sentido intuitivamente.

- [ ] **Validar demographics quando disponível**
  - Instagram demora ~7 dias para gerar dados demográficos em contas recém-convertidas para profissional.
  - Retornar à página de Audiência após 7 dias da conversão e verificar se os dados aparecem.
  - Comparar gênero, faixa etária e cidades com o que o Instagram nativo mostra.
  - Critério: dados aparecem e são plausíveis.

- [ ] **Repetir validação para @queline_**
  - Após conectar e sincronizar a segunda conta, refazer as comparações acima.
  - Critério: mesma margem de tolerância < 5%.

---

## Bloco 3 — Testes no iPhone / PWA

> O projeto foi desenvolvido em desktop. Esta etapa valida a experiência real de uso.

- [ ] **Abrir o app no Safari do iPhone**
  - Acessar https://insta-dashboard-five.vercel.app no Safari (não Chrome).
  - Navegar por todas as 5 páginas.
  - Verificar: texto legível, gráficos visíveis, scroll funcionando, botões clicáveis.
  - Critério: nenhuma tela quebrada em 375px (iPhone SE) e 390px (iPhone 14).

- [ ] **Instalar como PWA**
  - No Safari: botão de compartilhar → "Adicionar à Tela de Início".
  - Abrir o ícone criado e verificar se abre em modo standalone (sem barra do Safari).
  - Critério: abre como app, splash screen aparece, navegação funciona.

- [ ] **Testar o FAB mobile (botão flutuante)**
  - O botão "+" no canto inferior direito só aparece em mobile.
  - Tocar no botão → preencher uma anotação de contexto → salvar.
  - Verificar se a anotação aparece na timeline de Conteúdo.
  - Critério: anotação salva e visível na página de Conteúdo.

- [ ] **Testar troca de conta no seletor em mobile**
  - Na página de Performance ou Audiência, tocar no seletor de conta.
  - Trocar para @queline_ e verificar se os dados atualizam.
  - Critério: dados trocam sem reload de página.

---

## Bloco 4 — Funcionalidades Não Testadas

> Foram implementadas mas nunca usadas com dados reais.

- [ ] **Testar o sistema de tags em posts reais**
  - Ir em Análise de Conteúdo → ver lista de Top Posts.
  - Verificar se existe fluxo para adicionar uma tag a um post específico.
  - Se o fluxo não estiver claro, essa funcionalidade precisa de revisão de UX.
  - Critério: conseguir marcar pelo menos 3 posts com tags e ver o gráfico de pizza atualizar.

- [ ] **Testar exportação de dados**
  - Ir em Configurações → botões de exportação (CSV e JSON).
  - Baixar ambos os formatos.
  - Abrir o CSV no Excel/Numbers e verificar se os dados são legíveis.
  - Critério: arquivo CSV abre corretamente com colunas de data, alcance, seguidores, engajamento.

- [ ] **Testar renovação de token Instagram**
  - O token expira em 60 dias (próxima expiração: ~junho de 2026).
  - Quando se aproximar da data: ir em Configurações → "Renovar Token" para a conta.
  - Critério: token renovado sem precisar refazer o OAuth completo.
  - _Este item vira pendente automaticamente em ~junho 2026._

- [ ] **Testar o filtro de período customizado**
  - Na Visão de Águia, selecionar "Custom" no filtro.
  - Preencher de 01/04/2026 até 15/04/2026 e clicar "Aplicar".
  - Verificar se os dados refletem exatamente esse intervalo.
  - Critério: total_reach e impressões mudam em relação ao filtro de 30d.

- [ ] **Testar anotação de contexto na timeline**
  - Em Análise de Conteúdo → clicar "Anotar Evento".
  - Criar uma anotação com data, categoria "Campanha" e descrição.
  - Verificar se aparece na linha de "Anotações" abaixo do gráfico de timeline.
  - Critério: anotação aparece com data e categoria corretas.

---

## Bloco 5 — Polimento (opcional, mas recomendado)

- [ ] **Configurar domínio personalizado**
  - Sugestão: `dashboard.gestaodajaque.com.br` ou `analytics.gestaodajaque.com.br`
  - Configurar no painel da Vercel (Settings → Domains).
  - Atualizar a variável `FRONTEND_URL` no Render para o novo domínio.
  - Critério: app acessível pelo domínio personalizado com HTTPS.

- [ ] **Remover ou substituir o gráfico de Retenção de Reels**
  - Atualmente usa dados mock porque a Graph API não expõe watch-time por vídeo.
  - Decisão necessária: remover o gráfico da tela de Performance, ou substituir por outra métrica real (ex: salvos por Reel ao longo do tempo).

- [ ] **Adicionar linha de comparação nos gráficos de área**
  - O toggle "Comparar com período anterior" aparece nos KPIs mas não nos gráficos de linha.
  - Seria útil ver a curva de reach do período atual vs. período anterior sobrepostas.

- [ ] **Conectar a busca da Topbar**
  - O input de busca é decorativo. Poderia filtrar posts por título/caption na página de Conteúdo.

---

## Bloco 6 — Documentação

> Um projeto bem documentado pode ser retomado meses depois sem perda de contexto. Esta etapa cobre tudo: arquitetura, funcionalidades, fluxos e manutenção.

### 6.1 — README principal do projeto

- [ ] **Criar `README.md` na raiz do repositório**
  - Conteúdo mínimo:
    - O que é o Gestão da Jaque (1 parágrafo)
    - Screenshot da tela principal
    - Como rodar localmente (backend + frontend)
    - Variáveis de ambiente necessárias (sem os valores — só os nomes)
    - Como fazer deploy (Render + Vercel)
    - Link para produção

### 6.2 — Documentação técnica do backend

- [ ] **Criar `backend/README.md`**
  - Estrutura de pastas e responsabilidade de cada arquivo
  - Todas as rotas da API com método, parâmetros e exemplo de resposta:
    - `/api/auth/login`
    - `/api/accounts` (GET, POST, PATCH, DELETE)
    - `/api/metrics` e `/api/metrics/summary`
    - `/api/instagram/auth-url`, `/callback`, `/sync`, `/sync/:id`
    - `/api/instagram/media/:id`, `/demographics/:id`, `/heatmap/:id`
  - Como funciona o OAuth do Instagram (passo a passo)
  - Como funciona o sync de métricas (o que cada campo significa)
  - Limitações conhecidas da Graph API (sem histórico de seguidores, sem watch-time)
  - Como rodar o cron manualmente: `node src/cron-sync.js`

### 6.3 — Documentação do banco de dados

- [ ] **Documentar o schema do banco (pode ser seção no README do backend)**
  - Tabela `accounts`: o que cada coluna armazena, por que `ig_user_id` é TEXT (precisão de big integer)
  - Tabela `metrics_history`: o que cada métrica representa, por que `followers` só é confiável para a data de hoje
  - Tabela `content_tags`: como o tagging system funciona
  - Tabela `context_notes`: como as anotações se vinculam a datas nos gráficos
  - Constraint `UNIQUE(account_id, date)` em `metrics_history` — por que existe e o que acontece no upsert

### 6.4 — Documentação do frontend

- [ ] **Criar `frontend/README.md`**
  - Estrutura de pastas (pages/, components/, hooks/, contexts/, lib/)
  - Como o sistema de filtros funciona (`FilterContext` → `getDateRange()` → query params)
  - Como os dados fluem: Instagram API → backend sync → banco → React Query → componente
  - Descrição de cada página e o que ela mostra
  - Descrição dos hooks principais (`useMetricsSummary`, `useTopPosts`, `useHeatmap`, etc.)
  - Como o sistema de autenticação funciona (JWT no localStorage, `AuthContext`, `ProtectedRoute`)
  - Como o PWA está configurado (manifest, service worker)

### 6.5 — Documentação de funcionalidades (guia do usuário)

- [ ] **Criar `GUIA-DO-USUARIO.md` na raiz**
  - Escrito em linguagem simples, sem jargão técnico
  - Conteúdo:
    - Como conectar uma conta Instagram
    - Como sincronizar dados (manual vs. automático)
    - Como usar os filtros de período
    - O que significa cada métrica (alcance, impressões, engajamento)
    - Como funciona o heatmap e como interpretar a "Eficiência de Horário"
    - Como adicionar tags a posts e o que o gráfico de pizza mostra
    - Como anotar eventos na timeline (ex: "Black Friday", "Campanha paga")
    - Como exportar os dados
    - Como instalar o app no iPhone (PWA)
    - Por que o crescimento de seguidores só aparece após alguns dias de uso

### 6.6 — Documentação de manutenção

- [ ] **Criar seção "Manutenção" no README principal**
  - Como renovar o token Instagram (antes de 60 dias)
  - O que fazer se o sync parar de funcionar (checar logs no Render)
  - Como resetar a senha do admin (via variável `ADMIN_EMAIL`/`ADMIN_PASSWORD` no Render)
  - Como escalar para mais contas (não há limite técnico no código atual)
  - Como atualizar as permissões do app Meta se necessário

---

## Limitações aceitas e documentadas

| Limitação | Motivo | Impacto |
|---|---|---|
| Retenção de Reels (watch-time) | Graph API não expõe por vídeo | Gráfico usa mock — não usar para decisão |
| Histórico de seguidores | API só retorna count atual, nunca histórico | Ganho de seguidores acumula 1 dia por vez |
| Demographics em contas novas | Instagram gera após ~7 dias | Seção mostra aviso contextual |
| Busca na Topbar | Não implementada | Decorativa por enquanto |

---

## Ordem recomendada de execução

```
Bloco 1 (hoje, 30 min)
  → Bloco 2 (esta semana, 1-2h de comparação manual)
    → Bloco 3 (esta semana, 1h no iPhone)
      → Bloco 4 (esta semana, 1-2h de testes)
        → Bloco 5 (opcional, quando quiser)
          → Bloco 6 (documentação, 3-4h, pode ser em sessões separadas)
```

---

_Documento criado em 2026-04-22. Atualizar o status dos itens conforme forem concluídos._
