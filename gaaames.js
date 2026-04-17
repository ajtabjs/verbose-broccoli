jasonloc = "https://cdn.jsdelivr.net/gh/estrog3n/assetss@main/main.json" 
 
 
 fetch(jasonloc)
  .then(res => res.json())
  .then(games => {
    const container = document.getElementById('gamecards');

    games.forEach(game => {
      const a = document.createElement('a');
      a.href = game.url;

      const card = document.createElement('div');
      card.classList.add('card');
      card.textContent = game.name;

      a.appendChild(card);
      container.appendChild(a);
    });})