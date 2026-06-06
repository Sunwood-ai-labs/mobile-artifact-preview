#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { cwd } from 'node:process';

const args = process.argv.slice(2);
let outputArg = null;
let titleArg = null;
const inputs = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--output') {
    outputArg = args[index + 1];
    index += 1;
  } else if (arg === '--title') {
    titleArg = args[index + 1];
    index += 1;
  } else {
    inputs.push(arg);
  }
}

if (inputs.length === 0) {
  console.error('Usage: node scripts/render-markdown-preview.mjs <file.md> [more.md] [--output preview.html] [--title "Preview"]');
  process.exit(1);
}

if (outputArg && inputs.length !== 1) {
  console.error('--output can only be used with a single input file.');
  process.exit(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderTextPreservingHtml(value) {
  const htmlTagPattern = /(<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>)/g;
  const parts = String(value).split(htmlTagPattern);
  return parts.map((part) => {
    if (!part) return '';
    if (htmlTagPattern.test(part)) {
      htmlTagPattern.lastIndex = 0;
      return part;
    }
    htmlTagPattern.lastIndex = 0;
    const escaped = escapeHtml(part);
    return escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  }).join('');
}

function inlineMarkdown(value) {
  const parts = String(value).split(/(`[^`]*`)/g);
  return parts.map((part) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
    }
    return renderTextPreservingHtml(part)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }).join('');
}

function renderImageBlock(line) {
  const match = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line.trim());
  if (!match) return null;
  const [, alt, src] = match;
  return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
}

function isRawHtmlBlock(line) {
  return /^\s*<\/?(address|article|aside|blockquote|br|details|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|iframe|img|main|mark|nav|ol|p|pre|section|span|style|summary|table|tbody|td|tfoot|th|thead|tr|ul)\b/i.test(line);
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const content = paragraph.join(' ');
    const image = renderImageBlock(content);
    html += image ? `${image}\n` : `<p>${inlineMarkdown(content)}</p>\n`;
    paragraph = [];
  };

  const flushList = () => {
    if (list.length === 0) return;
    html += `<ul>\n${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('\n')}\n</ul>\n`;
    list = [];
  };

  const flushCode = () => {
    if (code.length === 0) return;
    html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>\n`;
    code = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');

    if (line.startsWith('```')) {
      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length, 3);
      html += `<h${level}>${inlineMarkdown(heading[2])}</h${level}>\n`;
      continue;
    }

    const listItem = /^-\s+(.+)$/.exec(line);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }

    if (isRawHtmlBlock(line)) {
      flushParagraph();
      flushList();
      html += `${line}\n`;
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushCode();
  return html;
}

function shell(title, subtitle, body) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root{color-scheme:dark;--bg:#0f1420;--panel:#151c2b;--text:#f5f7fb;--muted:#a8b2c6;--line:#2a3448;--accent:#6ee7b7;--link:#93c5fd}
*{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;line-height:1.72} main{width:min(760px,100%);margin:auto;padding:24px 18px 56px} h1{font-size:clamp(30px,8vw,48px);line-height:1.08;margin:16px 0 22px;letter-spacing:0} h2{font-size:26px;line-height:1.25;margin:42px 0 12px;padding-top:4px;border-top:1px solid var(--line)} h3{font-size:20px;margin:28px 0 10px} p,li{font-size:17px} a{color:var(--link);overflow-wrap:anywhere} code{background:#20283a;border:1px solid var(--line);border-radius:5px;padding:.08em .35em} pre{overflow:auto;background:#101827;border:1px solid var(--line);border-radius:8px;padding:14px} ul{padding-left:1.3rem} figure{margin:26px 0;padding:10px;background:var(--panel);border:1px solid var(--line);border-radius:8px} img{display:block;max-width:100%;height:auto;border-radius:6px} figcaption{color:var(--muted);font-size:13px;margin-top:8px}.badge{display:inline-flex;gap:8px;align-items:center;color:#062016;background:var(--accent);font-weight:700;border-radius:999px;padding:6px 11px;margin-bottom:10px}.meta{color:var(--muted);font-size:14px;border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:22px}.html-note{color:var(--muted);font-size:13px;margin:0 0 10px}
</style>
</head>
<body><main><div class="badge">Read-only mobile preview</div><div class="meta">${escapeHtml(subtitle)}</div>${body}</main></body>
</html>`;
}

async function renderOne(input) {
  const inputPath = resolve(cwd(), input);
  const source = await readFile(inputPath, 'utf8');
  const outputPath = outputArg ? resolve(cwd(), outputArg) : `${inputPath}.html`;
  const title = titleArg || source.match(/^#\s+(.+)$/m)?.[1] || basename(inputPath);
  const subtitle = `Generated from ${relative(dirname(outputPath), inputPath)}. Raw HTML inside trusted Markdown is preserved.`;
  const html = shell(title, subtitle, renderMarkdown(source));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
  return outputPath;
}

const outputs = [];
for (const input of inputs) {
  outputs.push(await renderOne(input));
}
console.log(outputs.join('\n'));
