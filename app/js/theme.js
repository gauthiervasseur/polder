/* Polder - visualization themes loaded from a plain CSS file.
 *
 * A theme is ordinary CSS. Polder reads custom properties named --polder-*
 * (from any rule), plus plain font-family / color / background on :root,
 * html, body or .polder as fallbacks. @import and @font-face rules are
 * injected into the page so web fonts load.
 */
(function () {
  'use strict';
  const T = (window.Polder = window.Polder || {});

  // Default: the DLL brand theme (DLL blue #0099ff, greys #333/#666, Effra with
  // Figtree as the embedded open-source stand-in). DLL Night is its dark twin.
  const DLL = `/* Polder theme: DLL (default, light) */
:root {
  --polder-theme-name: "DLL";
  --polder-font-family: "Effra", "Figtree", Arial, sans-serif;
  --polder-title-font-family: "Effra", "Figtree", Arial, sans-serif;
  --polder-font-size: 13px;
  --polder-title-font-size: 16px;
  --polder-text-color: #333333;
  --polder-muted-color: #666666;
  --polder-background: #ffffff;
  --polder-plot-background: #ffffff;
  --polder-grid-color: #e5e5e5;
  --polder-palette: #0099ff, #f28c28, #00875a, #4b08a1, #d6336c, #00a3a3, #9a151c, #8a9aa9;
  --polder-sequential: #e0f2ff, #005c99;
  --polder-table-header-background: #0099ff;
  --polder-table-header-color: #ffffff;
  --polder-table-border-color: #dedede;
  --polder-table-total-background: #f1f8ff;
}
`;

  const DLL_NIGHT = `/* Polder theme: DLL NIGHT (dark) */
:root {
  --polder-theme-name: "DLL Night";
  --polder-font-family: "Effra", "Figtree", Arial, sans-serif;
  --polder-title-font-family: "Effra", "Figtree", Arial, sans-serif;
  --polder-font-size: 13px;
  --polder-title-font-size: 16px;
  --polder-text-color: #eef3f8;
  --polder-muted-color: #9fb3c8;
  --polder-background: #0d1b2a;
  --polder-plot-background: #0d1b2a;
  --polder-grid-color: #1f3550;
  --polder-palette: #33adff, #ff9f45, #2fbf71, #a37bff, #ff6b9a, #2ec4c4, #ff6b6b, #a7b4c2;
  --polder-sequential: #12324f, #9fd6ff;
  --polder-table-header-background: #0099ff;
  --polder-table-header-color: #ffffff;
  --polder-table-border-color: #22405f;
  --polder-table-total-background: #102438;
}
`;

  // Kept from the original arcade edition. Categorical order is the validated
  // colour-blind-safe dark-surface palette from the dataviz method.
  const ARCADE = `/* Polder theme: ARCADE (retro) */
:root {
  --polder-theme-name: "Arcade";
  --polder-font-family: "VT323", "Courier New", monospace;
  --polder-title-font-family: "Press Start 2P", "VT323", monospace;
  --polder-font-size: 19px;
  --polder-title-font-size: 12px;
  --polder-text-color: #f0efec;
  --polder-muted-color: #b9b2dd;
  --polder-background: #120b2e;
  --polder-plot-background: #120b2e;
  --polder-grid-color: #2f2660;
  --polder-palette: #3987e5, #d95926, #199e70, #c98500, #d55181, #008300, #9085e9, #e66767;
  --polder-sequential: #1d3a6e, #b7d3f6;
  --polder-table-header-background: #1f1550;
  --polder-table-header-color: #ffd400;
  --polder-table-border-color: #33296b;
  --polder-table-total-background: #1a1145;
}
`;

  const CORPORATE = `/* Polder theme: CORPORATE (light) */
:root {
  --polder-theme-name: "Corporate";
  --polder-font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --polder-title-font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --polder-font-size: 13px;
  --polder-text-color: #0b0b0b;
  --polder-muted-color: #52514e;
  --polder-background: #fcfcfb;
  --polder-plot-background: #fcfcfb;
  --polder-grid-color: #e6e5e0;
  --polder-palette: #2a78d6, #eb6834, #1baf7a, #eda100, #e87ba4, #008300, #6250d6, #e34948;
  --polder-sequential: #cde2fb, #104281;
  --polder-table-header-background: #f0efec;
  --polder-table-header-color: #0b0b0b;
  --polder-table-border-color: #e6e5e0;
  --polder-table-total-background: #f5f4f1;
}
`;

  const PRESETS = { DLL, 'DLL Night': DLL_NIGHT, Arcade: ARCADE, Corporate: CORPORATE };

  /* ----------------------------------------------------------- color utils */

  const probe = document.createElement('canvas').getContext('2d');
  function toRGB(c) {
    if (!c || !CSS.supports('color', c)) return null;
    probe.fillStyle = '#000';
    probe.fillStyle = c;
    const s = probe.fillStyle; // "#rrggbb" or "rgba(r, g, b, a)"
    if (s[0] === '#') return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    const m = s.match(/[\d.]+/g);
    return m ? [+m[0], +m[1], +m[2]] : null;
  }
  const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  function mix(a, b, t) {
    const A = toRGB(a), B = toRGB(b);
    if (!A || !B) return a;
    return hex(A.map((v, i) => v + (B[i] - v) * t));
  }
  function luminance(c) {
    const rgb = toRGB(c);
    if (!rgb) return 0;
    const l = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  }
  /** Readable ink for text drawn on `bg` (used for heat-shaded table cells). */
  function inkOn(bg, dark, light) { return luminance(bg) > 0.38 ? dark : light; }

  /** Split "a, rgb(1,2,3), b" on top-level commas only. */
  function splitList(v) {
    const out = []; let depth = 0, cur = '';
    for (const ch of v) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  const unquote = (s) => (s || '').trim().replace(/^["']|["']$/g, '');

  /* --------------------------------------------------------------- parsing */

  const BASE_SELECTORS = /^(:root|html|body|\.polder|\.polder-theme|\*)$/;

  function parse(cssText) {
    const warnings = [];
    const imports = [];
    // Strip comments first, then pull out @import rules. URLs may contain ';'
    // (Google Fonts: "wght@400;600"), so match the quoted/url() part as a unit.
    const body = cssText
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@import\s+(?:url\(\s*(['"]?)([^'")]*)\1\s*\)|(['"])(.*?)\3)[^;]*;/gi, (m, q1, u1, q2, u2) => {
        imports.push(u1 || u2); return '';
      });
    const vars = {};
    const fontFaces = [];
    let sheet;
    try {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(body);
    } catch (e) {
      throw new Error('This CSS could not be read: ' + e.message);
    }
    for (const rule of sheet.cssRules) {
      if (rule instanceof CSSFontFaceRule) { fontFaces.push(rule.cssText); continue; }
      if (!(rule instanceof CSSStyleRule)) continue;
      const base = rule.selectorText.split(',').some((s) => BASE_SELECTORS.test(s.trim()));
      for (let k = 0; k < rule.style.length; k++) {
        const p = rule.style[k];
        if (p.startsWith('--polder-') || base) vars[p] = rule.style.getPropertyValue(p).trim();
      }
    }
    const d = resolve({}); // defaults (from DLL) for anything not given
    const get = (...names) => { for (const n of names) if (vars[n]) return vars[n]; return null; };
    const color = (v, fallback, label) => {
      if (!v) return fallback;
      if (toRGB(v)) return v;
      warnings.push('Ignored ' + label.toLowerCase() + ': "' + v + '" is not a color');
      return fallback;
    };

    const t = {};
    t.name = unquote(get('--polder-theme-name')) || 'Custom';
    t.fontFamily = get('--polder-font-family', 'font-family') || d.fontFamily;
    t.titleFontFamily = get('--polder-title-font-family') || t.fontFamily;
    t.fontSize = parseFloat(get('--polder-font-size', 'font-size')) || (vars['--polder-font-family'] || vars['font-family'] ? 13 : d.fontSize);
    t.titleFontSize = parseFloat(get('--polder-title-font-size')) || Math.round(t.fontSize * 1.15);
    t.background = color(get('--polder-background', 'background-color', 'background'), d.background, 'BACKGROUND');
    t.text = color(get('--polder-text-color', 'color'), luminance(t.background) > 0.4 ? '#0b0b0b' : '#f0efec', 'Text color');
    t.muted = color(get('--polder-muted-color'), mix(t.text, t.background, 0.35), 'Muted color');
    t.plotBackground = color(get('--polder-plot-background'), t.background, 'Plot background');
    t.grid = color(get('--polder-grid-color'), mix(t.background, t.text, 0.14), 'Grid color');

    let palette = [];
    const list = get('--polder-palette');
    if (list) palette = splitList(list);
    for (let k = 1; k <= 12; k++) { const c = vars['--polder-color-' + k]; if (c) palette[k - 1] = c; }
    palette = palette.filter((c) => {
      if (toRGB(c)) return true;
      warnings.push('Ignored palette color "' + c + '"'); return false;
    });
    if (!palette.length) palette = d.palette;
    if (palette.length > 8) warnings.push('Palette has ' + palette.length + ' colors: only the first 8 are used, the rest fold into "other"');
    t.palette = palette.slice(0, 8);
    t.other = mix(t.background, t.text, 0.45);

    const seq = get('--polder-sequential');
    const seqList = seq ? splitList(seq).filter((c) => toRGB(c)) : [];
    t.sequential = seqList.length >= 2 ? seqList : [mix(t.background, t.palette[0], 0.15), t.palette[0]];

    t.tableHeaderBackground = color(get('--polder-table-header-background'), mix(t.background, t.text, 0.07), 'Table header background');
    t.tableHeaderText = color(get('--polder-table-header-color'), t.text, 'Table header color');
    t.tableBorder = color(get('--polder-table-border-color'), t.grid, 'Table border color');
    t.tableTotalBackground = color(get('--polder-table-total-background'), mix(t.background, t.text, 0.04), 'Table total background');

    const fontCss = imports.map((u) => '@import url("' + u + '");').join('\n') + '\n' + fontFaces.join('\n');
    return { theme: t, fontCss, warnings };
  }

  // Defaults for anything a custom theme leaves out: the DLL theme's values.
  let DEFAULTS = null;
  function resolve() {
    if (DEFAULTS) return DEFAULTS;
    DEFAULTS = {
      fontFamily: '"Effra", "Figtree", Arial, sans-serif', fontSize: 13, background: '#ffffff',
      palette: ['#0099ff', '#f28c28', '#00875a', '#4b08a1', '#d6336c', '#00a3a3', '#9a151c', '#8a9aa9'],
    };
    return DEFAULTS;
  }

  /** Inject the theme's web fonts and expose its values as CSS variables on `el`. */
  function apply(parsed, el) {
    let style = document.getElementById('polder-theme-fonts');
    if (!style) { style = document.createElement('style'); style.id = 'polder-theme-fonts'; document.head.appendChild(style); }
    style.textContent = parsed.fontCss;
    const t = parsed.theme;
    const s = el.style;
    s.setProperty('--viz-font', t.fontFamily);
    s.setProperty('--viz-title-font', t.titleFontFamily);
    s.setProperty('--viz-font-size', t.fontSize + 'px');
    s.setProperty('--viz-title-size', t.titleFontSize + 'px');
    s.setProperty('--viz-bg', t.background);
    s.setProperty('--viz-text', t.text);
    s.setProperty('--viz-muted', t.muted);
    s.setProperty('--viz-grid', t.grid);
    s.setProperty('--viz-accent', t.palette[0]);
    s.setProperty('--viz-th-bg', t.tableHeaderBackground);
    s.setProperty('--viz-th-text', t.tableHeaderText);
    s.setProperty('--viz-border', t.tableBorder);
    s.setProperty('--viz-total-bg', t.tableTotalBackground);
    // Resolve once fonts are actually usable, so charts measure text correctly.
    const fams = [t.fontFamily, t.titleFontFamily].map((f) => splitList(f)[0]).filter(Boolean);
    return Promise.all(fams.map((f) => document.fonts.load(t.fontSize + 'px ' + f).catch(() => null))).then(() => document.fonts.ready);
  }

  /** Serialize a resolved theme back to a CSS file (used for "download template"). */
  function toCSS(t) {
    return `/* Polder visualization theme.
 * Load it with THEME CSS in Polder. Every variable is optional.
 * Web fonts: add @import url("https://fonts.googleapis.com/...") or @font-face rules at the top.
 */
:root {
  --polder-theme-name: "${t.name}";
  --polder-font-family: ${t.fontFamily};
  --polder-title-font-family: ${t.titleFontFamily};
  --polder-font-size: ${t.fontSize}px;
  --polder-title-font-size: ${t.titleFontSize}px;
  --polder-text-color: ${t.text};
  --polder-muted-color: ${t.muted};
  --polder-background: ${t.background};
  --polder-plot-background: ${t.plotBackground};
  --polder-grid-color: ${t.grid};
  /* Categorical colors, in order. Up to 8; more series fold into "Other". */
  --polder-palette: ${t.palette.join(', ')};
  /* Low and high ends of the single-hue ramp used by heatmaps and heat cells. */
  --polder-sequential: ${t.sequential.join(', ')};
  --polder-table-header-background: ${t.tableHeaderBackground};
  --polder-table-header-color: ${t.tableHeaderText};
  --polder-table-border-color: ${t.tableBorder};
  --polder-table-total-background: ${t.tableTotalBackground};
}
`;
  }

  T.Theme = { DLL, DLL_NIGHT, ARCADE, CORPORATE, PRESETS, parse, apply, toCSS, mix, toRGB, luminance, inkOn };
})();
