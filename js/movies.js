// Stores all movies loaded from the database
let movieList = [];

// Tracks the currently active filter and sort values
let selectedGenre = 'All';
let selectedRating = 'All';
let selectedSort = 'Newest';
let searchText = '';

// Get the search input and clear button from the page
const clearButton = document.getElementById('clear-search');
const searchInput = document.querySelector('.search-bar input');

// Counts up from 0 to a target number over a given duration (in milliseconds)
function animateCounter(element, target, duration) {
  const start = performance.now();

  function update(currentTime) {
    // Calculate how far along the animation we are (0 to 1)
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Set the current number based on progress
    element.textContent = Math.floor(progress * target);

    // Keep going until we reach the end
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

// Filters, sorts, and displays movies based on the active filters
function renderMovies() {
  const grid = document.getElementById('movies-grid');

  // Go through every movie and keep only the ones that match all active filters
  const filteredMovies = [];
  movieList.forEach(function(movie) {
    // Round the score to a whole number for star comparison
    let starCount = 0;
    if (movie.score != null) {
      starCount = Math.round(movie.score);
    }

    // Check if the movie's genre matches the selected genre filter
    let matchesGenre = false;
    if (selectedGenre === 'All') {
      matchesGenre = true;
    } else if (movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase())) {
      matchesGenre = true;
    }

    // Check if the movie's score matches the selected rating filter
    let matchesRating = false;
    if (selectedRating === 'All')                              matchesRating = true;
    if (selectedRating === '★★★★★' && starCount === 5)        matchesRating = true;
    if (selectedRating === '★★★★'  && starCount === 4)        matchesRating = true;
    if (selectedRating === '★★★'   && starCount === 3)        matchesRating = true;
    if (selectedRating === '★★ & below' && starCount <= 2)    matchesRating = true;

    // Check if the movie title contains the search text
    let matchesSearch = false;
    if (searchText === '') {
      matchesSearch = true;
    } else if (movie.title.toLowerCase().includes(searchText.toLowerCase())) {
      matchesSearch = true;
    }

    // Only keep the movie if it passes all three checks
    if (matchesGenre && matchesRating && matchesSearch) {
      filteredMovies.push(movie);
    }
  });

  // Sort the filtered movies based on the selected sort option
  filteredMovies.sort(function(a, b) {
    if (selectedSort === 'Newest')   return (b.release_year || 0) - (a.release_year || 0);
    if (selectedSort === 'Oldest')   return (a.release_year || 0) - (b.release_year || 0);
    if (selectedSort === 'Rating ↓') return (b.score || 0) - (a.score || 0);
    if (selectedSort === 'A–Z')      return a.title.localeCompare(b.title);
    return 0;
  });

  // If no movies matched, show a message with a clear search button
  if (filteredMovies.length === 0) {
    document.querySelector('.result-count strong').textContent = 0;

    // Build the "no results" message
    let noResultsMessage = 'No movies found';
    if (searchText) {
      noResultsMessage += ' for "<strong style="color:#DBD3D8;">' + searchText + '</strong>"';
    }
    noResultsMessage += '.';

    // Only show the clear button if there is an active search
    let clearButton = '';
    if (searchText) {
      clearButton = '<button onclick="clearSearch()" class="btn btn-outline" style="font-size:0.8rem;padding:0.5rem 1.25rem;">Clear Search</button>';
    }

    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding: 3rem 0;">
        <p style="color:#888;font-size:0.9rem;margin-bottom:1rem;">${noResultsMessage}</p>
        ${clearButton}
      </div>
    `;
    return;
  }

  // Update the result count label to reflect filtered results
  document.querySelector('.result-count strong').textContent = filteredMovies.length;

  // Build a card for each filtered movie and insert them all into the grid
  let cards = '';
  filteredMovies.forEach(function(movie, index) {
    cards += buildMovieCard(movie, index);
  });
  grid.innerHTML = cards;
}

// Fetches all movies from the server and updates the page stats
async function loadMoviesFromDatabase() {
  const grid = document.getElementById('movies-grid');

  try {
    // Ask the server for all movies
    const response = await fetch('database/movies.json');

    // If the server returned an error, stop here
    if (!response.ok) throw new Error();

    // Convert the response into a usable JavaScript array
    movieList = await response.json();

    // Animate the stat numbers at the top of the page
    animateCounter(document.getElementById('stat-total'), movieList.length, 1000);

    // Count how many movies have a perfect score of 5
    let masterpieceCount = 0;
    movieList.forEach(function(movie) {
      if (movie.score >= 5) masterpieceCount++;
    });
    animateCounter(document.getElementById('stat-masterpieces'), masterpieceCount, 1000);

    // Count how many movies have a score of 2 or below
    let skipCount = 0;
    movieList.forEach(function(movie) {
      if (movie.score != null && movie.score <= 2) skipCount++;
    });
    animateCounter(document.getElementById('stat-skip'), skipCount, 1000);

    // Count how many unique genres exist across all movies
    const genreSet = new Set();
    movieList.forEach(function(movie) {
      if (movie.genre) {
        const genres = movie.genre.split(',');
        genres.forEach(function(genre) {
          genreSet.add(genre.trim());
        });
      }
    });
    animateCounter(document.getElementById('stat-genres'), genreSet.size, 1000);

    // Now render the movie cards
    renderMovies();

  } catch (error) {
    // Server not ready yet — show loading message and try again in 2 seconds
    grid.innerHTML = '<p style="color:#888;font-size:0.8rem;">Loading...</p>';
    setTimeout(loadMoviesFromDatabase, 2000);
  }
}

// When the user types in the search box, update the search text and re-render
searchInput.addEventListener('input', function() {
  searchText = searchInput.value;

  // Show the X clear button only if there is text in the search box
  if (searchInput.value) {
    clearButton.style.display = 'block';
  } else {
    clearButton.style.display = 'none';
  }

  renderMovies();
});

// Clears the search input and re-renders — called by the empty state button
function clearSearch() {
  searchInput.value = '';
  searchText = '';
  clearButton.style.display = 'none';
  renderMovies();
}

// When the user clicks the X button, clear the search and re-render
clearButton.addEventListener('click', function() {
  clearSearch();
});

// Handle clicks on the filter buttons (Genre, Rating, Sort By)
const filterGroups = document.querySelectorAll('.filter-groups');
filterGroups.forEach(function(filterGroup, groupIndex) {
  const buttons = filterGroup.querySelectorAll('.filter-btn');

  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      // Remove active state from all buttons in this group
      buttons.forEach(function(btn) {
        btn.classList.remove('active');
      });

      // Set this button as active
      button.classList.add('active');

      // Update the correct filter variable based on which row was clicked
      if (groupIndex === 0) selectedGenre  = button.textContent.trim();
      if (groupIndex === 1) selectedRating = button.textContent.trim();
      if (groupIndex === 2) selectedSort   = button.textContent.trim();

      renderMovies();
    });
  });
});

// Load movies when the page first opens
loadMoviesFromDatabase();