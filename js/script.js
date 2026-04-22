// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
const API_KEY = "NOvP0tOlfIblslrnEhwqojOf8WeXLP0EbOQFQ0as";
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');
const mediaModal = document.getElementById('mediaModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalMediaContainer = document.getElementById('modalMediaContainer');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalFavoriteBtn = document.getElementById('modalFavoriteBtn');
const favoritesGallery = document.getElementById('favoritesGallery');

const FAVORITES_STORAGE_KEY = 'nasaFavorites';

// We keep the latest API items here so clicks can open details in the modal.
let currentItems = [];
let selectedModalItem = null;

// We store favorites in an object so we can quickly check if an item is already saved.
let favoriteItemsByDate = loadFavoritesFromStorage();

function loadFavoritesFromStorage() {
  const savedFavoritesText = localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!savedFavoritesText) {
    return {};
  }

  try {
    const parsedFavorites = JSON.parse(savedFavoritesText);
    if (parsedFavorites && typeof parsedFavorites === 'object') {
      return parsedFavorites;
    }
  } catch (error) {
    console.error('Could not parse favorites from storage:', error);
  }

  return {};
}

function saveFavoritesToStorage() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteItemsByDate));
}

function isItemFavorite(item) {
  return Boolean(item && favoriteItemsByDate[item.date]);
}

function updateFavoriteButtonLabel(buttonElement, item) {
  const itemIsFavorite = isItemFavorite(item);
  buttonElement.textContent = itemIsFavorite ? '♥' : '♡';
  buttonElement.setAttribute('aria-label', itemIsFavorite ? 'Remove from favorites' : 'Add to favorites');
  buttonElement.setAttribute('title', itemIsFavorite ? 'Remove from favorites' : 'Add to favorites');
  buttonElement.classList.toggle('is-favorite', itemIsFavorite);
}

function toggleFavorite(item) {
  if (!item || !item.date) {
    return;
  }

  if (isItemFavorite(item)) {
    delete favoriteItemsByDate[item.date];
  } else {
    favoriteItemsByDate[item.date] = item;
  }

  saveFavoritesToStorage();
  renderFavoritesGallery();
  renderGallery(currentItems);

  if (selectedModalItem && selectedModalItem.date === item.date) {
    updateFavoriteButtonLabel(modalFavoriteBtn, selectedModalItem);
  }
}

function renderFavoritesGallery() {
  const favoriteItems = Object.values(favoriteItemsByDate).sort((a, b) => b.date.localeCompare(a.date));

  if (favoriteItems.length === 0) {
    favoritesGallery.innerHTML = `<div class="placeholder">
      <div class="placeholder-icon">⭐</div>
      <p>Your favorite space images will appear here.</p>
    </div>`;
    return;
  }

  favoritesGallery.innerHTML = '';

  favoriteItems.forEach((item) => {
    const favoriteClass = isItemFavorite(item) ? 'favorite-toggle-btn is-favorite' : 'favorite-toggle-btn';

    if (item.media_type === 'image') {
      favoritesGallery.innerHTML += `<div class="card" data-favorite-date="${item.date}">
        <img src="${item.url}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.date}</p>
        <div class="card-actions">
          <button class="${favoriteClass}" type="button" data-favorite-date="${item.date}">♥</button>
        </div>
      </div>`;
    } else if (item.media_type === 'video') {
      favoritesGallery.innerHTML += `<div class="card" data-favorite-date="${item.date}">
        <video controls>
          <source src="${item.url}" type="video/mp4">
        </video>
        <h3>${item.title}</h3>
        <p>${item.date}</p>
        <div class="card-actions">
          <button class="${favoriteClass}" type="button" data-favorite-date="${item.date}">♥</button>
        </div>
      </div>`;
    }
  });

  favoritesGallery.querySelectorAll('button[data-favorite-date]').forEach((buttonElement) => {
    const favoriteDate = buttonElement.dataset.favoriteDate;
    updateFavoriteButtonLabel(buttonElement, favoriteItemsByDate[favoriteDate]);
  });
}

function renderGallery(items) {
  if (!Array.isArray(items) || items.length === 0) {
    gallery.innerHTML = `<div class="placeholder">
      <div class="placeholder-icon">🌌</div>
      <p>No media found for this date range. Try another range.</p>
    </div>`;
    return;
  }

  gallery.innerHTML = '';

  items.forEach((item, index) => {
    if (item.media_type === 'image') {
      const favoriteClass = isItemFavorite(item) ? 'favorite-toggle-btn is-favorite' : 'favorite-toggle-btn';
      gallery.innerHTML += `<div class="card" data-item-index="${index}">
        <img src="${item.url}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.date}</p>
        <div class="card-actions">
          <button class="${favoriteClass}" type="button" data-item-index="${index}" data-favorite-toggle="true">♥</button>
        </div>
      </div>`;
    } else if (item.media_type === 'video') {
      const favoriteClass = isItemFavorite(item) ? 'favorite-toggle-btn is-favorite' : 'favorite-toggle-btn';
      gallery.innerHTML += `<div class="card" data-item-index="${index}">
        <video controls>
          <source src="${item.url}" type="video/mp4">
        </video>
        <h3>${item.title}</h3>
        <p>${item.date}</p>
        <div class="card-actions">
          <button class="${favoriteClass}" type="button" data-item-index="${index}" data-favorite-toggle="true">♥</button>
        </div>
      </div>`;
    }
  });

  gallery.querySelectorAll('button[data-favorite-toggle="true"]').forEach((buttonElement) => {
    const index = Number(buttonElement.dataset.itemIndex);
    updateFavoriteButtonLabel(buttonElement, items[index]);
  });
}

const factsList = ["Jupiter can fit between Earth and the Moon!", "A day on Venus is longer than a year on Venus!", "The largest volcano in the solar system is on Mars!", "Neutron stars can spin at a rate of 600 rotations per second!", "The Milky Way galaxy is estimated to contain 100-400 billion stars!", "The Hubble Space Telescope has provided over 1.3 million observations since its launch in 1990!", "Saturn's rings are made mostly of ice particles!", "The Sun accounts for about 99.86% of the total mass of the Solar System!", "A spoonful of a neutron star would weigh about 6 billion tons on Earth!", "The Voyager 1 spacecraft is the farthest human-made object from Earth, currently in interstellar space!"];

function getRandomFact() {
  const randomIndex = Math.floor(Math.random() * factsList.length);
  return factsList[randomIndex];
}

const funFactElement = document.getElementById('funFact');
funFactElement.textContent = getRandomFact();

function openModal(item) {
  selectedModalItem = item;

  if (item.media_type === 'image') {
    modalMediaContainer.innerHTML = `<img src="${item.url}" alt="${item.title}">`;
  } else if (item.media_type === 'video') {
    modalMediaContainer.innerHTML = `<video controls src="${item.url}"></video>`;
  } else {
    modalMediaContainer.innerHTML = '<p>This media type is not supported in the modal view.</p>';
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation || 'No explanation available for this item.';
  if (item.media_type === 'image' || item.media_type === 'video') {
    modalFavoriteBtn.style.display = 'inline-block';
    updateFavoriteButtonLabel(modalFavoriteBtn, item);
  } else {
    modalFavoriteBtn.style.display = 'none';
  }
  mediaModal.style.display = 'flex';
}

function closeModal() {
  mediaModal.style.display = 'none';
  modalMediaContainer.innerHTML = '';
  selectedModalItem = null;
}

closeModalBtn.addEventListener('click', closeModal);

mediaModal.addEventListener('click', (event) => {
  if (event.target === mediaModal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mediaModal.style.display === 'flex') {
    closeModal();
  }
});

gallery.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('button[data-favorite-toggle="true"]');
  if (favoriteButton) {
    const index = Number(favoriteButton.dataset.itemIndex);
    const item = currentItems[index];
    if (item && (item.media_type === 'image' || item.media_type === 'video')) {
      toggleFavorite(item);
    }
    return;
  }

  const cardElement = event.target.closest('.card[data-item-index]');
  if (!cardElement) {
    return;
  }

  const index = Number(cardElement.dataset.itemIndex);
  const item = currentItems[index];
  if (item) {
    openModal(item);
  }
});

favoritesGallery.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('button[data-favorite-date]');
  if (favoriteButton) {
    const favoriteDate = favoriteButton.dataset.favoriteDate;
    const favoriteItem = favoriteItemsByDate[favoriteDate];
    if (favoriteItem) {
      toggleFavorite(favoriteItem);
    }
    return;
  }

  const cardElement = event.target.closest('.card[data-favorite-date]');
  if (!cardElement) {
    return;
  }

  const favoriteDate = cardElement.dataset.favoriteDate;
  const favoriteItem = favoriteItemsByDate[favoriteDate];
  if (favoriteItem) {
    openModal(favoriteItem);
  }
});

modalFavoriteBtn.addEventListener('click', () => {
  if (selectedModalItem && (selectedModalItem.media_type === 'image' || selectedModalItem.media_type === 'video')) {
    toggleFavorite(selectedModalItem);
  }
});

getImagesBtn.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // placeholder while loading
  gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images...</p></div>';

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`);
    const data = await response.json();
    currentItems = Array.isArray(data) ? data : [data];
    
    console.log(data); // Log the data to see its structure
    renderGallery(currentItems);
  } catch (error) {
    console.error('Error fetching images:', error);
    gallery.innerHTML = `<div class="placeholder">
      <div class="placeholder-icon">⚠️</div>
      <p>We could not load images right now. Please try again.</p>
    </div>`;
  }
});

renderFavoritesGallery();