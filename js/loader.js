const urls = {
  "base": "https://cdn.jsdelivr.net/gh/ajtabjs/wl-main@master",
  "ports": "https://cdn.jsdelivr.net/gh/ajtabjs/wl-ports2@main"
}
const mainCheck = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/main.json";
const portsCheck = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/ports.json";
const frame = document.getElementById("gameframe");
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const isPort = params.get('port') === 'true';

let pageUrl;

// Fetch both JSON files and merge them
Promise.all([
  fetch(mainCheck).then(res => res.json()).catch(() => []),
  fetch(portsCheck).then(res => res.json()).catch(() => [])
])
.then(([mainGames, portsGames]) => {
  // Merge both game lists
  const allGames = [...mainGames, ...portsGames];
  const game = allGames.find(g => g.id === id);
  const file = game?.file || 'index.html';
  const baseUrl = isPort ? urls.ports : urls.base;
  pageUrl = baseUrl + '/' + id + '/' + file;
  
  return fetch(pageUrl).then(res => res.text());
})
.then(html => {
  const baseHref = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
  
  // Inject CSS to force the content to fill the iframe
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
    </style>
  `;
  
  // Insert base tag and forced styles
  const modifiedHtml = html.replace('</head>', '<base href="' + baseHref + '">' + forcedStyles + '</head>');
  
  const iframe = frame.contentDocument || frame.contentWindow.document;
  iframe.open();
  iframe.write(modifiedHtml);
  iframe.close();
})
.catch((error) => {
  console.error('Error:', error);
  const baseUrl = isPort ? urls.ports : urls.base;
  const fallbackUrl = baseUrl + '/' + id + '/index.html';
  const fallbackBaseHref = fallbackUrl.substring(0, fallbackUrl.lastIndexOf('/') + 1);
  
  fetch(fallbackUrl)
    .then(res => res.text())
    .then(html => {
      const forcedStyles = `
        <style>
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: auto !important;
          }
        </style>
      `;
      
      const modifiedHtml = html.replace('</head>', '<base href="' + fallbackBaseHref + '">' + forcedStyles + '</head>');
      
      const iframe = frame.contentDocument || frame.contentWindow.document;
      iframe.open();
      iframe.write(modifiedHtml);
      iframe.close();
    })
    .catch(err => {
      console.error('Fallback also failed:', err);
      frame.srcdoc = '<html><body style="margin:0;padding:0;width:100vw;height:100vh;"><h1>Error loading game</h1></body></html>';
    });
});