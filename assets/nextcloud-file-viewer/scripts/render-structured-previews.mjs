#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const inputArgs = process.argv.slice(2);
const defaultInputs = [
  'sample-gallery/render-check.json',
  'sample-gallery/render-check.xml',
];
const inputs = inputArgs.length > 0 ? inputArgs : defaultInputs;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderJsonNode(value, key = null) {
  const keyLabel = key === null ? '' : `<span class="key">${escapeHtml(key)}</span><span class="colon">: </span>`;
  if (Array.isArray(value)) {
    const items = value.map((item, index) => `<li>${renderJsonNode(item, index)}</li>`).join('');
    return `${keyLabel}<details open><summary><span class="type">Array</span> <span class="count">${value.length} items</span></summary><ol>${items}</ol></details>`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([entryKey, entryValue]) => `<li>${renderJsonNode(entryValue, entryKey)}</li>`)
      .join('');
    return `${keyLabel}<details open><summary><span class="type">Object</span> <span class="count">${Object.keys(value).length} keys</span></summary><ul>${entries}</ul></details>`;
  }
  const valueClass = value === null ? 'null' : typeof value;
  return `${keyLabel}<span class="value ${valueClass}">${escapeHtml(JSON.stringify(value))}</span>`;
}

function formatXml(xml) {
  const compact = xml.replace(/>\s+</g, '><').trim();
  const tokens = compact.replace(/(>)(<)(\/*)/g, '$1\n$2$3').split('\n');
  let indent = 0;
  return tokens.map((line) => {
    if (/^<\//.test(line)) indent = Math.max(indent - 1, 0);
    const rendered = `${'  '.repeat(indent)}${line}`;
    if (/^<[^!?/][^>]*[^/]>\s*$/.test(line) && !/^<[^>]+>.*<\/[^>]+>$/.test(line)) {
      indent += 1;
    }
    return rendered;
  }).join('\n');
}

function shell(title, subtitle, body) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #101624;
        --panel: #171f2e;
        --line: #2a3448;
        --text: #f7f9fc;
        --muted: #9aa7bd;
        --key: #80c7ff;
        --string: #95e6a3;
        --number: #ffd37a;
        --boolean: #ff9bb7;
        --null: #b9a7ff;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      main {
        width: min(1120px, 100%);
        margin: 0 auto;
        padding: 28px 18px 56px;
      }
      header {
        margin-bottom: 18px;
        border-bottom: 1px solid var(--line);
        padding-bottom: 16px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: clamp(28px, 6vw, 46px);
        line-height: 1.05;
      }
      .subtitle {
        margin: 0;
        color: var(--muted);
        font-size: 16px;
        overflow-wrap: anywhere;
      }
      .panel {
        border: 1px solid var(--line);
        background: var(--panel);
        border-radius: 8px;
        padding: 18px;
        overflow: auto;
      }
      details { margin: 4px 0; }
      summary {
        cursor: pointer;
        color: var(--muted);
        min-height: 28px;
      }
      ul, ol {
        margin: 6px 0 6px 18px;
        padding-left: 16px;
        border-left: 1px solid var(--line);
      }
      li { margin: 6px 0; }
      .key { color: var(--key); font-weight: 700; }
      .colon, .count, .type { color: var(--muted); }
      .value.string { color: var(--string); }
      .value.number { color: var(--number); }
      .value.boolean { color: var(--boolean); }
      .value.null { color: var(--null); }
      pre {
        margin: 0;
        white-space: pre;
        min-width: max-content;
        font: 13px/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      code { color: #d7e4f7; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${escapeHtml(title)}</h1>
        <p class="subtitle">${escapeHtml(subtitle)}</p>
      </header>
      <section class="panel">${body}</section>
    </main>
  </body>
</html>`;
}

async function renderOne(input) {
  const absoluteInput = input.startsWith('/') ? input : join(root, input);
  const source = await readFile(absoluteInput, 'utf8');
  const ext = extname(absoluteInput).toLowerCase();
  const output = `${absoluteInput}.html`;
  let html;

  if (ext === '.json') {
    const parsed = JSON.parse(source);
    html = shell('JSON Preview', relative(root, absoluteInput), renderJsonNode(parsed));
  } else if (ext === '.xml') {
    html = shell('XML Preview', relative(root, absoluteInput), `<pre><code>${escapeHtml(formatXml(source))}</code></pre>`);
  } else {
    throw new Error(`Unsupported extension: ${ext}`);
  }

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, 'utf8');
  return output;
}

const outputs = [];
for (const input of inputs) {
  outputs.push(await renderOne(input));
}
console.log(outputs.join('\n'));
