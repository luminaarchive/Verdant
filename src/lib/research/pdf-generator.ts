import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { renderReportTemplate, type ReportSection } from './report-template'
import type { ResearchResult } from './schema'

const PAGE = { width: 595, height: 842 } // A4 points
const MARGIN = 48
const LINE_HEIGHT = 16
const FONT_SIZE = 11

function normalizeForPdf(text: string): string {
  return text
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    .replace(/₀/g, '0')
    .replace(/–|—/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
}

function sectionToText(section: ReportSection): string[] {
  switch (section.type) {
    case 'title':
      return [section.content ?? '']
    case 'heading':
      return [section.level === 2 ? `\n${section.content ?? ''}` : `\n${section.content ?? ''}`]
    case 'paragraph':
      return [section.content ?? '']
    case 'bullets':
      return (section.items ?? []).map((item) => `- ${item}`)
    case 'stat':
      return [`${section.value ?? ''}  ${section.label ?? ''}`]
    case 'metadata':
      return [`${section.label ?? ''}: ${section.value ?? ''}`]
    case 'evidence':
      if (!section.evidence) return []
      return [
        `Claim: ${section.evidence.claim}`,
        `Evidence: ${section.evidence.evidence}`,
        section.source ? `Source [${(section.sourceIndex ?? 0) + 1}]: ${section.source.title}` : '',
      ].filter(Boolean)
    case 'citation':
      if (!section.source) return []
      return [
        `[${(section.sourceIndex ?? 0) + 1}] ${[section.source.title, section.source.author, section.source.year].filter(Boolean).join(' · ')}${section.source.url ? ` — ${section.source.url}` : ''}`,
      ]
    case 'divider':
      return ['']
    default:
      return []
  }
}

export async function generatePdfBuffer(result: ResearchResult): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const sections = renderReportTemplate(result)
  const maxWidth = PAGE.width - MARGIN * 2
  let page = pdf.addPage([PAGE.width, PAGE.height])
  let y = PAGE.height - MARGIN

  const writeLine = (line: string, isHeading = false) => {
    const activeFont = isHeading ? bold : font
    const activeSize = isHeading ? 12 : FONT_SIZE
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdf.addPage([PAGE.width, PAGE.height])
      y = PAGE.height - MARGIN
    }
    page.drawText(line, {
      x: MARGIN,
      y,
      size: activeSize,
      font: activeFont,
      color: rgb(0.1, 0.18, 0.14),
      maxWidth,
    })
    y -= LINE_HEIGHT
  }

  const wrapText = (text: string, isHeading = false): string[] => {
    if (!text) return ['']
    const safeText = normalizeForPdf(text)
    const activeFont = isHeading ? bold : font
    const activeSize = isHeading ? 12 : FONT_SIZE
    const words = safeText.split(/\s+/)
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (activeFont.widthOfTextAtSize(next, activeSize) <= maxWidth) {
        current = next
      } else {
        if (current) lines.push(current)
        current = word
      }
    }
    if (current) lines.push(current)
    return lines.length > 0 ? lines : ['']
  }

  for (const section of sections) {
    const lines = sectionToText(section)
    const isHeading = section.type === 'title' || section.type === 'heading'
    for (const line of lines) {
      const wrapped = wrapText(line, isHeading)
      for (const wrapLine of wrapped) writeLine(wrapLine, isHeading)
    }
    y -= 4
  }

  return Buffer.from(await pdf.save())
}
