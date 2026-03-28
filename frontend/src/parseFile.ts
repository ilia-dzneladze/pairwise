import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Point pdfjs to its worker bundled by Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'pdf') {
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    const pages: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      pages.push(content.items.map((item: any) => item.str).join(' '))
    }
    return pages.join('\n')
  }

  if (ext === 'docx') {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
  }

  throw new Error('Unsupported file type. Please upload a .pdf or .docx file.')
}
