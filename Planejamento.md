# PLANEJAMENTO E REQUISITOS: DASHBOARD MULTI-INSTAGRAM (USO PESSOAL)

## 1. OBJETIVO GERAL
Desenvolver uma ferramenta de inteligência de dados para gestão pessoal de múltiplas contas do Instagram. O foco é superar as limitações do "Instagram Insights" nativo, permitindo análises históricas profundas, identificação de padrões de engajamento e suporte à tomada de decisão para postagens (melhores horários, formatos e temas).

---

## 2. REQUISITOS DE CONTROLE TEMPORAL (DINÂMICO)
O sistema deve permitir a filtragem de todos os dados do dashboard através de:
* **Presets Rápidos:** Últimas 24h, Últimos 7 dias, Últimos 15 dias e Último Mês.
* **Seleção Customizada:** Calendário para escolha de períodos específicos (Data Início - Data Fim).
* **Análise Comparativa:** Comparar o período selecionado com o período imediatamente anterior (Ex: Estes 15 dias vs. 15 dias anteriores).

---

## 3. GESTÃO DE MÚLTIPLOS PERFIS (MULTITENANCY)
* **Centralização:** Gerenciamento de várias contas (Próprias e Clientes) em um único painel.
* **Seletor Global:** Menu suspenso (dropdown) para alternar entre perfis, atualizando instantaneamente todas as métricas da tela.
* **Visão de Águia (Consolidado):** Módulo opcional para visualizar a performance somada de todo o ecossistema de contas gerenciadas.

---

## 4. MÉTRICAS E INTELIGÊNCIA DE DECISÃO
### A. Performance e Conteúdo
* **Métricas de Alcance:** Visualização de Alcance vs. Impressões (público novo vs. recorrente).
* **Engajamento Qualificado:** Ranking de posts por salvamentos e compartilhamentos.
* **Retenção de Reels:** Monitoramento da eficácia de vídeos curtos.
* **Tagging de Temas:** Classificar posts por categorias (Dicas, Bastidores, Vendas) para entender qual tema performa melhor por período.

### B. Comportamento da Audiência
* **Heatmap de Interação:** Cruzamento de horários em que o público está online vs. horários que geraram mais engajamento real.
* **Demografia:** Localização, idade e gênero por conta selecionada.

---

## 5. DIFERENCIAIS DE ANÁLISE (INSIGHTS)
* **Anotações de Contexto:** Possibilidade de marcar datas no gráfico (Ex: "Inauguração", "Feriado", "Campanha de Tráfego Pago").
* **Identificador de Anomalias:** Alertas visuais para posts que fugiram da curva média de performance.
* **Eficiência de Horário:** Cálculo automático dos 3 melhores horários para postagem baseados no histórico recente.

---

## 6. REQUISITOS TÉCNICOS E INFRAESTRUTURA
* **Fonte de Dados:** Integração via Instagram Graph API (Meta for Developers).
* **Armazenamento (Data Warehouse):** Banco de dados próprio (ex: PostgreSQL) para garantir que o histórico não expire e pertença ao usuário.
* **Exportação:** Opção de exportar os dados filtrados em formatos abertos (CSV, JSON).
* **Segurança:** Autenticação centralizada para gerenciar os tokens de acesso de cada conta.

---

**STATUS ATUAL:** Fase 1 - Levantamento de Requisitos (Finalizado/Em Validação).