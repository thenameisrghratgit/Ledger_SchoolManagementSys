import { AlertTriangle } from 'lucide-react'
import Button from '../ui/Button.jsx'

export default function ConfirmDialog({ title, description, confirmLabel = 'Delete', onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-surface-card p-6 shadow-card-hover">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <AlertTriangle size={20} strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[16px] font-semibold text-text">{title}</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" className="!w-auto px-5" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            className="!w-auto border-rose-500 bg-rose-500 px-5 hover:border-rose-600 hover:bg-rose-600"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
