import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { marked } from 'marked'

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json()
    const html = marked(markdown)

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // Set content and wait for network idle to ensure all assets are loaded
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Add custom styles for PDF
    await page.evaluate(() => {
      const style = document.createElement('style')
      style.textContent = `
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
        @page {
          margin: 1cm;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `
      document.head.appendChild(style)
    })

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    })

    await browser.close()

    // Set response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'attachment; filename=document.pdf')

    return new NextResponse(pdf, { status: 200, headers })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}

