const grid = document.querySelector('#game-grid');
const search = document.querySelector('#search');
const emptyState = document.querySelector('#empty-state');
const count = document.querySelector('#game-count');
let activeFilter = 'all';

const genreLabels = { game: '게임', collection: '게임 모음', community: '커뮤니티' };

function renderGames() {
  const query = search.value.trim().toLowerCase();
  const visible = games.filter((game) => {
    const matchesFilter = activeFilter === 'all' || game.genre === activeFilter;
    const matchesSearch = `${game.title} ${game.creator} ${game.description}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  grid.innerHTML = visible.map((game, index) => `
    <article class="game-card ${game.featured ? 'is-featured' : ''}" style="--delay: ${index * 50}ms">
      <a class="game-link" href="${game.url}" ${game.url === '#' ? 'aria-disabled="true" onclick="return false"' : ''}>
        <div class="game-art art-${game.color}"><span class="game-emoji" aria-hidden="true">${game.emoji}</span><span class="play-badge">열기 <b aria-hidden="true">↗</b></span></div>
        <div class="game-info"><div class="game-meta"><span>${genreLabels[game.genre]}</span>${game.featured ? '<span class="featured-label">추천</span>' : ''}</div><h3>${game.title}</h3><p>${game.description}</p><small>제작 · ${game.creator}</small></div>
      </a>
    </article>`).join('');
  emptyState.hidden = visible.length !== 0;
  count.textContent = String(games.length).padStart(2, '0');
}

document.querySelectorAll('.filter-chip').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-chip').forEach((chip) => {
      const selected = chip === button;
      chip.classList.toggle('is-active', selected);
      chip.setAttribute('aria-pressed', selected);
    });
    renderGames();
  });
});
search.addEventListener('input', renderGames);
renderGames();
