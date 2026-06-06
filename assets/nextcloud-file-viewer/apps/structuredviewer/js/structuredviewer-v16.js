(function() {
  'use strict';

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderJsonNode(value, key) {
    const keyLabel = key === null || key === undefined
      ? ''
      : '<span class="sv-key">' + escapeHtml(key) + '</span><span class="sv-colon">: </span>';

    if (Array.isArray(value)) {
      const items = value.map(function(item, index) {
        return '<li>' + renderJsonNode(item, String(index)) + '</li>';
      }).join('');
      return keyLabel + '<details open><summary><span class="sv-type">Array</span> <span class="sv-count">' + value.length + ' items</span></summary><ol>' + items + '</ol></details>';
    }

    if (value && typeof value === 'object') {
      const entries = Object.keys(value).map(function(entryKey) {
        return '<li>' + renderJsonNode(value[entryKey], entryKey) + '</li>';
      }).join('');
      return keyLabel + '<details open><summary><span class="sv-type">Object</span> <span class="sv-count">' + Object.keys(value).length + ' keys</span></summary><ul>' + entries + '</ul></details>';
    }

    const valueClass = value === null ? 'null' : typeof value;
    return keyLabel + '<span class="sv-value sv-' + valueClass + '">' + escapeHtml(JSON.stringify(value)) + '</span>';
  }

  function formatXml(xml) {
    const compact = xml.replace(/>\s+</g, '><').trim();
    const tokens = compact.replace(/(>)(<)(\/*)/g, '$1\n$2$3').split('\n');
    let indent = 0;
    return tokens.map(function(line) {
      if (/^<\//.test(line)) {
        indent = Math.max(indent - 1, 0);
      }
      const rendered = '  '.repeat(indent) + line;
      if (/^<[^!?/][^>]*[^/]>\s*$/.test(line) && !/^<[^>]+>.*<\/[^>]+>$/.test(line)) {
        indent += 1;
      }
      return rendered;
    }).join('\n');
  }

  function xmlNodeToObject(node) {
    if (node.nodeType === 3) {
      const text = node.nodeValue.trim();
      return text ? { type: 'text', text: text } : null;
    }

    if (node.nodeType === 7) {
      return { type: 'processing', name: node.nodeName, text: node.nodeValue || '' };
    }

    if (node.nodeType !== 1) {
      return null;
    }

    const attributes = Array.from(node.attributes || []).map(function(attribute) {
      return { name: attribute.name, value: attribute.value };
    });
    const children = Array.from(node.childNodes || [])
      .map(xmlNodeToObject)
      .filter(Boolean);

    return {
      type: 'element',
      name: node.nodeName,
      attributes: attributes,
      children: children,
    };
  }

  function renderXmlNode(node) {
    if (node.type === 'text') {
      return '<span class="sv-value sv-string">' + escapeHtml(JSON.stringify(node.text)) + '</span>';
    }

    if (node.type === 'processing') {
      return '<details open><summary><span class="sv-type">Processing instruction</span> <span class="sv-key">' + escapeHtml(node.name) + '</span></summary><ul><li><span class="sv-key">value</span><span class="sv-colon">: </span><span class="sv-value sv-string">' + escapeHtml(JSON.stringify(node.text)) + '</span></li></ul></details>';
    }

    const attrs = node.attributes.map(function(attribute) {
      return '<li><span class="sv-key">@' + escapeHtml(attribute.name) + '</span><span class="sv-colon">: </span><span class="sv-value sv-string">' + escapeHtml(JSON.stringify(attribute.value)) + '</span></li>';
    }).join('');
    const children = node.children.map(function(child) {
      return '<li>' + renderXmlNode(child) + '</li>';
    }).join('');
    const childCount = node.children.length;
    const attrCount = node.attributes.length;
    const meta = [
      attrCount ? attrCount + ' attrs' : null,
      childCount ? childCount + ' children' : null,
    ].filter(Boolean).join(', ');

    return '<details open><summary><span class="sv-key">&lt;' + escapeHtml(node.name) + '&gt;</span> <span class="sv-count">' + escapeHtml(meta) + '</span></summary><ul>' + attrs + children + '</ul></details>';
  }

  function renderXmlTree(xml) {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(xml, 'application/xml');
    const parserError = documentNode.querySelector('parsererror');
    if (parserError) {
      return '<div class="sv-panel"><pre><code>' + escapeHtml(formatXml(xml)) + '</code></pre></div>';
    }
    const roots = Array.from(documentNode.childNodes)
      .map(xmlNodeToObject)
      .filter(Boolean)
      .map(renderXmlNode)
      .join('');
    return '<div class="sv-panel sv-xml">' + roots + '</div>';
  }

  function resolveAssetUrl(url, baseUrl) {
    const raw = String(url || '').trim();
    if (!raw || /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(raw)) {
      return raw;
    }
    try {
      return new URL(raw, baseUrl).toString();
    } catch (error) {
      return raw;
    }
  }

  function resolveHtmlAssetUrls(html, baseUrl) {
    if (!baseUrl) {
      return html;
    }
    return String(html).replace(/\s(src|href)\s*=\s*("|')([^"']+)\2/gi, function(match, attr, quote, value) {
      return ' ' + attr + '=' + quote + escapeHtml(resolveAssetUrl(value, baseUrl)) + quote;
    });
  }

  function sanitizeTrustedHtml(value, baseUrl) {
    return String(value)
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\s(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
      .replace(/\s(src|href)\s*=\s*("|')([^"']+)\2/gi, function(match, attr, quote, value) {
        return ' ' + attr + '=' + quote + escapeHtml(resolveAssetUrl(value, baseUrl)) + quote;
      });
  }

  function renderTextPreservingHtml(value, baseUrl) {
    const htmlTagPattern = /(<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>)/g;
    return String(value).split(htmlTagPattern).map(function(part) {
      if (!part) {
        return '';
      }
      htmlTagPattern.lastIndex = 0;
      if (htmlTagPattern.test(part)) {
        return sanitizeTrustedHtml(part, baseUrl);
      }
      htmlTagPattern.lastIndex = 0;
      return escapeHtml(part).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
    }).join('');
  }

  function renderMarkdownInline(value, baseUrl) {
    return String(value).split(/(`[^`]*`)/g).map(function(part) {
      if (part.startsWith('`') && part.endsWith('`')) {
        return '<code>' + escapeHtml(part.slice(1, -1)) + '</code>';
      }
      return renderTextPreservingHtml(part, baseUrl)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, src) {
          return '<img src="' + escapeHtml(resolveAssetUrl(src, baseUrl)) + '" alt="' + escapeHtml(alt) + '">';
        })
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, label, href) {
          return '<a href="' + escapeHtml(resolveAssetUrl(href, baseUrl)) + '" target="_blank" rel="noreferrer">' + label + '</a>';
        });
    }).join('');
  }

  function renderMarkdownImageBlock(line, baseUrl) {
    const match = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line.trim());
    if (!match) {
      return null;
    }
    return '<figure><img src="' + escapeHtml(resolveAssetUrl(match[2], baseUrl)) + '" alt="' + escapeHtml(match[1]) + '"><figcaption>' + escapeHtml(match[1]) + '</figcaption></figure>';
  }

  function isRawHtmlBlock(line) {
    return /^\s*<\/?(address|article|aside|blockquote|br|details|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|iframe|img|main|mark|nav|ol|p|pre|section|span|style|summary|table|tbody|td|tfoot|th|thead|tr|ul)\b/i.test(line);
  }

  function renderMarkdown(markdown, baseUrl) {
    const lines = String(markdown).split(/\r?\n/);
    let html = '';
    let paragraph = [];
    let list = [];
    let code = [];
    let inCode = false;

    function flushParagraph() {
      if (!paragraph.length) {
        return;
      }
      const content = paragraph.join(' ');
      const image = renderMarkdownImageBlock(content, baseUrl);
      html += image ? image + '\n' : '<p>' + renderMarkdownInline(content, baseUrl) + '</p>\n';
      paragraph = [];
    }

    function flushList() {
      if (!list.length) {
        return;
      }
      html += '<ul>' + list.map(function(item) {
        return '<li>' + renderMarkdownInline(item, baseUrl) + '</li>';
      }).join('') + '</ul>\n';
      list = [];
    }

    function flushCode() {
      if (!code.length) {
        return;
      }
      html += '<pre><code>' + escapeHtml(code.join('\n')) + '</code></pre>\n';
      code = [];
    }

    function isTableSeparator(line) {
      return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
    }

    function parseTableRow(line) {
      return line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(function(cell) {
          return cell.trim();
        });
    }

    function renderMarkdownTable(tableLines) {
      const headers = parseTableRow(tableLines[0]);
      const rows = tableLines.slice(2).map(parseTableRow);
      const head = '<thead><tr>' + headers.map(function(cell) {
        return '<th>' + renderMarkdownInline(cell, baseUrl) + '</th>';
      }).join('') + '</tr></thead>';
      const body = '<tbody>' + rows.map(function(row) {
        return '<tr>' + headers.map(function(_, index) {
          return '<td>' + renderMarkdownInline(row[index] || '', baseUrl) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';
      return '<table>' + head + body + '</table>\n';
    }

    for (let index = 0; index < lines.length; index += 1) {
      const rawLine = lines[index];
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

      if (line.includes('|') && lines[index + 1] && isTableSeparator(lines[index + 1])) {
        flushParagraph();
        flushList();
        const tableLines = [line, lines[index + 1]];
        index += 2;
        while (index < lines.length && lines[index].trim() && lines[index].includes('|')) {
          tableLines.push(lines[index]);
          index += 1;
        }
        index -= 1;
        html += renderMarkdownTable(tableLines);
        continue;
      }

      const heading = /^(#{1,4})\s+(.+)$/.exec(line);
      if (heading) {
        flushParagraph();
        flushList();
        const level = Math.min(heading[1].length, 3);
        html += '<h' + level + '>' + renderMarkdownInline(heading[2], baseUrl) + '</h' + level + '>\n';
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
        html += sanitizeTrustedHtml(line, baseUrl) + '\n';
        continue;
      }

      paragraph.push(line);
    }

    flushParagraph();
    flushList();
    flushCode();
    return '<div class="sv-panel sv-markdown">' + resolveHtmlAssetUrls(html, baseUrl) + '</div>';
  }

  function isMarkdownFile(fileName, mime) {
    return mime === 'text/markdown'
      || mime === 'text/x-markdown'
      || /\.(md|markdown)$/i.test(fileName || '');
  }

  function readSettings() {
    const defaults = {
      theme: 'branded_dark',
      backgroundImage: '',
      mobileBackgroundImage: '',
      accent: '#32c7f4',
      highlight: '#d98545',
    };
    const settingsNode = document.getElementById('structuredviewer-settings');
    let settings = { ...defaults };

    if (settingsNode && settingsNode.textContent) {
      try {
        const decoder = document.createElement('textarea');
        decoder.innerHTML = settingsNode.textContent;
        settings = { ...settings, ...JSON.parse(decoder.value) };
      } catch (error) {
        settings = { ...defaults };
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has('sv_theme')) {
      settings.theme = params.get('sv_theme') || settings.theme;
    }
    if (params.has('sv_bg')) {
      settings.backgroundImage = params.get('sv_bg') || '';
    }
    if (params.has('sv_mobile_bg')) {
      settings.mobileBackgroundImage = params.get('sv_mobile_bg') || '';
    }
    if (params.has('sv_accent')) {
      settings.accent = params.get('sv_accent') || settings.accent;
    }
    if (params.has('sv_highlight')) {
      settings.highlight = params.get('sv_highlight') || settings.highlight;
    }

    return settings;
  }

  function cssUrl(value) {
    const raw = String(value || '').trim();
    if (!raw || raw.toLowerCase() === 'none') {
      return 'none';
    }
    return 'url("' + raw.replace(/["\\]/g, '\\$&') + '")';
  }

  function applyAppearance(element, settings) {
    if (!element) {
      return;
    }
    element.dataset.theme = settings.theme || 'branded_dark';
    element.style.setProperty('--sv-accent', settings.accent || '#32c7f4');
    element.style.setProperty('--sv-highlight', settings.highlight || '#d98545');
    element.style.setProperty('--sv-background-image', cssUrl(settings.backgroundImage));
    element.style.setProperty('--sv-mobile-background-image', cssUrl(settings.mobileBackgroundImage || settings.backgroundImage));
  }

  function applyGlobalAppearance(settings) {
    const root = document.documentElement;
    if (!root) {
      return;
    }
    root.style.setProperty('--sv-global-background-image', cssUrl(settings.backgroundImage));
    root.style.setProperty('--sv-global-mobile-background-image', cssUrl(settings.mobileBackgroundImage || settings.backgroundImage));
    root.style.setProperty('--sv-global-background-color', '#070810');
  }

  const StructuredViewer = {
    name: 'StructuredViewer',
    data: function() {
      return {
        loading: true,
        error: '',
        rendered: '',
        appearance: readSettings(),
      };
    },
    mounted: function() {
      const component = this;
      this.$nextTick(function() {
        const wrapper = component.$el && component.$el.closest
          ? component.$el.closest('.viewer__file-wrapper')
          : null;
        if (wrapper) {
          wrapper.classList.add('structured-viewer-wrapper');
        }
        applyGlobalAppearance(component.appearance);
        applyAppearance(component.$el, component.appearance);
      });
      this.load();
    },
    updated: function() {
      applyAppearance(this.$el, this.appearance);
      applyGlobalAppearance(this.appearance);
    },
    methods: {
      load: async function() {
        this.loading = true;
        this.error = '';
        try {
          const fileUrl = this.source || this.src || this.davPath || this.filename;
          if (!fileUrl) {
            throw new Error('No file URL provided by viewer');
          }
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }
          const text = await response.text();
          if (this.mime === 'application/json' || /\.json$/i.test(this.basename || this.filename)) {
            this.rendered = '<div class="sv-panel sv-json">' + renderJsonNode(JSON.parse(text), null) + '</div>';
          } else if (isMarkdownFile(this.basename || this.filename, this.mime)) {
            this.rendered = renderMarkdown(text, fileUrl);
          } else {
            this.rendered = renderXmlTree(text);
          }
        } catch (error) {
          this.error = error && error.message ? error.message : String(error);
        } finally {
          this.loading = false;
          if (typeof this.doneLoading === 'function') {
            this.doneLoading();
          }
        }
      },
    },
    render: function(createElement) {
      const name = this.basename || this.filename || '';
      const markdown = isMarkdownFile(name, this.mime);
      const title = markdown
        ? ''
        : this.mime === 'application/json'
          ? 'JSON Preview'
          : 'XML Preview';
      let body;

      if (this.loading) {
        body = createElement('div', { class: 'sv-state' }, 'Loading...');
      } else if (this.error) {
        body = createElement('div', { class: 'sv-state sv-error' }, 'Failed to render: ' + this.error);
      } else {
        body = createElement('div', { domProps: { innerHTML: this.rendered } });
      }

      const children = markdown
        ? [body]
        : [
          createElement('header', [
            createElement('h1', title),
            createElement('p', name),
          ]),
          body,
        ];

      return createElement('div', { class: markdown ? 'structured-viewer structured-viewer--markdown' : 'structured-viewer' }, children);
    },
  };

  if (!window.OCA || !window.OCA.Viewer) {
    return;
  }

  applyGlobalAppearance(readSettings());

  window.OCA.Viewer.registerHandler({
    id: 'structuredviewer',
    mimes: ['application/json', 'application/xml', 'text/xml', 'text/markdown', 'text/x-markdown', 'text/plain'],
    component: StructuredViewer,
    canCompare: false,
  });

  function getCurrentDir() {
    const params = new URLSearchParams(window.location.search);
    return params.get('dir') || '/';
  }

  function normalizeFileName(row) {
    const text = (row.innerText || row.textContent || '').trim();
    if (!text) {
      return '';
    }
    const lines = text.split('\n').map(function(line) {
      return line.trim();
    }).filter(Boolean);
    if (lines.length >= 2 && /^\.[A-Za-z0-9]+$/.test(lines[1])) {
      return lines[0] + lines[1];
    }
    return lines[0] || '';
  }

  function shouldOpenStructured(fileName) {
    return /\.(json|xml|md|markdown)$/i.test(fileName) && !/\.html$/i.test(fileName);
  }

  document.addEventListener('click', function(event) {
    const row = event.target && event.target.closest
      ? event.target.closest('tr.files-list__row, .files-list__row, [data-cy-files-list-row]')
      : null;

    if (!row) {
      return;
    }

    const fileName = normalizeFileName(row);
    if (!shouldOpenStructured(fileName)) {
      return;
    }

    if (!window.OCA || !window.OCA.Viewer || typeof window.OCA.Viewer.openWith !== 'function') {
      return;
    }

    const dir = getCurrentDir().replace(/\/$/, '');
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    window.OCA.Viewer.openWith('structuredviewer', {
      path: dir + '/' + fileName,
    });
  }, true);
})();
