import { useState, useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { parseFile } from '../parseFile'

interface Props {
  onTextExtracted: (text: string) => void
}

export function FileUploader({ onTextExtracted }: Props) {
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setFileName(file.name)
    setParsing(true)
    try {
      const text = await parseFile(file)
      onTextExtracted(text)
    } catch {
      setError('Could not extract text from this file. Try pasting the bio manually.')
    } finally {
      setParsing(false)
    }
  }, [onTextExtracted])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-bmw-blue)' : 'var(--color-border)'}`,
          borderRadius: 8,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 150ms ease',
          background: dragging ? 'rgba(0, 154, 218, 0.05)' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={onChange}
          style={{ display: 'none' }}
        />
        {parsing ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Extracting text from {fileName}...
          </div>
        ) : (
          <>
            <Upload size={20} style={{ color: 'var(--color-text-muted)', marginBottom: 6 }} />
            <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Drop a PDF or DOCX here, or click to browse
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 4, opacity: 0.6 }}>
              Text will be extracted automatically
            </div>
          </>
        )}
      </div>
      {error && (
        <div style={{ color: 'var(--color-alert-red)', fontSize: 13, marginTop: 8 }}>
          {error}
        </div>
      )}
    </div>
  )
}
