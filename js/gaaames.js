const jasonloc = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/main.json";
const portsLoc = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/ports.json";

Promise.all([
  fetch(jasonloc).then(res => res.json()).catch(e => { console.error("main.json failed:", e); return []; }),
  fetch(portsLoc).then(res => res.json()).catch(e => { console.error("ports.json failed:", e); return []; })
])
.then(([games, ports]) => {
  const container = document.getElementById('gamecards');

  games.forEach(game => {
    const a = document.createElement('a');
    const isPort = ports.some(p => p.id === game.id);
    a.href = './iframe.html?id=' + game.id + (isPort ? '&port=true' : '');
    a.target = '_blank'; 
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = game.name;

    a.appendChild(card);
    container.appendChild(a);
  });
});