"use client"

import { useEffect, useRef } from "react"
import "../styles/code-editor.css"

/**
 * Simple code editor component using textarea with syntax highlighting
 * For production, consider using Monaco Editor or CodeMirror
 */
export default function CodeEditor({ file, readOnly = false, onChange = null }) {
  const textareaRef = useRef(null)
  const highlightRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current && highlightRef.current) {
      const textarea = textareaRef.current
      textarea.addEventListener("scroll", syncScroll)
      textarea.addEventListener("input", syncScroll)

      return () => {
        textarea.removeEventListener("scroll", syncScroll)
        textarea.removeEventListener("input", syncScroll)
      }
    }
  }, [])

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
    syncScroll()
  }

  const getLineNumbers = () => {
    const lines = (file?.content || "").split("\n").length
    return Array.from({ length: lines }, (_, i) => i + 1).join("\n")
  }

  return (
    <div className="code-editor">
      <div className="editor-content">
        <div className="line-numbers">
          <pre>{getLineNumbers()}</pre>
        </div>
        <div className="editor-input-wrapper">
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={file?.content || ""}
            onChange={handleChange}
            readOnly={readOnly}
            spellCheck="false"
          />
          <pre className="editor-highlight">
            <code>{file?.content || ""}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
