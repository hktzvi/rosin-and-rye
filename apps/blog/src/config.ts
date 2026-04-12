import type { StandaloneAppDescription } from "xmlui";
import { createHighlighterCoreSync, type DecorationItem } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
// @ts-ignore
import js from "@shikijs/langs/javascript";
// @ts-ignore
import scss from "@shikijs/langs/scss";
// @ts-ignore
import css from "@shikijs/langs/css";
// @ts-ignore
import json from "@shikijs/langs/json";

// @ts-ignore
import html from "@shikijs/langs/html";

import { xmluiGrammar, xmluiThemeLight, xmluiThemeDark } from "xmlui/syntax/textmate";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import stripMarkdown from "strip-markdown";

export function markdownToPlainText(markdown: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(stripMarkdown, { keep: ["code"] })
    .use(remarkStringify);

  const file = processor.processSync(markdown);

  let cleanedText = String(file);

  cleanedText = cleanedText.replace(/\\?\[!\w+\]\s*/g, "");
  cleanedText = cleanedText.replace(/\s*\\\[#.*?\]/g, "");

  const lines = cleanedText.split("\n");
  const reformattedLines = lines.map((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.match(/^\|(?:\s*---\s*\|)+$/)) {
      return null;
    }
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      return trimmedLine
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim())
        .join(" - ");
    }

    if (trimmedLine.startsWith("```") || trimmedLine.startsWith("---")) {
      return null;
    }
    return line;
  });

  cleanedText = reformattedLines.filter((line) => line !== null).join("\n");
  cleanedText = cleanedText.replace(/(\r\n|\n){3,}/g, "\n\n");

  return cleanedText.trim();
}

// --- Post auto-discovery from /public/blog/*.md frontmatter ---

// @ts-ignore
const markdownFiles: Record<string, any> = import.meta.glob("/public/blog/*.md", {
  eager: true,
  query: "?raw",
});

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) fm[m[1]] = m[2];
  }
  return fm;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  displayDate: string;
  youtube: string;
  draft: boolean;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatPostDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(d).padStart(2, "0")}, ${y}`;
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

// postBodies: slug → markdown body without frontmatter
export const postBodies: Record<string, string> = {};

export const posts: PostMeta[] = Object.entries(markdownFiles)
  .map(([path, mod]: [string, any]) => {
    const raw = mod.default as string;
    const fm = parseFrontmatter(raw);
    const slug = fm.slug ?? path.replace("/public/blog/", "").replace(".md", "");
    postBodies[slug] = stripFrontmatter(raw);
    return {
      slug,
      title: fm.title ?? slug,
      description: fm.description ?? "",
      author: fm.author ?? "",
      date: fm.date ?? "",
      displayDate: formatPostDate(fm.date ?? ""),
      youtube: fm.youtube ?? "",
      draft: fm.draft === "true",
    };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => Date.parse(b.date.replace(/-/g, "/")) - Date.parse(a.date.replace(/-/g, "/")));

// --- Search index ---

const plainTextContent = posts.map((post) => ({
  path: `/blog/${post.slug}`,
  title: post.title,
  content: markdownToPlainText(postBodies[post.slug] ?? ""),
}));

const shikiHighlighter = createHighlighterCoreSync({
  // @ts-ignore
  langs: [js, json, html, xmluiGrammar, css, scss],
  // @ts-ignore
  themes: [xmluiThemeLight, xmluiThemeDark],
  engine: createJavaScriptRegexEngine(),
});

function highlight(
  code: string,
  lang: string,
  meta?: Record<string, any>,
  themeTone: "dark" | "light" = "light",
) {
  if (!code) return "";
  if (!themeTone) themeTone = "light";
  if (!["dark", "light"].includes(themeTone)) {
    themeTone = "light";
  }

  const highlightedRows: DecorationItem[] =
    meta?.highlightRows?.map((row: DecorationItem) => {
      return {
        start: row.start,
        end: row.end,
        properties: row.properties,
      };
    }) ?? [];

  const highlightedSubstrings: DecorationItem[] =
    [...(meta?.highlightSubstringsEmphasized ?? []), ...(meta?.highlightSubstrings ?? [])]?.map(
      (str: DecorationItem) => {
        return {
          start: str.start,
          end: str.end,
          properties: str.properties,
        };
      },
    ) ?? [];

  const opts = {
    lang,
    theme: `xmlui-${themeTone}`,
    decorations: [...highlightedRows, ...highlightedSubstrings],
  };
  return shikiHighlighter.codeToHtml(code, opts);
}

const App: StandaloneAppDescription = {
  name: "Rosin & Rye",
  defaultTheme: "rosin-and-rye",
  themes: [
    {
      id: "rosin-and-rye",
      name: "Rosin & Rye",
      extends: "xmlui-blog",

      tones: {
        light: {
          themeVars: {
            "color-surface": "hsl(42, 10%, 97%)",
            "backgroundColor": "hsl(42, 10%, 97%)",
            "backgroundColor-content-App": "hsl(42, 10%, 97%)",
            "backgroundColor-AppHeader": "hsl(42, 10%, 97%)",
            "maxWidth-content-App": "600px",
            "color-surface-200": "hsl(0, 0%, 82%)",
            "color-surface-300": "hsl(0, 0%, 74%)",
            "color-surface-400": "hsl(0, 0%, 65%)",
            "color-surface-500": "hsl(0, 0%, 52%)",
            "color-surface-600": "hsl(0, 0%, 45%)",
            "color-secondary": "hsl(48, 6%, 73%)",
            "height-AppHeader": "auto",
            "paddingVertical-AppHeader": "$space-4",
            "maxWidth-AppHeader": "$maxWidth-content-App",
          },
        },
      },
    },
  ],
  resources: {
    favicon: "/resources/favicon.ico",
    "icon.rss": "/resources/icons/rss.svg",
  },
  appGlobals: {
    useHashBasedRouting: false,
    showHeadingAnchors: true,
    searchIndexEnabled: true,
    posts,
    postBodies,
    plainTextContent,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    lintSeverity: "skip",
  },
};

export default App;
