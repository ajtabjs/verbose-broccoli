const jasonloc = "https://raw.githubusercontent.com/estrog3n/assetss/refs/heads/main/main.json";
const portsLoc = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/ports.json";
const imgBaseUrl = "https://cdn.jsdelivr.net/gh/estrog3n/img@latest";

Promise.all([
  fetch(jasonloc).then(res => res.json()).catch(e => { console.error("main.json failed:", e); return []; }),
  fetch(portsLoc).then(res => res.json()).catch(e => { console.error("ports.json failed:", e); return []; })
])
.then(([games, ports]) => {
  const container = document.getElementById('gamecards');
  
  if (!container) {
    console.error("Gamecards container not found!");
    return;
  }

  games.forEach(game => {
    const a = document.createElement('a');
    a.target = "_blank";
    const isPort = ports.some(p => p.id === game.id);
    a.href = './iframe.html?id=' + game.id + (isPort ? '&port=true' : '');
    a.classList.add('game-link');

    const card = document.createElement('div');
    card.classList.add('card');

    // Only create image bubble if img exists and is not empty
    if (game.img && game.img.trim() !== "") {
      const imgBubble = document.createElement('div');
      imgBubble.classList.add('image-bubble');
      
      const img = document.createElement('img');
      const imgUrl = `${imgBaseUrl}/${game.img}`;
      img.src = imgUrl;
      img.alt = game.name;
      img.loading = "lazy";
      
      // Hide bubble if image fails to load
      img.onerror = function() {
        imgBubble.style.display = 'none';
      };
      
      imgBubble.appendChild(img);
      card.appendChild(imgBubble);
    }

    // Add game name text
    const title = document.createElement('span');
    title.classList.add('game-title');
    title.textContent = game.name;
    card.appendChild(title);

    a.appendChild(card);
    container.appendChild(a);
  });
});