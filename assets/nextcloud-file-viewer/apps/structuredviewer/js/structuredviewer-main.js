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

  const StructuredViewer = {
    name: 'StructuredViewer',
    data: function() {
      return {
        loading: true,
        error: '',
        rendered: '',
      };
    },
    mounted: function() {
      this.load();
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
      const title = this.mime === 'application/json' ? 'JSON Preview' : 'XML Preview';
      const name = this.basename || this.filename || '';
      let body;

      if (this.loading) {
        body = createElement('div', { class: 'sv-state' }, 'Loading...');
      } else if (this.error) {
        body = createElement('div', { class: 'sv-state sv-error' }, 'Failed to render: ' + this.error);
      } else {
        body = createElement('div', { domProps: { innerHTML: this.rendered } });
      }

      return createElement('div', { class: 'structured-viewer' }, [
        createElement('header', [
          createElement('h1', title),
          createElement('p', name),
        ]),
        body,
      ]);
    },
  };

  if (!window.OCA || !window.OCA.Viewer) {
    return;
  }

  window.OCA.Viewer.registerHandler({
    id: 'structuredviewer',
    mimes: ['application/json', 'application/xml', 'text/xml'],
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
    return /\.(json|xml)$/i.test(fileName) && !/\.html$/i.test(fileName);
  }

  document.addEventListener('click', function(event) {
    const row = event.target && event.target.closest
      ? event.target.closest('tr.files-list__row')
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
