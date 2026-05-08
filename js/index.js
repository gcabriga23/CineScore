// Loads and displays the featured movies on the home page
async function loadLatestMovies() {
  // Get the grid element where movie cards will be inserted
  const grid = document.getElementById('latest-grid');
 
  try {
    // Ask the server for the full list of movies
    const response = await fetch('database/movies.json');
 
    // If the server returned an error, stop here
    if (!response.ok) throw new Error();
 
    // Convert the server response into a usable JavaScript array
    const movieList = await response.json();
 
    // Keep only movies with a perfect score of 5, and take at most 5 of them
    const featuredMovies = [];
    movieList.forEach(function(movie) {
      if (movie.score === 5 && featuredMovies.length < 5) {
        featuredMovies.push(movie);
      }
    });
 
    // If no perfect-score movies exist, show a message instead
    if (featuredMovies.length === 0) {
      grid.innerHTML = '<p style="color:#888;font-size:0.8rem;">No featured movies yet.</p>';
      return;
    }
 
    // Build a card for each featured movie and insert them into the grid
    let cards = '';
    featuredMovies.forEach(function(movie, index) {
      cards += buildMovieCard(movie, index);
    });
    grid.innerHTML = cards;
 
  } catch (error) {
    // If the server isn't ready yet, wait 2 seconds and try again
    setTimeout(loadLatestMovies, 2000);
  }
}
 
// Run the function when the page loads
loadLatestMovies();