// Fills in the 4 stat boxes using the full movie list
function renderStats(movies) {
  // Total number of movies watched
  document.getElementById('stat-watched').textContent = movies.length;

  // Average rating
  let totalScore = 0;
  let ratedCount = 0;
  movies.forEach(function(movie) {
    if (movie.score != null) {
      totalScore += movie.score;
      ratedCount++;
    }
  });
  let avg = '—';
  if (ratedCount > 0) {
    avg = (totalScore / ratedCount).toFixed(1);
  }
  document.getElementById('stat-avg').innerHTML = avg + '<span style="font-size:0.5em; color:#888880;">/5</span>';

  // Most watched genre — count how many times each genre appears
  const genreCounts = {};
  movies.forEach(function(movie) {
    if (!movie.genre) return;

    // A movie can have multiple genres separated by commas e.g. "Drama, Romance"
    const genres = movie.genre.split(',');
    genres.forEach(function(genre) {
      const name = genre.trim();
      if (genreCounts[name] == null) {
        genreCounts[name] = 0;
      }
      genreCounts[name]++;
    });
  });

  // Find whichever genre has the highest count
  let topGenre = '—';
  let topCount = 0;
  Object.keys(genreCounts).forEach(function(genre) {
    if (genreCounts[genre] > topCount) {
      topCount = genreCounts[genre];
      topGenre = genre;
    }
  });
  document.getElementById('stat-fav-genre').textContent = topGenre;

  // Rewatch worthy — show as a percentage of total movies
  let rewatchCount = 0;
  movies.forEach(function(movie) {
    if (movie.score >= 4) {
      rewatchCount++;
    }
  });
  const rewatchPct = movies.length > 0 ? Math.round((rewatchCount / movies.length) * 100) : 0;
  document.getElementById('stat-rewatch').textContent = rewatchPct + '%';
}

// Builds and displays the Top 5 movie cards
function renderTop5(movies) {
  const grid = document.getElementById('top5-grid');

  // If no movies were returned, show a message
  if (movies.length === 0) {
    grid.innerHTML = '<p style="color:#888;font-size:0.8rem;">No movies found.</p>';
    return;
  }

  // Build the HTML for each top 5 card
  let cards = '';
  movies.forEach(function(movie) {
    // Pick a background color for the poster
    const bg = POSTER_BACKGROUNDS[movie.rank - 1] || '#181818';

    // Build the poster image tag if a poster exists
    let posterImg = '';
    if (movie.poster_image) {
      posterImg = `<img src="images/${escapeHTML(movie.poster_image)}" alt="${escapeHTML(movie.title)}"
        style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;"
        onerror="this.style.display='none'"/>`;
    }

    // Build the year, dot, and director spans separately
    let yearSpan = '';
    if (movie.release_year) yearSpan = `<span class="year">${movie.release_year}</span>`;

    let dotSpan = '';
    if (movie.release_year && movie.director) dotSpan = `<span class="dot"> · </span>`;

    let directorSpan = '';
    if (movie.director) directorSpan = `<span class="director">${escapeHTML(movie.director)}</span>`;

    // Build the verdict line if one exists
    let verdictLine = '';
    if (movie.verdict) verdictLine = `<p class="top5-verdict">"${escapeHTML(movie.verdict)}"</p>`;

    cards += `
      <div class="top5-card">
        <div class="top5-rank">#${movie.rank}</div>
        <div class="poster poster-sm" style="background:${bg};position:relative;overflow:hidden;">
          ${posterImg}
        </div>
        <div class="top5-info">
          <h4>${escapeHTML(movie.title)}</h4>
          <div class="card-meta">${yearSpan}${dotSpan}${directorSpan}</div>
          <div class="card-stars">${convertScoreToStars(movie.score)}</div>
          ${verdictLine}
        </div>
      </div>
    `;
  });

  grid.innerHTML = cards;
}

// Fetches all movies then renders stats and top 5
async function loadAboutPage() {
  try {
    const response = await fetch('database/movies.json');
    if (!response.ok) throw new Error();

    const movies = await response.json();

    // Filter top 5 by hardcoded IDs in ranked order
    const top5_ids = [10, 9, 44, 14, 18];
    const top5 = [];
    top5_ids.forEach(function(id, index) {
      movies.forEach(function(movie) {
        if (movie.id === id) {
          movie.rank = index + 1;
          top5.push(movie);
        }
      });
    });

    renderStats(movies);
    renderTop5(top5);

  } catch (error) {
    // Wait 2 seconds and try again
    setTimeout(loadAboutPage, 2000);
  }
}

// Run when the page loads
loadAboutPage();
