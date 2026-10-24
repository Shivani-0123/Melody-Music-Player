
// ==========================================
// MELODY MUSIC PLAYER
// Complete JavaScript Code
// ==========================================

// ===== GET HTML ELEMENTS =====
const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");

const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");

const volume = document.getElementById("volume");
const muteBtn = document.getElementById("mute-btn");
const volumeValue = document.getElementById("volume-value");
const visualizer = document.getElementById("visualizer");

const songSearch = document.getElementById("song-search");
const clearSearchBtn = document.getElementById("clear-search");


const favoriteBtn = document.getElementById("favorite-btn");
const playlist = document.getElementById("playlist");
const songCount = document.getElementById("song-count");

const recentlyPlayedList = document.getElementById("recently-played-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

const allSongsBtn = document.getElementById("all-songs-btn");
const favoritesFilterBtn = document.getElementById("favorites-filter-btn");

let showingFavoritesOnly = false;



// ===== SONG COLLECTION =====
const songs = [
    {
        title: "Midnight Dreams",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600",
        duration: "0:00"
    },
    {
        title: "Electric Nights",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600",
        duration: "0:00"
    },
    {
        title: "Lost in Music",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600",
        duration: "0:00"
    }
];


// ===== PLAYER VARIABLES =====
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let previousVolume = 0.7;
let searchQuery = "";
let recentlyPlayed = JSON.parse(
    localStorage.getItem("melodyRecentlyPlayed") || "[]"
);



// ===== LOAD SAVED FAVORITES =====
function getSavedFavorites() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("melodyFavorites") || "[]"
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        // Keep only favorites that exist in this playlist.
        return saved.filter(title =>
            songs.some(song => song.title === title)
        );
    } catch (error) {
        console.error("Could not load favorites:", error);
        return [];
    }
}

let favorites = getSavedFavorites();


// ===== SAVE FAVORITES =====
function saveFavorites() {
    try {
        localStorage.setItem(
            "melodyFavorites",
            JSON.stringify(favorites)
        );
    } catch (error) {
        console.error("Could not save favorites:", error);
        alert("Favorites could not be saved in this browser.");
    }
}


// ===== FORMAT TIME =====
function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
}


// ===== UPDATE FAVORITE HEART =====
function updateFavoriteButton() {
    const song = songs[currentSongIndex];

    const isFavorite = favorites.includes(song.title);

    favoriteBtn.textContent = isFavorite ? "♥" : "♡";

    favoriteBtn.classList.toggle("active", isFavorite);

    favoriteBtn.setAttribute(
        "aria-label",
        isFavorite ? "Remove from favorites" : "Add to favorites"
    );
}


function saveRecentlyPlayed(song) {
    recentlyPlayed = recentlyPlayed.filter(
        title => title !== song.title
    );

    recentlyPlayed.unshift(song.title);

    // Sirf latest 10 songs rakho
    recentlyPlayed = recentlyPlayed.slice(0, 10);

    localStorage.setItem(
        "melodyRecentlyPlayed",
        JSON.stringify(recentlyPlayed)
    );
    renderRecentlyPlayed();
}

function renderRecentlyPlayed() {
    recentlyPlayedList.innerHTML = "";

    if (recentlyPlayed.length === 0) {
        const message = document.createElement("p");
        message.className = "recent-empty-message";
        message.textContent = "No recently played songs yet.";
        recentlyPlayedList.appendChild(message);
        return;
    }

    recentlyPlayed.forEach(title => {
        const song = songs.find(item => item.title === title);

        if (!song) return;

        const item = document.createElement("div");
        item.className = "recent-song-item";

        const img = document.createElement("img");
        img.src = song.cover;
        img.alt = `${song.title} cover`;

        const info = document.createElement("div");
        info.className = "recent-song-info";

        const name = document.createElement("h4");
        name.textContent = song.title;

        const artist = document.createElement("p");
        artist.textContent = song.artist;

        info.appendChild(name);
        info.appendChild(artist);

        item.appendChild(img);
        item.appendChild(info);

        item.addEventListener("click", () => {
            const index = songs.findIndex(
                track => track.title === song.title
            );

            if (index !== -1) {
                loadSong(index);
                playSong();
            }
        });

        recentlyPlayedList.appendChild(item);
    });
}


// ===== LOAD SONG =====
function loadSong(index) {
    currentSongIndex = index;

    visualizer.classList.remove("playing");

    const song = songs[currentSongIndex];

    audio.src = song.src;

    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    cover.src = song.cover;

    currentTime.textContent = "0:00";
    duration.textContent = song.duration;

    progress.value = 0;

    progress.style.setProperty("--progress", "0%");

    updateFavoriteButton();
    renderPlaylist();

    audio.load();
}


// ===== PLAY SONG =====
async function playSong() {
    try {
        await audio.play();
        saveRecentlyPlayed(songs[currentSongIndex]);
        isPlaying = true;

        playBtn.textContent = "Ⅱ";

        playBtn.setAttribute("aria-label", "Pause");

        renderPlaylist();
    } catch (error) {
        isPlaying = false;

        playBtn.textContent = "▶";

        playBtn.setAttribute("aria-label", "Play");

        console.error("Unable to play audio:", error);

        alert(
            "Unable to play the song. Please check your internet connection and try again."
        );
    }
}


// ===== PAUSE SONG =====
function pauseSong() {
    audio.pause();

    isPlaying = false;

    playBtn.textContent = "▶";

    playBtn.setAttribute("aria-label", "Play");

    renderPlaylist();
}


// ===== PLAY / PAUSE BUTTON =====
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});


// ===== NEXT SONG =====
function nextSong() {
    let nextIndex;

    if (isShuffle && songs.length > 1) {
        do {
            nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === currentSongIndex);
    } else {
        nextIndex = (currentSongIndex + 1) % songs.length;
    }

    loadSong(nextIndex);

    playSong();
}

nextBtn.addEventListener("click", nextSong);


// ===== PREVIOUS SONG =====
prevBtn.addEventListener("click", () => {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    const previousIndex =
        (currentSongIndex - 1 + songs.length) % songs.length;

    loadSong(previousIndex);

    playSong();
});


// ===== UPDATE SONG DURATION =====
audio.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(audio.duration)) {
        songs[currentSongIndex].duration =
            formatTime(audio.duration);

        duration.textContent = formatTime(audio.duration);

        renderPlaylist();
    }
});


// ===== UPDATE PROGRESS BAR AND TIME =====
audio.addEventListener("timeupdate", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const percentage =
            (audio.currentTime / audio.duration) * 100;

        progress.value = percentage;

        progress.style.setProperty(
            "--progress",
            `${percentage}%`
        );

        currentTime.textContent =
            formatTime(audio.currentTime);

        duration.textContent =
            formatTime(audio.duration);
    }
});


// ===== SEEK SONG =====
progress.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime =
            (Number(progress.value) / 100) * audio.duration;
    }
});


// ===== VOLUME CONTROL =====
audio.volume = Number(volume.value);

previousVolume = audio.volume;

function updateVolumeDisplay() {
    const muted = audio.muted || audio.volume === 0;

    muteBtn.textContent = muted ? "🔇" : "🔊";

    muteBtn.setAttribute(
        "aria-label",
        muted ? "Unmute" : "Mute"
    );

    volumeValue.textContent = audio.muted
        ? "Muted"
        : `${Math.round(audio.volume * 100)}%`;
}

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);

    if (audio.volume > 0) {
        previousVolume = audio.volume;
    }

    // Moving the volume slider restores sound.
    audio.muted = false;

    updateVolumeDisplay();
});


// ===== MUTE / UNMUTE =====
muteBtn.addEventListener("click", () => {
    if (audio.muted || audio.volume === 0) {
        audio.muted = false;

        if (audio.volume === 0) {
            audio.volume = previousVolume || 0.7;
            volume.value = audio.volume;
        }
    } else {
        previousVolume = audio.volume;

        audio.muted = true;
    }

    updateVolumeDisplay();
});


// ===== SHUFFLE MODE =====
shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;

    shuffleBtn.classList.toggle("active", isShuffle);

    shuffleBtn.title = isShuffle
        ? "Shuffle On"
        : "Shuffle Off";
});


// ===== REPEAT MODE =====
repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;

    audio.loop = isRepeat;

    repeatBtn.classList.toggle("active", isRepeat);

    repeatBtn.title = isRepeat
        ? "Repeat On"
        : "Repeat Off";
});


// ===== AUTOMATICALLY PLAY NEXT SONG =====
audio.addEventListener("ended", () => {
    if (!isRepeat) {
        nextSong();
    }
});



// ===== PLAYLIST FILTER BUTTONS =====

allSongsBtn.addEventListener("click", () => {
    showingFavoritesOnly = false;

    allSongsBtn.classList.add("active");
    favoritesFilterBtn.classList.remove("active");

    renderPlaylist();
});

favoritesFilterBtn.addEventListener("click", () => {
    showingFavoritesOnly = true;

    favoritesFilterBtn.classList.add("active");
    allSongsBtn.classList.remove("active");

    renderPlaylist();
});


// ===== FAVORITE BUTTON =====
favoriteBtn.addEventListener("click", () => {
    const song = songs[currentSongIndex];

    if (favorites.includes(song.title)) {
        favorites = favorites.filter(
            title => title !== song.title
        );
    } else {
        favorites.push(song.title);
    }

    // Save favorites before updating the interface.
    saveFavorites();

    updateFavoriteButton();

    renderPlaylist();
});


songSearch.addEventListener("input", () => {
    searchQuery = songSearch.value.trim().toLowerCase();

    clearSearchBtn.classList.toggle(
        "visible",
        searchQuery.length > 0
    );

    renderPlaylist();
});

clearSearchBtn.addEventListener("click", () => {
    songSearch.value = "";
    searchQuery = "";

    clearSearchBtn.classList.remove("visible");

    renderPlaylist();
});


// ===== CREATE AND DISPLAY PLAYLIST =====
function renderPlaylist() {
    
    playlist.innerHTML = "";

    
    const visibleSongs = songs
        .map((song, index) => ({ song, index }))
        .filter(({ song }) =>
            (!showingFavoritesOnly ||
                favorites.includes(song.title)) &&
            (`${song.title} ${song.artist}`
                .toLowerCase()
                .includes(searchQuery))
        );


    songCount.textContent = `${visibleSongs.length} songs`;

    visibleSongs.forEach(({ song, index }) => {

        const item = document.createElement("div");

        item.className = "song-item";

        if (index === currentSongIndex) {
            item.classList.add("active");
        }

        // Album artwork
        const img = document.createElement("img");

        img.src = song.cover;
        img.alt = `${song.title} album artwork`;
        img.loading = "lazy";

        // Song information
        const info = document.createElement("div");

        info.className = "song-info";

        const title = document.createElement("h4");

        title.textContent =
            `${index === currentSongIndex && isPlaying ? "♫ " : ""}${song.title}`;

        const artist = document.createElement("p");

        artist.textContent =
            `${song.artist}${favorites.includes(song.title) ? " ♥" : ""}`;

        // Song duration
        const songDuration = document.createElement("span");

        songDuration.className = "song-duration";
        songDuration.textContent = song.duration;

        // Assemble playlist item
        info.appendChild(title);
        info.appendChild(artist);

        item.appendChild(img);
        item.appendChild(info);
        item.appendChild(songDuration);

        // Select and play a song
        item.addEventListener("click", () => {
            loadSong(index);

            playSong();
        });

        playlist.appendChild(item);
    });
}


// ===== AUDIO PLAY EVENT =====
audio.addEventListener("play", () => {
    isPlaying = true;

    playBtn.textContent = "Ⅱ";
    playBtn.setAttribute("aria-label", "Pause");

    visualizer.classList.remove("playing");

    // Force the browser to restart the animation.
    void visualizer.offsetWidth;

    visualizer.classList.add("playing");

    renderPlaylist();
});



// ===== AUDIO PAUSE EVENT =====

audio.addEventListener("pause", () => {
    isPlaying = false;

    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");

    visualizer.classList.remove("playing");

    renderPlaylist();
});



// ===== AUDIO ERROR =====
audio.addEventListener("error", () => {
    console.error(
        "Audio could not be loaded. Check your internet connection or audio URL."
    );
});


// ===== INITIALIZE PLAYER =====
loadSong(0);

updateVolumeDisplay();

console.log("Melody Music Player is ready!");


/* ===== KEYBOARD CONTROLS ===== */

document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement.tagName;

    // Search ya kisi input mein type karte waqt shortcuts na chalein
    if (
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        activeTag === "SELECT" ||
        document.activeElement.isContentEditable
    ) {
        return;
    }

    // Space = Play / Pause
    if (event.code === "Space") {
        event.preventDefault();

        if (audio.paused) {
            playSong();
        } else {
            pauseSong();
        }
    }

    // Right Arrow = Next Song
    else if (event.key === "ArrowRight") {
        nextBtn.click();
    }

    // Left Arrow = Previous Song
    else if (event.key === "ArrowLeft") {
        prevBtn.click();
    }

    // M = Mute / Unmute
    else if (event.key.toLowerCase() === "m") {
        muteBtn.click();
    }
});

renderRecentlyPlayed();


clearHistoryBtn.addEventListener("click", () => {
    recentlyPlayed = [];

    localStorage.removeItem("melodyRecentlyPlayed");

    renderRecentlyPlayed();
});
