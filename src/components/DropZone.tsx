import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  busy?: boolean
}

export function DropZone({ onFiles, busy = false }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (busy) return
    onFiles(Array.from(e.dataTransfer.files))
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      className={[
        'flex cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed px-7 py-11 text-center transition-colors',
        isDragging ? 'border-accent bg-accent/5' : 'border-line bg-surface-2 hover:border-ink-muted',
        busy ? 'pointer-events-none opacity-60' : '',
      ].join(' ')}
    >
      <input ref={inputRef} type="file" accept=".zip,.csv" multiple className="hidden" onChange={handleInputChange} />
      <p className="text-base font-medium text-ink">{busy ? 'Importing…' : 'Drop your WHOOP export here'}</p>
      <p className="mt-2 font-mono text-[12.5px] text-ink-muted">.zip or .csv &nbsp;·&nbsp; or click to browse</p>
    </div>
  )
}
