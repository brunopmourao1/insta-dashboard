// Dados mock para desenvolvimento — substituir pela Graph API futuramente

export const accounts = [
  {
    id: '1',
    username: '@jaque.oficial',
    displayName: 'Jaqueline Assis',
    avatar: null,
    followers: 124500,
    isActive: true,
    tokenStatus: 'active',
  },
  {
    id: '2',
    username: '@jaque.business',
    displayName: 'Jaque Business',
    avatar: null,
    followers: 48200,
    isActive: true,
    tokenStatus: 'active',
  },
]

export const overviewMetrics = {
  totalReach: { value: 2400000, change: 12.6, label: 'Total Reach' },
  totalImpressions: { value: 8900000, change: 0.1, label: 'Total Impressions' },
  totalEngagement: { value: 4.2, change: -2.3, label: 'Engagement Rate', suffix: '%' },
}

export const accountsComparison = [
  {
    id: '1',
    username: '@jaque.oficial',
    category: 'Pessoal',
    followers: 124500,
    reach: 850000,
    engagementRate: 5.1,
  },
  {
    id: '2',
    username: '@jaque.business',
    category: 'Negócios',
    followers: 48200,
    reach: 32000,
    engagementRate: 2.8,
  },
]

export const alerts = [
  {
    id: '1',
    type: 'success',
    title: 'Pico de Alcance',
    description: 'O post de ontem está performando +40% acima da média móvel de 30 dias.',
    action: 'Ver análise detalhada',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Queda de Engajamento',
    description: 'Engajamento caiu 12 pontos percentuais nesta semana.',
    action: 'Analisar últimos posts',
  },
  {
    id: '3',
    type: 'info',
    title: 'Relatório Mensal',
    description: 'O relatório consolidado deste mês está disponível para download.',
    action: 'Baixar PDF',
  },
]

export const reachTimeline = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  reach: Math.floor(60000 + Math.random() * 40000),
  impressions: Math.floor(200000 + Math.random() * 100000),
}))

export const heatmapData = {
  days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  hours: ['Manhã\n06–12h', 'Tarde\n12–18h', 'Noite\n18–24h'],
  values: [
    [2, 4, 3, 5, 4, 2, 1],
    [3, 5, 4, 4, 5, 3, 2],
    [5, 8, 7, 9, 8, 6, 4],
  ],
}

export const audienceGender = [
  { name: 'Feminino', value: 65, color: '#ffafd2' },
  { name: 'Masculino', value: 30, color: '#e3b5ff' },
  { name: 'Outro', value: 5, color: '#564149' },
]

export const audienceAge = [
  { range: '13–17', value: 8 },
  { range: '18–24', value: 32 },
  { range: '25–34', value: 45 },
  { range: '35–44', value: 12 },
  { range: '44+', value: 3 },
]

export const topLocations = [
  { city: 'São Paulo, SP', value: 28.5 },
  { city: 'Rio de Janeiro, RJ', value: 15.2 },
  { city: 'Belo Horizonte, MG', value: 8.7 },
  { city: 'Curitiba, PR', value: 5.1 },
  { city: 'Brasília, DF', value: 4.3 },
]

export const contentTags = [
  { tag: 'Dicas & Educativo', value: 45, color: '#ffafd2' },
  { tag: 'Bastidores', value: 22, color: '#e3b5ff' },
  { tag: 'Promoção', value: 18, color: '#ffb1c0' },
  { tag: 'Entretenimento', value: 15, color: '#564149' },
]

export const reelsRetention = Array.from({ length: 30 }, (_, i) => ({
  second: i * 2,
  retention: Math.max(5, Math.round(100 * Math.exp(-i * 0.11) + (Math.random() - 0.5) * 4)),
}))

export const performanceMetrics = {
  totalReach: { value: 482904, change: 13.0, label: 'Total Reach' },
  engagementRate: { value: 4.8, change: -0.4, label: 'Engagement Rate', suffix: '%' },
  highIntentActions: { value: 12450, change: 33.6, label: 'High-Intent Actions' },
  impressions: { value: 615000, change: 8.2, label: 'Impressions' },
  avgLikes: { value: 2.48, change: -1.1, label: 'Avg Likes (K)' },
  comments: { value: 142, change: 5.9, label: 'Comments' },
}

export const hourEfficiency = [
  { time: '19:00 – 20:00', days: 'Quintas, Sextas', level: 'high' },
  { time: '12:00 – 13:00', days: 'Terças, Quartas', level: 'medium' },
  { time: '21:00 – 22:00', days: 'Sábados', level: 'medium' },
  { time: '03:00 – 10:00', days: 'Fins de Semana', level: 'low' },
]

export const topPosts = [
  {
    id: '1',
    title: 'Como estruturar um funil de vendas',
    date: '2026-04-13',
    likes: 3841,
    engagementRate: 14.2,
    type: 'Reels',
  },
  {
    id: '2',
    title: 'Rotina matinal que mudou minha vida',
    date: '2026-04-10',
    likes: 2910,
    engagementRate: 11.8,
    type: 'Carrossel',
  },
  {
    id: '3',
    title: '5 erros que todo creator comete',
    date: '2026-04-07',
    likes: 2204,
    engagementRate: 9.4,
    type: 'Reels',
  },
]
