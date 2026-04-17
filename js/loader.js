const urls = {
  "base": "https://cdn.jsdelivr.net/gh/ajtabjs/wl-main@master",
  "ports": "https://cdn.jsdelivr.net/gh/ajtabjs/wl-ports2@main"
}
const check = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/main.json"
const frame = document.getElementById("gameframe");
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const isPort = params.get('port') === 'true';

let pageUrl; // Store pageUrl to use later

fetch(check)
  .then(res => res.json())
  .then(games => {
    const game = games.find(g => g.id === id);
    const file = game?.file || 'index.html';
    const baseUrl = isPort ? urls.ports : urls.base;
    pageUrl = baseUrl + '/' + id + '/' + file;
    
    // Fetch the HTML content
    return fetch(pageUrl).then(res => res.text());
  })
  .then(html => {
    // Get the base path (directory) for relative resources
    const baseHref = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
    
    // Inject HTML with base tag to fix relative paths
    const iframe = frame.contentDocument || frame.contentWindow.document;
    iframe.open();
    iframe.write('<!DOCTYPE html><html><head><base href="' + baseHref + '"></head>' + html + '</html>');
    iframe.close();
  })
  .catch((error) => {
    console.error('Error:', error);
    // Fallback: try to load index.html
    const baseUrl = isPort ? urls.ports : urls.base;
    const fallbackUrl = baseUrl + '/' + id + '/index.html';
    const fallbackBaseHref = fallbackUrl.substring(0, fallbackUrl.lastIndexOf('/') + 1);
    
    fetch(fallbackUrl)
      .then(res => res.text())
      .then(html => {
        const iframe = frame.contentDocument || frame.contentWindow.document;
        iframe.open();
        iframe.write('<!DOCTYPE html><html><head><base href="' + fallbackBaseHref + '"></head>' + html + '</html>');
        iframe.close();
      })
      .catch(err => {
        console.error('Fallback also failed:', err);
        frame.srcdoc = '<html><body><h1>Error loading game</h1></body></html>';
      });
  });