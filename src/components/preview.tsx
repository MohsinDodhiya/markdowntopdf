"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

interface PreviewProps {
  markdown: string;
}

export function Preview({ markdown }: PreviewProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        const result = await marked.parse(markdown);
        setHtml(result as string);
      } catch (error) {
        console.error("Markdown parsing error:", error);
      }
    };

    parseMarkdown();
  }, [markdown]);

  return (
    <div className="prose prose-sm max-w-none p-4 overflow-auto h-full">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
