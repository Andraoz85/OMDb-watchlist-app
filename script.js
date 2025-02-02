const API_KEY = "4e19fc05";
const baseurl = "https://www.omdbapi.com/?";

document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  const searchSection = document.getElementById("search-section");
  const resultsContainer = document.getElementById("search-results");
  const searchBox = document.getElementById("movie-search-box");
  const watchlistSection = document.getElementById("watchlist-section");
  const watchlistContainer = document.getElementById("watchlist");
  const searchNavBtn = document.getElementById("searchNavBtn");
  const watchlistNavBtn = document.getElementById("watchlistNavBtn");
  const findMoviesBtn = document.getElementById("findMoviesBtn");

  // Initialize local storage
  function initLocalStorage() {
    if (!localStorage.getItem("watchlist")) {
      localStorage.setItem("watchlist", JSON.stringify([]));
    }
  }
  initLocalStorage();

  // event listeners to navigation buttons and search button
  searchNavBtn.addEventListener("click", showSearch);
  watchlistNavBtn.addEventListener("click", showWatchlist);
  findMoviesBtn.addEventListener("click", findMovies);

  // Event delegation for dynamically created elements:
  // Fo "Add to Watchlist" button in the search results
  resultsContainer.addEventListener("click", (event) => {
    if (event.target && event.target.matches(".add-watchlist-btn")) {
      const imdbID = event.target.dataset.imdbid;
      addToWatchlist(imdbID);
    }
  });

  // For toggling the "watched" checkbox in the watchlist
  watchlistContainer.addEventListener("change", (event) => {
    if (event.target && event.target.matches(".toggle-watched")) {
      const imdbID = event.target.dataset.imdbid;
      toggleWatched(imdbID);
    }
  });

  // For the "Remove" button in the watchlist
  watchlistContainer.addEventListener("click", (event) => {
    if (event.target && event.target.matches(".remove-watchlist-btn")) {
      const imdbID = event.target.dataset.imdbid;
      removeFromWatchlist(imdbID);
    }
  });

  // --- Functions ---

  /* 
  Reads the search query, 
  fetches movie data from the OMDb API,
  maps the returned data to a simpler format, and then passes it to displayMovies.
  */
  async function findMovies() {
    const query = searchBox.value.trim();
    if (!query) return;

    try {
      const response = await fetch(
        `${baseurl}apikey=${API_KEY}&s=${query}&type=movie`
      );
      if (!response.ok) throw new Error("Failed to fetch movie data");

      const data = await response.json();
      if (data.Response === "True") {
        displayMovies(
          data.Search.map((movie) => ({
            title: movie.Title,
            year: movie.Year,
            imdbID: movie.imdbID,
            poster:
              movie.Poster !== "N/A"
                ? movie.Poster
                : "./assets/default-img.png",
          }))
        );
      } else {
        alert("No results found!", data.Error);
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
    }
  }

  // Clears previous results, then create and append movie cards to the results container
  function displayMovies(movies) {
    resultsContainer.innerHTML = "";
    movies.forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.classList.add("movie-card");
      movieElement.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='./assets/default-img.png'">
        <h3>${movie.title} (${movie.year})</h3>
        <button class="add-watchlist-btn" data-imdbid="${movie.imdbID}">Add to Watchlist</button>
      `;
      resultsContainer.appendChild(movieElement);
    });
  }

  // Fetching full movie details from the OMDb API, checks if movie is already in watchlist,
  // if not, adds it to local storage
  async function addToWatchlist(imdbID) {
    let watchlist = getWatchlist();

    try {
      const response = await fetch(`${baseurl}i=${imdbID}&apikey=${API_KEY}`);
      const movie = await response.json();

      if (!watchlist.some((m) => m.imdbID === imdbID)) {
        watchlist.push({
          title: movie.Title,
          year: movie.Year,
          imdbID: movie.imdbID,
          plot: movie.Plot,
          poster:
            movie.Poster !== "N/A" ? movie.Poster : "./assets/default-img.png",
          watched: false,
        });
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        alert(`${movie.Title} was added to the watchlist!`);
      } else {
        alert(`${movie.Title} is already in the watchlist!`);
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
    }
  }

  // Retrieves the watchlist from local storage
  function getWatchlist() {
    return JSON.parse(localStorage.getItem("watchlist")) || [];
  }

  // Clears the current watchlist display and creates movie cards for each saved movie
  function displayWatchlist() {
    watchlistContainer.innerHTML = "";
    const watchlist = getWatchlist();

    if (watchlist.length === 0) {
      watchlistContainer.innerHTML = "<p>Your watchlist is empty!</p>";
      return;
    }

    watchlist.forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.classList.add("movie-card");
      movieElement.innerHTML = `
        <img src="${movie.poster}" alt="${
        movie.title
      }" onerror="this.src='./assets/default-img.png'">
        <h3>${movie.title} (${movie.year})</h3>
        <p>${movie.plot}</p>
        <label>
          <input type="checkbox" class="toggle-watched" data-imdbid="${
            movie.imdbID
          }" ${movie.watched ? "checked" : ""}> Watched
        </label>
        <button class="remove-watchlist-btn" data-imdbid="${
          movie.imdbID
        }">Remove</button>
      `;
      watchlistContainer.appendChild(movieElement);
    });
  }

  // Finds a movie in the watchlist (by IMDb ID) and toggles its "watched" status,
  // then saves and re-displays the watchlist.
  function toggleWatched(imdbID) {
    let watchlist = getWatchlist();
    const movieIndex = watchlist.findIndex((movie) => movie.imdbID === imdbID);

    if (movieIndex !== -1) {
      watchlist[movieIndex].watched = !watchlist[movieIndex].watched;
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      displayWatchlist();
    }
  }

  // Removes a movie from the watchlist
  function removeFromWatchlist(imdbID) {
    if (
      !confirm(
        "Are you sure you want to remove this movie from your watchlist?"
      )
    )
      return;
    const watchlist = getWatchlist().filter((movie) => movie.imdbID !== imdbID);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    displayWatchlist();
  }

  // ** Navigation functions **
  function showWatchlist() {
    searchSection.style.display = "none";
    watchlistSection.style.display = "block";
    displayWatchlist();
  }

  function showSearch() {
    searchSection.style.display = "block";
    watchlistSection.style.display = "none";
  }
});
