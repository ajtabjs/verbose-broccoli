const urls = {
  "base": "https://cdn.jsdelivr.net/gh/ajtabjs/wl-main@master",
  "ports": "https://cdn.jsdelivr.net/gh/ajtabjs/wl-ports2@main"
};
const mainCheck = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/main.json";
const portsCheck = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/ports.json";
const frame = document.getElementById("gameframe");
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const isPort = params.get('port') === 'true';

let pageUrl;

/**
 * Rewrites absolute-path src/href/url() references in fetched HTML so they
 * resolve against the CDN origin rather than the current page's origin.
 *
 * <base href> only fixes *relative* paths — it has no effect on paths that
 * start with "/". Those always resolve against window.location.origin, which
 * is the dev server / GitHub Pages host, not the CDN. This function prefixes
 * those absolute paths with the CDN origin before the iframe document is written.
 *
 * Handles:
 *   src="/..."       href="/..."       (HTML attributes)
 *   url('/...')      url("/...")       (CSS inline / style blocks)
 *   action="/..."    data-src="/..."   (forms, lazy-load attributes)
 *
 * Does NOT touch:
 *   //example.com    (protocol-relative — already has an origin)
 *   http(s)://...    (full URLs — already resolved)
 */
function rewriteAbsolutePaths(html, cdnOrigin) {
  return html
    // HTML attributes: src="/", href="/", action="/", data-*="/", etc.
    .replace(/((?:src|href|action|data-[\w-]+)\s*=\s*(["']))\/(?!\/)/g, `$1$2${cdnOrigin}/`)
    // CSS url( — with or without quotes
    .replace(/url\(\s*(["']?)\/(?!\/)/g, `url($1${cdnOrigin}/`);
}

/**
 * Injects a <base href> and forced fill-styles into the fetched HTML, then
 * rewrites any absolute-path asset references to point to the CDN.
 */
function prepareHtml(html, baseHref) {
  const cdnOrigin = new URL(baseHref).origin;

  const forcedStyles = `
    <style>
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: auto !important;
      }
      body > * {
        max-width: 100% !important;
      }
    </style>`;

  // 1. Rewrite absolute paths (src="/..." href="/...") to CDN origin.
  //    Also strip absolute-path <script> tags that will 404 on the current
  //    host and aren't part of the game itself (e.g. /js/main.js injected
  //    by the source site's own wrapper).
  let modified = rewriteAbsolutePaths(html, cdnOrigin);

  // 2. Inject <base href> at the very TOP of the document — before <html>,
  //    before <head>, before any other tag — so the parser sees it first and
  //    relative asset paths in <head> (e.g. Build/UnityLoader.js) resolve
  //    against the CDN immediately. Injecting into </head> is too late; the
  //    parser has already queued those script fetches by then.
  modified = `<base href="${baseHref}">${forcedStyles}${modified}`;

  return modified;
}

/**
 * Writes prepared HTML into the gameframe iframe.
 */
function writeToFrame(html) {
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}

// Fetch both game-list JSONs and merge them
Promise.all([
  fetch(mainCheck).then(res => res.json()).catch(() => []),
  fetch(portsCheck).then(res => res.json()).catch(() => [])
])
.then(([mainGames, portsGames]) => {
  const allGames = [...mainGames, ...portsGames];
  const game = allGames.find(g => g.id === id);
  const file = game?.file || 'index.html';
  const baseUrl = isPort ? urls.ports : urls.base;

  pageUrl = `${baseUrl}/${id}/${file}`;

  return fetch(pageUrl).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${pageUrl}`);
    return res.text();
  });
})
.then(html => {
  const baseHref = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
  writeToFrame(prepareHtml(html, baseHref));
})
.catch(error => {
  console.error('Primary load failed:', error);

  const baseUrl = isPort ? urls.ports : urls.base;
  const fallbackUrl = `${baseUrl}/${id}/index.html`;
  const fallbackBaseHref = fallbackUrl.substring(0, fallbackUrl.lastIndexOf('/') + 1);

  fetch(fallbackUrl)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching fallback ${fallbackUrl}`);
      return res.text();
    })
    .then(html => {
      writeToFrame(prepareHtml(html, fallbackBaseHref));
    })
    .catch(err => {
      console.error('Fallback also failed:', err);
      frame.srcdoc = `<html><body style="margin:0;padding:20px;width:100%;height:100%;box-sizing:border-box;font-family:sans-serif;color:#fff;background:#111;">
        <h2>Error loading game</h2>
        <p>${err.message}</p>
      </body></html>`;
    });
});