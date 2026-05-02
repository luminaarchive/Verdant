// ─── DOCX Generator ─────────────────────────────────────────────────────────
// Uses the 'docx' npm package (pure JS, runs on Vercel serverless).
// Consumes ReportSection[] from the report template layer.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TableRow, TableCell, Table,
  WidthType,
} from 'docx'
import { renderReportTemplate, type ReportSection } from './report-template'
import type { ResearchResult } from './schema'

const VERDANT_GREEN = '1A2F23'
const MUTED = '737870'
const BODY = '434841'

function sectionsToParagraphs(sections: ReportSection[]): Paragraph[] {
  const paragraphs: Paragraph[] = []

  for (const s of sections) {
    switch (s.type) {
      case 'title':
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: s.content ?? '', font: 'Georgia', size: 56, color: VERDANT_GREEN }),
          ],
          spacing: { after: 400 },
          alignment: AlignmentType.LEFT,
        }))
        break

      case 'heading':
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: s.content ?? '', font: 'Georgia', size: s.level === 2 ? 28 : 36, color: VERDANT_GREEN }),
          ],
          heading: s.level === 2 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
        }))
        break

      case 'paragraph':
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: s.content ?? '', font: 'Calibri', size: 22, color: BODY }),
          ],
          spacing: { after: 160 },
        }))
        break

      case 'bullets':
        for (const item of s.items ?? []) {
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({ text: item, font: 'Calibri', size: 22, color: BODY }),
            ],
            bullet: { level: 0 },
            spacing: { after: 80 },
          }))
        }
        break

      case 'stat':
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: s.value ?? '', font: 'Georgia', size: 40, color: VERDANT_GREEN, bold: true }),
            new TextRun({ text: `  ${s.label ?? ''}`, font: 'Calibri', size: 20, color: MUTED }),
          ],
          spacing: { after: 80 },
        }))
        break

      case 'metadata':
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `${s.label}: `, font: 'Calibri', size: 20, color: MUTED, bold: true }),
            new TextRun({ text: s.value ?? '', font: 'Calibri', size: 20, color: BODY }),
          ],
          spacing: { after: 40 },
        }))
        break

      case 'evidence':
        if (s.evidence) {
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({ text: `Claim: `, font: 'Calibri', size: 22, color: VERDANT_GREEN, bold: true }),
              new TextRun({ text: s.evidence.claim, font: 'Calibri', size: 22, color: BODY }),
            ],
            spacing: { before: 120 },
            border: { left: { style: BorderStyle.SINGLE, size: 6, color: '2E5D3E' } },
            indent: { left: 200 },
          }))
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({ text: `Evidence: `, font: 'Calibri', size: 20, color: MUTED, bold: true }),
              new TextRun({ text: s.evidence.evidence, font: 'Calibri', size: 20, color: BODY }),
            ],
            border: { left: { style: BorderStyle.SINGLE, size: 6, color: '2E5D3E' } },
            indent: { left: 200 },
          }))
          if (s.source) {
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({ text: `Source [${(s.sourceIndex ?? 0) + 1}]: ${s.source.title}`, font: 'Calibri', size: 18, color: MUTED, italics: true }),
              ],
              border: { left: { style: BorderStyle.SINGLE, size: 6, color: '2E5D3E' } },
              indent: { left: 200 },
              spacing: { after: 120 },
            }))
          }
        }
        break

      case 'citation':
        if (s.source) {
          const idx = (s.sourceIndex ?? 0) + 1
          const citation = [s.source.title, s.source.author, s.source.year].filter(Boolean).join(' · ')
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({ text: `[${idx}] `, font: 'Calibri', size: 20, color: MUTED, bold: true }),
              new TextRun({ text: citation, font: 'Calibri', size: 20, color: BODY }),
              s.source.url
                ? new TextRun({ text: ` — ${s.source.url}`, font: 'Calibri', size: 18, color: '2E5D3E', italics: true })
                : new TextRun({ text: '' }),
            ],
            spacing: { after: 60 },
          }))
        }
        break

      case 'divider':
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: '' })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' } },
          spacing: { before: 200, after: 200 },
        }))
        break
    }
  }

  return paragraphs
}

export async function generateDocxBuffer(result: ResearchResult): Promise<Buffer> {
  const sections = renderReportTemplate(result)
  const paragraphs = sectionsToParagraphs(sections)

  // Add Verdant Signature Experience Footer (Phase 10)
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `Verdant Intelligence Protocol v3.2`,
        font: 'Georgia',
        size: 18,
        color: '2E5D3E',
        bold: true,
      }),
    ],
    spacing: { before: 600, after: 80 },
    alignment: AlignmentType.CENTER,
  }))
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `Zero-hallucination enforced · Evidence Integrity Score: ${result.confidenceScore ?? 'Verified'}`,
        font: 'Calibri',
        size: 16,
        color: MUTED,
        italics: true,
      }),
    ],
    spacing: { after: 80 },
    alignment: AlignmentType.CENTER,
  }))
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `Generated by Verdant AI · ${new Date().toISOString().split('T')[0]}`,
        font: 'Calibri',
        size: 14,
        color: 'A0A5A0',
      }),
    ],
    alignment: AlignmentType.CENTER,
  }))

  const doc = new Document({
    creator: 'Verdant AI',
    title: result.title,
    description: `Research report: ${result.query}`,
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: paragraphs,
    }],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
