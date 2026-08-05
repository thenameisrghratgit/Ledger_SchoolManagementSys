import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, X } from 'lucide-react'

export default function FileUpload({ label = 'Profile Picture', className = '' }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleFile = (file) => {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const clear = (e) => {
    e.stopPropagation()
    setPreview(null)
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <motion.div
        whileHover={{ y: -1 }}
        onClick={() => inputRef.current?.click()}
        className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-ink-200 bg-white/70 p-3 transition-colors hover:border-royal-300 hover:bg-royal-50/40"
      >
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-50 ring-1 ring-inset ring-ink-100">
          {preview ? (
            <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <Camera size={20} className="text-ink-300" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-700">
            {fileName || 'Upload a photo'}
          </p>
          <p className="text-xs text-ink-400">PNG or JPG, up to 5MB</p>
        </div>
        {fileName && (
          <button
            type="button"
            onClick={clear}
            aria-label="Remove file"
            className="focus-ring rounded-full p-1.5 text-ink-300 hover:bg-ink-100 hover:text-ink-600"
          >
            <X size={16} />
          </button>
        )}
      </motion.div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
