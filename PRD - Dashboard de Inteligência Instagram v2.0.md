# **Product Requirements Document (PRD): Dashboard de Inteligência Instagram**

**Versão:** 2.0  
**Status:** Planejamento / Em Atualização  
**Responsável:** Bruno Mourão

## 

1\. Visão Geral do Produto

O objetivo deste produto é consolidar uma ferramenta centralizada para gestão de múltiplas contas do Instagram, focada em análise profunda de dados e suporte à tomada de decisão estratégica. A solução visa superar as limitações do aplicativo nativo, oferecendo histórico persistente, cruzamento de dados inteligentes e acesso multiplataforma via web (desktop e mobile/iPhone).

## 

2\. Objetivos de Negócio

* **Eficiência Operacional:** Reduzir o tempo de alternância entre contas para análise de resultados.  
* **Otimização de Conteúdo:** Identificar com precisão quais temas e horários geram maior retorno real (engajamento e conversão).  
* **Independência de Dados:** Manter um banco de dados próprio para análises históricas de longo prazo, sem as restrições de tempo da API nativa.  
* **Mobilidade:** Permitir o acompanhamento e registro de insights em tempo real via iPhone.

## 

3\. Requisitos Funcionais

### **3.1. Gestão de Contas (Multitenancy)**

| ID | Requisito | Descrição |
| :---- | :---- | :---- |
| RF01 | Seletor de Perfil | Menu global para alternar entre as contas conectadas (Ex: Restaurante, Perfil Pessoal, Clientes). |
| RF02 | Visão Consolidada | Dashboard resumo que soma métricas principais de todas as contas ativas. |

### **3.2. Controle Temporal e Filtros**

* **Filtros Rápidos:** Seleção pré-definida para 24h, 7 dias, 15 dias e 30 dias.  
* **Range Customizado:** Seleção via calendário para períodos específicos.  
* **Comparação:** Funcionalidade para comparar o período atual com o período anterior.

### **3.3. Análise e Insights**

* **Heatmap de Postagem:** Visualização de densidade de engajamento por dia/hora.  
* **Tagging System:** Classificação manual ou por keywords de posts (Ex: "Promoção", "Dica", "Meme").  
* **Anotações de Contexto:** Campo para inserir eventos externos nos gráficos (Ex: "Black Friday", "Evento Local").  
* **Input Rápido Mobile:** Botão flutuante para inserção imediata de notas de contexto via iPhone.

## 

4\. Requisitos Não Funcionais

* **Acesso Multiplataforma:** Interface responsiva compatível com navegadores desktop e Safari (iPhone).  
* **Segurança:** Armazenamento criptografado de tokens de acesso da Graph API.  
* **Performance:** Carregamento dos gráficos em menos de 3 segundos após a troca de filtro.  
* **Portabilidade:** Exportação de dados em formatos CSV e JSON.

## 

5\. Stack Tecnológica

* **Frontend:** React ou Streamlit (Mobile-First / PWA).  
* **Backend/Automação:** Google Stitch para orquestração de fluxos e integração com a API.  
* **Banco de Dados:** Neon (PostgreSQL Serverless) para armazenamento persistente.  
* **Integração:** Instagram Graph API (Facebook for Developers).

## 

6\. Modelagem de Dados Sugerida (Neon)

* **Tabela 'accounts':** Armazena as configurações e tokens de cada perfil do Instagram.  
* **Tabela 'metrics\_history':** Histórico persistente de métricas para análises temporais.  
* **Tabela 'content\_tags':** Relacionamento entre posts e suas categorias (Dicas, Vendas, etc).  
* **Tabela 'context\_notes':** Registro de eventos externos vinculados a datas específicas.

## 

7\. Roadmap de Desenvolvimento

1. Configuração de conta de desenvolvedor na Meta e autorização de tokens.  
2. Estruturação das tabelas no Neon e criação do fluxo de ETL via Google Stitch.  
3. Desenvolvimento da interface responsiva focada no seletor de contas e filtros.  
4. Implementação das visualizações de Heatmap e módulo de anotações mobile.