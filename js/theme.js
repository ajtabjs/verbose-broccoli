const THEMES = {
  default:  { bg: '#242424', accent: '#ffffff' },
  midnight: { bg: '#0d0d1f', accent: '#7b8fff' },
  rose:     { bg: '#1a0a0a', accent: '#ff8888' },
  forest:   { bg: '#0a140a', accent: '#88cc88' },
  slate:    { bg: '#1c1c1e', accent: '#aaaaaa' },
  amber:    { bg: '#181200', accent: '#ffcc44' },
  ocean:    { bg: '#001622', accent: '#44bbdd' },
  lavender: { bg: '#100018', accent: '#cc88ff' },
};

function applyTheme(name) {
  const t = THEMES[name] || THEMES.default;

  document.body.style.backgroundColor = t.bg;

  // inject a <style> tag so pseudo-elements and dynamic elements get themed too
  let styleTag = document.getElementById('theme-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'theme-style';
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    body { background-color: ${t.bg} !important; }
    p, h1, h2, h3, h4, h5, h6, a, span, label { color: ${t.accent} !important; }
    .card, #dmca, #dmca-modal-inner, #dmca-modal-close, .setting-row, .field input, .field textarea, .field select {
      border-color: ${t.accent} !important;
    }
    #menu a { color: ${t.accent} !important; }
    .toggle input:checked + .toggle-track { border-color: ${t.accent} !important; }
    .toggle input:checked + .toggle-track::after { background: ${t.accent} !important; }
    .theme-btn.active { border-color: ${t.accent} !important; }
    .pageclip-form__submit { border-color: ${t.accent} !important; color: ${t.accent} !important; }
    .pageclip-form__submit:not([disabled]):hover { background-color: ${t.accent} !important; color: ${t.bg} !important; }
    #ad-submit-btn { border-color: ${t.accent} !important; color: ${t.accent} !important; }
    #ad-submit-btn.ready:hover { background-color: ${t.accent} !important; color: ${t.bg} !important; }
    #ad-modal-inner, #dmca-modal-inner { background: ${t.bg} !important; border-color: ${t.accent} !important; }
    #dmca-modal-inner, #dmca-modal-close { color: ${t.accent} !important; }
  `;
}

function getSettings() {
  return JSON.parse(localStorage.getItem('potato-settings') || '{}');
}

// apply immediately on load
(function () {
  const s = getSettings();
  applyTheme(s.theme || 'default');
})();
