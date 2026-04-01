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

// We keep the latest API items here so clicks can open details in the modal.
let currentItems = [];

const factsList = ["Jupiter can fit between Earth and the Moon!", "A day on Venus is longer than a year on Venus!", "The largest volcano in the solar system is on Mars!", "Neutron stars can spin at a rate of 600 rotations per second!", "The Milky Way galaxy is estimated to contain 100-400 billion stars!", "The Hubble Space Telescope has provided over 1.3 million observations since its launch in 1990!", "Saturn's rings are made mostly of ice particles!", "The Sun accounts for about 99.86% of the total mass of the Solar System!", "A spoonful of a neutron star would weigh about 6 billion tons on Earth!", "The Voyager 1 spacecraft is the farthest human-made object from Earth, currently in interstellar space!"];

function getRandomFact() {
  const randomIndex = Math.floor(Math.random() * factsList.length);
  return factsList[randomIndex];
}

const funFactElement = document.getElementById('funFact');
funFactElement.textContent = getRandomFact();

function openModal(item) {
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
  mediaModal.style.display = 'flex';
}

function closeModal() {
  mediaModal.style.display = 'none';
  modalMediaContainer.innerHTML = '';
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

getImagesBtn.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // placeholder while loading
  gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images...</p></div>';

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`);
    const data = await response.json();
    currentItems = data;
    
    console.log(data); // Log the data to see its structure
    gallery.innerHTML = ''; // Clear the loading message
    data.forEach((item, index) => {
      if (item.media_type === 'image') {
        gallery.innerHTML += `<div class="card" data-item-index="${index}">
          <img src="${item.url}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>${item.date}</p>
        </div>`;
      }else if(item.media_type === 'video'){
        gallery.innerHTML += `<div class="card" data-item-index="${index}">
          <video controls>
            <source src="${item.url}" type="video/mp4">
          </video>
          <h3>${item.title}</h3>
          <p>${item.date}</p>
        </div>`;
      }
    });
  } catch (error) {
    console.error('Error fetching images:', error);
  }
});