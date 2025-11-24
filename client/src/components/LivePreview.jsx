"use client";

import { useEffect, useRef, useState } from "react";
import "../styles/live-preview.css";

export default function LivePreview({ files = [] }) {
  const iframeRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[LivePreview] Files:", files);
    renderPreview();
  }, [files]);

  // 🔥 FIXED SAFE SANITIZER
  const sanitize = (code = "") => {
    if (!code) return "";
    return code
      .replace(/```(?:html|css|js|javascript)?/gi, "")
      .replace(/```/g, "")
      .replace(/<\|.*?\|>/g, "")
      .replace(/<\uFF5C.*?\uFF5C>/g, "")
      .trim();
  };

  // auto-create missing onclick functions
  const fixMissingFunctions = (html, js) => {
    const missing = new Set();
    const onclickRegex = /onclick="(.*?)\(/g;
    let match;

    while ((match = onclickRegex.exec(html)) !== null) {
      const fn = match[1];
      if (!js.includes(`function ${fn}`)) {
        missing.add(fn);
      }
    }

    let updated = js;
    missing.forEach((fn) => {
      updated += `\nfunction ${fn}(){ console.log("${fn}() auto-created"); }\n`;
    });

    return updated;
  };

  const renderPreview = () => {
    try {
      const htmlFile = files.find((f) => f.language === "html");
      const cssFile = files.find((f) => f.language === "css");
      const jsFile = files.find(
        (f) => f.language === "javascript" || f.language === "jsx"
      );

      if (!htmlFile) {
        setError("No HTML found");
        return;
      }

      let html = sanitize(htmlFile.content);
      const css = sanitize(cssFile?.content || "");
      let js = sanitize(jsFile?.content || "");

      if (!html.trim()) {
        setError("HTML content empty after sanitize()");
        return;
      }

      if (!js.trim()) {
        js = "console.log('JS Loaded');";
      }

      js = fixMissingFunctions(html, js);

      // remove script tags from HTML
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

      const finalHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${css}</style>
</head>
<body>
${html}
<script>
try {
  ${js}
} catch (err) {
  console.error(err);
}
</script>
</body>
</html>
`;

      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(finalHTML);
      doc.close();

      setError("");

    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  return (
    <div className="live-preview">
      {error && <div className="preview-error">{error}</div>}
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
