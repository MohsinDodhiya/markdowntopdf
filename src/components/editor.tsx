'use client'

import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  const handleChange = useCallback((value: string) => {
    onChange(value)
  }, [onChange])

  return (
    <CodeMirror
      value={value}
      height="100%"
      width="100%"
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorView.lineWrapping,
      ]}
      onChange={handleChange}
      theme={vscodeDark}
    />
  )
}

