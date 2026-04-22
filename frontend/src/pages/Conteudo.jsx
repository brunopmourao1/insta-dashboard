import { useState } from 'react'
import { Film, LayoutGrid, Rows3, Plus, PenLine } from 'lucide-react'
import clsx from 'clsx'
import PeriodFilter from '../components/ui/PeriodFilter'
import AccountSelector from '../components/ui/AccountSelector'
import ReachAreaChart from '../components/charts/ReachAreaChart'
import TagsPieChart from '../components/charts/TagsPieChart'
import { useAccounts, useMetrics, useTagsSummary, useNotes, useCreateNote, useTopPosts } from '../hooks/useApi'
import { useFilter } from '../contexts/FilterContext'

const TYPE_ICON = { Reels: Film, Carrossel: LayoutGrid, Post: Rows3 }
const tabs = ['Overview', 'Reels', 'Carrosséis']

const TAG_COLORS = ['#ffafd2', '#e3b5ff', '#ffb1c0', '#564149', '#c13584', '#cb80fe', '#6c209e', '#b14c66']

function PostRow({ post, rank }) {
  const Icon = TYPE_ICON[post.type] || Rows3
  return (
    <div className="flex items-center gap-4 py-3 border-b border-outline-variant/10 last:border-0">
      <span className="font-display text-sm font-bold text-on-surface-variant w-5 text-center">
        {String(rank).padStart(2, '0')}
      </span>
      <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface font-medium truncate">{post.title}</p>
        <p className="text-xs text-on-surface-variant">
          {post.type} · {new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-on-surface-variant">Eng. Rate</p>
        <p className="font-display text-sm font-bold text-primary">{post.engagementRate}%</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-on-surface-variant">Likes</p>
        <p className="font-display text-sm font-semibold text-on-surface">
          {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
        </p>
      </div>
    </div>
  )
}

function AnnotationModal({ onClose, accountId }) {
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('geral')
  const createNote = useCreateNote()

  async function handleSave() {
    if (!note.trim()) return
    await createNote.mutateAsync({ account_id: accountId, date, note, category })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-surface/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-high border border-outline-variant/20 rounded-2xl p-6 w-full max-w-sm shadow-ambient">
        <div className="flex items-center gap-2 mb-5">
          <PenLine size={16} className="text-primary" />
          <h3 className="font-display font-semibold text-on-surface">Anotar Evento</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-on-surface-variant mb-1.5 block">Data do evento</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-highest border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant mb-1.5 block">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-highest border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container transition-colors"
            >
              <option value="geral">Geral</option>
              <option value="campanha">Campanha</option>
              <option value="promoção">Promoção</option>
              <option value="feriado">Feriado</option>
              <option value="parceria">Parceria</option>
              <option value="lançamento">Lançamento</option>
              <option value="evento">Evento</option>
              <option value="tráfego">Tráfego Pago</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-on-surface-variant mb-1.5 block">Descreva o evento</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Black Friday, Lançamento do produto..."
              rows={3}
              className="w-full bg-surface-highest border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary-container transition-colors resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-on-surface-variant border border-outline-variant/20 hover:bg-surface-highest transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={createNote.isPending || !note.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-medium text-on-primary gradient-primary hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {createNote.isPending ? 'Salvando...' : 'Salvar Anotação'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Conteudo() {
  const { data: accounts = [] } = useAccounts()
  const [accountId, setAccountId] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showAnnotation, setShowAnnotation] = useState(false)

  const currentId = accountId || accounts[0]?.id

  const { getDateRange } = useFilter()
  const range = getDateRange()

  const { data: metrics = [] }                         = useMetrics(currentId, range.from, range.to)
  const { data: tagsSummary = [] }                     = useTagsSummary(currentId)
  const { data: notes = [] }                           = useNotes(currentId, range.from, range.to)
  const { data: topPosts = [], isLoading: postsLoading } = useTopPosts(currentId)

  const filteredPosts = activeTab === 'Reels'
    ? topPosts.filter((p) => p.type === 'Reels')
    : activeTab === 'Carrosséis'
    ? topPosts.filter((p) => p.type === 'Carrossel')
    : topPosts

  // Transforma métricas do banco em formato do gráfico
  const reachTimeline = metrics.map((m, i) => ({
    day: i + 1,
    reach: m.reach || 0,
    impressions: m.impressions || 0,
  })).reverse()

  // Transforma tags em formato do PieChart
  const tagsPie = tagsSummary.map((t, i) => ({
    tag: t.tag,
    value: t.count,
    color: TAG_COLORS[i % TAG_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      {showAnnotation && <AnnotationModal onClose={() => setShowAnnotation(false)} accountId={currentId} />}

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Análise de Conteúdo</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Performance por post, temas e janelas de publicação ideais.
          </p>
        </div>
        <AccountSelector value={currentId} onChange={setAccountId} />
      </div>

      <PeriodFilter />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-low rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab
                ? 'gradient-primary text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top Posts + Tagging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-low rounded-xl p-4 md:p-5 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-on-surface">Top Performing Posts</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Ordenado por high-intent actions</p>
            </div>
          </div>
          {postsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-surface-highest rounded-lg animate-pulse" />)}
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, i) => <PostRow key={post.id} post={post} rank={i + 1} />)
          ) : (
            <p className="text-xs text-on-surface-variant py-4 text-center">
              {topPosts.length > 0 ? `Nenhum ${activeTab === 'Carrosséis' ? 'carrossel' : 'reel'} encontrado` : 'Nenhum post encontrado'}
            </p>
          )}
        </div>

        <div className="bg-surface-low rounded-xl p-4 md:p-5 border border-outline-variant/10">
          <h2 className="font-display font-semibold text-on-surface mb-4">Tagging de Temas</h2>
          {tagsPie.length > 0 ? (
            <>
              <TagsPieChart data={tagsPie} />
              <p className="text-xs text-on-surface-variant text-center mt-4">
                Performance por pilar de conteúdo
              </p>
            </>
          ) : (
            <p className="text-xs text-on-surface-variant text-center py-8">Sem tags cadastradas</p>
          )}
        </div>
      </div>

      {/* Timeline + Notas */}
      <div className="bg-surface-low rounded-xl p-4 md:p-5 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-on-surface">Timeline & Context</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Engajamento ao longo do tempo com eventos contextuais</p>
          </div>
          <button
            onClick={() => setShowAnnotation(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-on-primary gradient-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={13} />
            Anotar Evento
          </button>
        </div>
        <ReachAreaChart data={reachTimeline} />

        {/* Notas de contexto */}
        {notes.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-outline-variant/10 pt-4">
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Anotações</p>
            {notes.map((n) => (
              <div key={n.id} className="flex items-center gap-3 text-xs">
                <span className="text-on-surface-variant shrink-0">
                  {new Date(n.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-medium">
                  {n.category}
                </span>
                <span className="text-on-surface">{n.note}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
