let sleepTimer = null;
let remainingTime = 0;

function setSleepTimer() {
    const minutes = parseInt(document.getElementById("sleep-timer-select").value);
    clearSleepTimer(); // ✅ Clear any existing timer
    if (minutes === 0) return; // If "OFF" selected, do nothing

    remainingTime = minutes * 60; // Convert minutes to seconds
    sleepTimer = setTimeout(stopPlayback, remainingTime * 1000);
    

    startSleepTimerCountdown();
}

function stopPlayback() {
    let audio = document.getElementById("player");
    if (audio) {
        audio.pause();
        
        document.getElementById("sleep-timer-display").textContent = "Sleep Timer: OFF";
    }
}

function clearSleepTimer() {
    if (sleepTimer) {
        clearTimeout(sleepTimer);
        sleepTimer = null;
        
        document.getElementById("sleep-timer-display").textContent = "Sleep Timer: OFF";
    }
}

// ✅ Countdown Display
function startSleepTimerCountdown() {
    let display = document.getElementById("sleep-timer-display");
    if (!display) return;

    display.textContent = `Sleep Timer: ${remainingTime / 60} minutes left`;

    let interval = setInterval(() => {
        if (remainingTime <= 0 || !sleepTimer) {
            clearInterval(interval);
            display.textContent = "Sleep Timer: OFF";
        } else {
            let minutes = Math.floor(remainingTime / 60);
            let seconds = remainingTime % 60;
            display.textContent = `Sleep Timer: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            remainingTime--;
        }
    }, 1000);
}



async function downloadSong(audio_url, song_id) {
    const nameElement = document.getElementById(`${song_id}-n`);
    const albumElement = document.getElementById(`${song_id}-a`);
    const imageElement = document.getElementById(`${song_id}-i`);

    const name = nameElement?.textContent || "Unknown";
    const album = albumElement?.textContent || "Unknown";
    const image = imageElement?.getAttribute("src") || "default.jpg";

    try {
        const response = await fetch(audio_url);
        const blob = await response.blob();

        const song = { url: audio_url, name, album, image, blob };
        await saveSongToDB(song);

        alert(`✅ "${name}" downloaded for offline playback!`);
    } catch (error) {
        console.error("❌ Download failed:", error);
    }
}

function saveToDevice(audio_url, filename) {
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dirEntry) {
        dirEntry.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
            const fileTransfer = new FileTransfer();
            fileTransfer.download(
                audio_url,
                fileEntry.toURL(),
                function () { alert("✅ File saved: " + fileEntry.toURL()); },
                function (error) { console.error("❌ Download failed:", error); },
                false
            );
        });
    });
}

// Retrieve saved favorites from localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Function to get currently playing song (Modify as per your player)
function getCurrentSong() {
    return {
        id: "123", // Replace with dynamic song ID
        name: "Song Name", // Replace with current song name
        artist: "Artist Name", // Replace with current artist name
        url: "song-url.mp3" // Replace with current song URL
    };
}

// Toggle favorite status
function toggleFavorite() {
    let currentSong = getCurrentSong();
    let favBtn = document.getElementById("fav-btn");

    let index = favorites.findIndex(song => song.id === currentSong.id);

    if (index === -1) {
        favorites.push(currentSong);
        favBtn.style.color = "red"; // Mark as favorite
    } else {
        favorites.splice(index, 1);
        favBtn.style.color = "black"; // Unmark favorite
    }

    // Save updated favorites list
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesPage();
}

// Update Favorites Page
function updateFavoritesPage() {
    if (window.location.pathname.includes("favorites.html")) {
        displayFavorites();
    }
}
