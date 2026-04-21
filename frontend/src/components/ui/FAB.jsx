import { useState } from 'react'
import { Plus, X, PenLine, Calendar } from 'lucide-react'
import clsx from 'clsx'

function QuickNoteModal({ onClose }) {
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!note.trim()) return
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  return (
    <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface-high border border-outline-variant/20 rounded-2xl w-full max-w-sm shadow-ambient">
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <PenLine size={16} className="text-primary" />
              <h3 className="font-display font-semibold text-on-surface">Anotação Rápida</h3>
            </div>
            <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-highest transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                <Calendar size={11} />
                Data do evento
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-highest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary-container transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant mb-1.5 block">Descreva o evento ou insight</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Post sobre produto X bombou, Black Friday, Parceria com @fulano..."
                rows={3}
                autoFocus
                className="w-full bg-surface-highest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary-container transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-on-surface-variant border border-outline-variant/20 hover:bg-surface-highest transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!note.trim()}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                saved
                  ? 'bg-emerald-400/20 text-emerald-400'
                  : 'gradient-primary text-on-primary hover:opacity-90 disabled:opacity-40',
              )}
            >
              {saved ? '✓ Salvo!' : 'Salvar Anotação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && <QuickNoteModal onClose={() => setOpen(false)} />}

      {/* Visível apenas em mobile */}
      <button
        onClick={() => setOpen(true)}
        className={clsx(
          'fixed bottom-6 right-6 z-40 md:hidden',
          'w-14 h-14 rounded-full gradient-primary shadow-glow',
          'flex items-center justify-center',
          'transition-transform active:scale-95',
        )}
        aria-label="Anotação rápida"
      >
        {open ? <X size={22} className="text-on-primary" /> : <Plus size={22} className="text-on-primary" />}
      </button>
    </>
  )
}
