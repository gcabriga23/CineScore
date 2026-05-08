// A list of dark background colors used when a movie has no poster image
const POSTER_BACKGROUNDS = [
  '#0d1b2a', '#1a0a2e', '#1f0a00', '#0a1f0a',
  '#1a1a2e', '#1f1a0a', '#2e1a0a', '#0a2e2e',
  '#0a1f05', '#0a1f09'
];

// Takes a number score (1-5) and returns a star string like ★★★☆☆
function convertScoreToStars(score) {
  // If there is no score, return a dash
  if (score == null) return '—';

  // Make sure the score stays between 1 and 5, then round it
  const rounded = Math.round(score);
  const clamped = Math.min(5, Math.max(1, rounded));

  // Build the filled and empty stars
  const filled = '★'.repeat(clamped);
  const empty = '☆'.repeat(5 - clamped);

  return filled + empty;
}

// Replaces special characters so they don't break the HTML
// e.g. & becomes &amp;  < becomes &lt;  > becomes &gt;
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Builds the HTML for a single movie card
// movie = the movie data object, index = its position in the list
function buildMovieCard(movie, index) {
  // Pick a background color from the list based on the card's position
  const bg = POSTER_BACKGROUNDS[index % POSTER_BACKGROUNDS.length];

  // If the movie has a poster image, build the img tag — otherwise leave it empty
  let poster = '';
  if (movie.poster_image) {
    poster = `<img src="images/${escapeHTML(movie.poster_image)}" alt="${escapeHTML(movie.title)}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;" onerror="this.style.display='none'"/>`;
  }

  // If the movie has a synopsis, build the overlay div — otherwise leave it empty
  let synopsis = '';
  if (movie.synopsis) {
    synopsis = `<div class="poster-synopsis">${escapeHTML(movie.synopsis)}</div>`;
  }

  // If the movie has a release year, build the year span — otherwise leave it empty
  let year = '';
  if (movie.release_year) {
    year = `<span class="year">${movie.release_year}</span>`;
  }

  // build a colored tag for each genre of the movie
  let genre = '';
  if (movie.genre) {
    const genres = movie.genre.split(',');
    genres.forEach(function(g) {
      const name = g.trim();
      const genreClass = 'genre-' + name.toLowerCase().replace(/[^a-z]/g, '-');
      genre += `<span class="genre-tag ${genreClass}">${escapeHTML(name)}</span> `;
    });
  }

  // Return the full movie card HTML
  return `
    <div class="movie-card">
      <div class="poster" style="background:${bg};">
        ${poster}
        <div class="card-rating-overlay">${convertScoreToStars(movie.score)}</div>
        ${synopsis}
      </div>
      <div class="card-info">
        <h3>${escapeHTML(movie.title)}</h3>
        <div class="card-meta">${year}</div>
        <div class="card-bottom">
          <div class="card-stars">${convertScoreToStars(movie.score)}</div>
          ${genre}
        </div>
      </div>
    </div>
  `;
}