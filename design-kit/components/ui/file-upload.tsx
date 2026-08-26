import * as React from "react"
import { Upload, File as FileIcon, X, Image as ImageIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { useGlass } from "../../lib/glass-context"
import { Button } from "../../components/ui/button"

/* ── FileUploadButton — trigger + hidden input ───────────────────── */
export interface FileUploadButtonProps {
  onFiles?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label?: string
  disabled?: boolean
  className?: string
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFiles, accept, multiple, label = "Wybierz plik", disabled, className,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files) onFiles?.(Array.from(e.target.files))
          e.target.value = ""
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn("gap-2", className)}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" /> {label}
      </Button>
    </>
  )
}

/* ── FileDropzone — drag & drop area ─────────────────────────────── */
export interface FileDropzoneProps {
  onFiles?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  hint?: string
  className?: string
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFiles, accept, multiple, disabled, hint = "PNG, JPG do 10MB", className,
}) => {
  const { isGlass } = useGlass()
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click() }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (disabled) return
        onFiles?.(Array.from(e.dataTransfer.files))
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer",
        "transition-colors duration-200",
        dragging ? "border-primary bg-primary/[0.06]" : "border-border hover:border-border/70",
        disabled && "pointer-events-none opacity-50",
        isGlass && "nb-szklo",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files) onFiles?.(Array.from(e.target.files))
          e.target.value = ""
        }}
      />
      <span className="flex h-10 w-10 items-center justify-center rounded-xl nb-wglobienie-gnizado text-foreground/60">
        <Upload className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-foreground">
        Przeciągnij plik tutaj <span className="text-primary">lub kliknij</span>
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

/* ── FileList — preview listy wgranych plików ────────────────────── */
export interface UploadedFile {
  name: string
  size?: number
  progress?: number
}

export interface FileListProps {
  files: UploadedFile[]
  onRemove?: (index: number) => void
  className?: string
}

function formatSize(bytes?: number) {
  if (!bytes) return ""
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, className }) => (
  <div className={cn("flex flex-col gap-2", className)}>
    {files.map((f, i) => {
      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name)
      return (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg nb-wglobienie-gnizado text-foreground/60">
            {isImage ? <ImageIcon className="h-4 w-4" /> : <FileIcon className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
            {f.progress !== undefined && f.progress < 100 ? (
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted/60">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${f.progress}%` }} />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
            )}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="rounded-full p-1 text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )
    })}
  </div>
)
