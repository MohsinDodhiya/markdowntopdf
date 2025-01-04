'use client'

import { jsPDF } from "jspdf"
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import html2canvas from 'html2canvas'

async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown)

  return result.toString()
}

export async function generatePDF(markdown: string) {
  try {
    console.log('Converting markdown to HTML...')
    const html = await markdownToHtml(markdown)

    console.log('Creating temporary DOM element...')
    const tempElement = document.createElement('div')
    tempElement.innerHTML = `
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
        p { margin-top: 0; margin-bottom: 16px; }
        code {
          background-color: rgba(27,31,35,.05);
          border-radius: 3px;
          font-size: 85%;
          margin: 0;
          padding: .2em .4em;
        }
        pre {
          background-color: #f6f8fa;
          border-radius: 3px;
          font-size: 85%;
          line-height: 1.45;
          overflow: auto;
          padding: 16px;
        }
        blockquote {
          border-left: .25em solid #dfe2e5;
          color: #6a737d;
          padding: 0 1em;
        }
        ul, ol {
          padding-left: 2em;
        }
        table {
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        table th, table td {
          border: 1px solid #dfe2e5;
          padding: 6px 13px;
        }
        img {
          max-width: 100%;
          box-sizing: content-box;
        }
      </style>
      ${html}
    `
    document.body.appendChild(tempElement)

    console.log('Generating PDF...')
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    })

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    let heightLeft = pdfHeight
    let position = 0
    const pageHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }

    console.log('Saving PDF...')
    pdf.save('document.pdf')

    console.log('Cleaning up...')
    document.body.removeChild(tempElement)

    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

