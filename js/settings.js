function loadSettings() {
  const s = JSON.parse(localStorage.getItem('potato-settings') || '{}');
  return {
    theme: s.theme || 'default',
    disableAds: s.disableAds || false,
    reducedMotion: s.reducedMotion || false,
    showNsfw: s.showNsfw || false,
  };
}

function saveSettings(settings) {
  localStorage.setItem('potato-settings', JSON.stringify(settings));
  const notice = document.getElementById('save-notice');
  notice.classList.add('show');
  setTimeout(() => notice.classList.remove('show'), 1500);
}

function applyAll(settings) {
  applyTheme(settings.theme); // from theme.js

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === settings.theme);
  });

  document.getElementById('toggle-ads').checked = settings.disableAds;
  document.getElementById('toggle-motion').checked = settings.reducedMotion;

  if (settings.reducedMotion) {
    document.documentElement.style.setProperty('--transition', 'none');
    document.querySelectorAll('*').forEach(el => {
      el.style.transition = 'none';
      el.style.animation = 'none';
    });
  } else {
    document.documentElement.style.removeProperty('--transition');
  }
}

function resetSettings() {
  const defaults = { theme: 'default', disableAds: false, reducedMotion: false, showNsfw: false };
  saveSettings(defaults);
  applyAll(defaults);
}

document.addEventListener('DOMContentLoaded', () => {
  const settings = loadSettings();
  applyAll(settings);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.theme = btn.dataset.theme;
      applyAll(settings);
      saveSettings(settings);
    });
  });

  document.getElementById('toggle-ads').addEventListener('change', e => {
    settings.disableAds = e.target.checked;
    saveSettings(settings);
  });

  document.getElementById('toggle-motion').addEventListener('change', e => {
    settings.reducedMotion = e.target.checked;
    applyAll(settings);
    saveSettings(settings);
  });
});
