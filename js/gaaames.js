async function fetchWithFallback(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch ${url}:`, e);
    }
  }
  console.error("All URLs failed for:", urls[0]);
  return [];
}

const jasonlocs = [
  "https://raw.githubusercontent.com/estrog3n/assetss/refs/heads/main/main.json",
  "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/main.json",
  "https://cdn.jsdelivr.net/gh/estrog3n/assetss@main/main.json",
];

const portsLocs = [
  "https://cdn.jsdelivr.net/gh/estrog3n/assetss@main/ports.json",
  "https://cdn.jsdelivr.net/gh/estrog3n/assetss@latest/ports.json",
  "https://raw.githubusercontent.com/estrog3n/assetss/refs/heads/main/ports.json",
];

const imgBaseUrl = "https://cdn.jsdelivr.net/gh/estrog3n/img@latest";
const nsfwGameConfig = Array.isArray(window.nsfwGames) ? window.nsfwGames : [];
const nsfwGameIds = new Set(
  nsfwGameConfig
    .map(entry => {
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry.id === "string") return entry.id.trim();
      return "";
    })
    .filter(id => id !== "")
);

let renderedGameLinks = [];
let selectedGameIndex = -1;
let showNsfwGames = false;

function getVisibleGameLinks() {
  return renderedGameLinks.filter(link => !link.hidden);
}

function updateSelectedCard() {
  renderedGameLinks.forEach((link, index) => {
    const isSelected = index === selectedGameIndex;
    link.classList.toggle("is-selected", isSelected);
    if (isSelected) {
      link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  });
}

function normalizeSelection() {
  const visibleLinks = getVisibleGameLinks();
  if (!visibleLinks.length) {
    selectedGameIndex = -1;
    updateSelectedCard();
    return;
  }

  const current = renderedGameLinks[selectedGameIndex];
  if (!current || current.hidden) {
    let fallbackIndex = -1;

    if (selectedGameIndex >= 0) {
      for (let i = selectedGameIndex + 1; i < renderedGameLinks.length; i += 1) {
        if (!renderedGameLinks[i].hidden) {
          fallbackIndex = i;
          break;
        }
      }

      if (fallbackIndex === -1) {
        for (let i = selectedGameIndex - 1; i >= 0; i -= 1) {
          if (!renderedGameLinks[i].hidden) {
            fallbackIndex = i;
            break;
          }
        }
      }
    }

    if (fallbackIndex === -1) {
      fallbackIndex = renderedGameLinks.indexOf(visibleLinks[0]);
    }

    selectedGameIndex = fallbackIndex;
  }

  updateSelectedCard();
}

function moveSelection(direction) {
  const visibleLinks = getVisibleGameLinks();
  if (!visibleLinks.length) return;

  const currentLink = renderedGameLinks[selectedGameIndex];
  const currentVisibleIndex = currentLink ? visibleLinks.indexOf(currentLink) : -1;
  const startIndex = currentVisibleIndex === -1 ? 0 : currentVisibleIndex;
  const nextVisibleIndex = (startIndex + direction + visibleLinks.length) % visibleLinks.length;
  selectedGameIndex = renderedGameLinks.indexOf(visibleLinks[nextVisibleIndex]);

  updateSelectedCard();
}

function applyGameFilters() {
  renderedGameLinks.forEach(link => {
    const isNsfw = link.dataset.nsfw === "true";
    link.hidden = isNsfw && !showNsfwGames;
  });

  normalizeSelection();
}

function setupListControls(container) {
  const selectPrev = document.getElementById("select-prev");
  const selectNext = document.getElementById("select-next");
  const carouselLeft = document.getElementById("carousel-left");
  const carouselRight = document.getElementById("carousel-right");

  if (selectPrev) selectPrev.addEventListener("click", () => moveSelection(-1));
  if (selectNext) selectNext.addEventListener("click", () => moveSelection(1));

  const scrollAmount = () => Math.max(container.clientWidth * 0.8, 180);
  const scrollCarouselLeft = () => {
    container.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
  };
  const scrollCarouselRight = () => {
    container.scrollBy({ left: scrollAmount(), behavior: "smooth" });
  };

  if (carouselLeft) carouselLeft.addEventListener("click", scrollCarouselLeft);
  if (carouselRight) carouselRight.addEventListener("click", scrollCarouselRight);
}

function setupNsfwToggle() {
  const nsfwToggle = document.getElementById("toggle-nsfw");
  if (!(nsfwToggle instanceof HTMLInputElement)) return;

  nsfwToggle.addEventListener("change", function () {
    showNsfwGames = nsfwToggle.checked;
    applyGameFilters();
  });
}

Promise.all([
  fetchWithFallback(jasonlocs),
  fetchWithFallback(portsLocs)
]).then(([games, ports]) => {
  const container = document.getElementById('gamecards');

  if (!container) {
    console.error("Gamecards container not found!");
    return;
  }

  const sortedGames = [...games].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
  );

  sortedGames.forEach(game => {
    const a = document.createElement('a');
    a.target = "_blank";

    const isPort = ports.some(p => p.id === game.id);
    const isNsfw = nsfwGameIds.has(game.id);
    a.href = './iframe.html?id=' + game.id + (isPort ? '&port=true' : '');
    a.classList.add('game-link');
    a.dataset.gameId = game.id;
    a.dataset.nsfw = String(isNsfw);

    const card = document.createElement('div');
    card.classList.add('card');

    if (game.img && game.img.trim() !== "") {
      const imgBubble = document.createElement('div');
      imgBubble.classList.add('image-bubble');

      const img = document.createElement('img');
      img.src = `${imgBaseUrl}/${game.img}`;
      img.alt = game.name;
      img.loading = "lazy";

      img.onerror = function () {
        imgBubble.style.display = 'none';
      };

      imgBubble.appendChild(img);
      card.appendChild(imgBubble);
    }

    const title = document.createElement('span');
    title.classList.add('game-title');
    title.textContent = game.name;
    card.appendChild(title);

    a.appendChild(card);
    container.appendChild(a);
    renderedGameLinks.push(a);
  });

  setupListControls(container);
  setupNsfwToggle();
  applyGameFilters();
});

function openDmcaModal() {
  const modal = document.getElementById('dmca-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeDmcaModal() {
  const modal = document.getElementById('dmca-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function setupDmcaModal() {
  const dmcaButton = document.getElementById('dmca');
  const modal = document.getElementById('dmca-modal');
  const closeButton = document.getElementById('dmca-modal-close');
  if (!dmcaButton || !modal || !closeButton) return;

  dmcaButton.addEventListener('click', openDmcaModal);
  closeButton.addEventListener('click', closeDmcaModal);

  modal.addEventListener('click', function (event) {
    if (event.target === modal) closeDmcaModal();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeDmcaModal();
  });
}

window.dmca = openDmcaModal;
setupDmcaModal();
