const API_KEY = "4e19fc05";
const baseurl = "http://www.omdbapi.com/?";

// DOM References
const searchSection = document.getElementById("search-section");
const resultsContainer = document.getElementById("search-results");
const searchBox = document.getElementById("movie-search-box");
const watchlistSection = document.getElementById("watchlist-section");
const watchlistContainer = document.getElementById("watchlist");

// initialize local storage
function initLocalStorage() {
  if (!localStorage.getItem("watchlist")) {
    localStorage.setItem("watchlist", JSON.stringify([]));
  }
}
initLocalStorage();

// get watchlist from local storage
function getWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  console.log("movies in watchlist", watchlist);
  return watchlist;
}

// search for a movie from the api
async function findMovies() {
  const query = searchBox.value.trim();
  if (!query) {
    console.log("Search query is empty");
    return;
  }
  console.log(`Searching for "${query}"`);

  try {
    const response = await fetch(
      `${baseurl}apikey=${API_KEY}&s=${query}&type=movie`
    );
    console.log("response", response);

    if (!response.ok) {
      throw new Error("Failed to fetch movie data");
    }

    const data = await response.json();
    console.log("data", data);

    if (data.Response === "True") {
      console.log("Search results:", data.Search);

      displayMovies(
        data.Search.map((movie) => ({
          title: movie.Title,
          year: movie.Year,
          imdbID: movie.imdbID,
          poster:
            movie.Poster !== "N/A" ? movie.Poster : "./assets/default-img.png",
        }))
      );
    } else {
      alert("No results found!", data.Error);
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
  }
}

function displayMovies(movies) {
  resultsContainer.innerHTML = "";

  movies.forEach((movie) => {
    let movieElement = document.createElement("div");
    movieElement.classList.add("movie-card");
    movieElement.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='./assets/default-img.png'">
            <h3>${movie.title} (${movie.year})</h3>
            <button onclick="addToWatchlist('${movie.imdbID}')">Add to Watchlist</button>
        `;
    resultsContainer.appendChild(movieElement);
  });
}

async function addToWatchlist(imdbID) {
  let watchlist = getWatchlist();

  console.log(`Adding movie with imdbID: ${imdbID} to watchlist`);

  try {
    const response = await fetch(`${baseurl}i=${imdbID}&apikey=${API_KEY}`);
    const movie = await response.json();
    console.log("movie details fetched", movie);

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

function displayWatchlist() {
  console.log("Displaying watchlist...");
  watchlistContainer.innerHTML = "";
  const watchlist = getWatchlist();

  if (watchlist.length === 0) {
    watchlistContainer.innerHTML = "<p>Your watchlist is empty!</p>";
    return;
  }

  watchlist.forEach((movie) => {
    let movieElement = document.createElement("div");
    movieElement.classList.add("movie-card");
    movieElement.innerHTML = `
            <img src="${movie.poster}" alt="${
      movie.title
    }" onerror="this.src='./assets/default-img.png'">
            <h3>${movie.title} (${movie.year})</h3>
            <p>${movie.plot}</p>
            <label>
                <input type="checkbox" ${
                  movie.watched ? "checked" : ""
                } onchange="toggleWatched('${movie.imdbID}')">Watched
            </label>
            <button onclick="removeFromWatchlist('${
              movie.imdbID
            }')">Remove</button>
            `;
    watchlistContainer.appendChild(movieElement);
  });
}

function toggleWatched(imdbID) {
  console.log(`Toggle watched status for ${imdbID}`);

  let watchlist = getWatchlist();
  let movieIndex = watchlist.findIndex((movie) => movie.imdbID === imdbID);

  if (movieIndex !== -1) {
    watchlist[movieIndex].watched = !watchlist[movieIndex].watched;
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    console.log("Watched status updated", watchlist[movieIndex]);

    displayWatchlist();
  }
}

function removeFromWatchlist(imdbID) {
  if (
    !confirm("Are you sure you want to remove this movie from your watchlist?")
  )
    return;
  console.log(`Removing movie with imdbID: ${imdbID} from watchlist`);
  let watchlist = getWatchlist().filter((movie) => movie.imdbID !== imdbID);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  console.log("Movie removed from watchlist", watchlist);
  displayWatchlist();
}

/* ===== Navigation ===== */

function showWatchlist() {
  searchSection.style.display = "none";
  watchlistSection.style.display = "block";
  displayWatchlist();
}

function showSearch() {
  searchSection.style.display = "block";
  watchlistSection.style.display = "none";
}

// eventlistener for local storage
window.addEventListener("storage", displayWatchlist);
