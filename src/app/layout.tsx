import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from "@/components/ui/toast"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Markdown to PDF Converter',
  description: 'Convert your Markdown files to PDF easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

