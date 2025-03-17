// ✅ Load playlist from localStorage (persistent storage)
const playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentIndex = 0;

function PlayAudio(audio_url, song_id, fromIndex = false) {
    var audio = document.getElementById("player");
    var source = document.getElementById("audioSource");

    if (!audio || !source) {
       
        return;
    }

    var nameElement = document.getElementById(song_id + "-n");
    var albumElement = document.getElementById(song_id + "-a");
    var imageElement = document.getElementById(song_id + "-i");

    var name = nameElement ? nameElement.textContent : "Unknown";
    var album = albumElement ? albumElement.textContent : "Unknown";
    var image = imageElement ? imageElement.getAttribute("src") : "default.jpg";

    document.title = name + " - " + album;
    document.getElementById("player-name").textContent = name;
    document.getElementById("player-album").textContent = album;
    document.getElementById("player-image").setAttribute("src", image);

    const song = { url: audio_url, name, album, image, id: song_id };

    let existingIndex = playlist.findIndex(s => s.url === audio_url);

    if (fromIndex) {
        // ✅ If song is played from index, move it to the top (reverse order)
        if (existingIndex !== -1) {
            playlist.splice(existingIndex, 1);
        }
        playlist.unshift(song);
        savePlaylist();
        currentIndex = 0;
    } else {
        // ✅ Always insert new songs at the beginning (reverse order)
        if (existingIndex === -1) {
            playlist.unshift(song);
            savePlaylist();
        }
        currentIndex = playlist.findIndex(s => s.url === audio_url);
    }

    

    source.src = audio_url;
    audio.load();
    audio.play();

    loadPlaylist(); // ✅ Update UI
}

function playNext() {
    if (playlist.length === 0) {
        
        return;
    }

    currentIndex = (currentIndex + 1) % playlist.length;
    const nextSong = playlist[currentIndex];
    PlayAudio(nextSong.url, nextSong.id);
}

function playPrevious() {
    if (playlist.length === 0) {
        
        return;
    }

    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevSong = playlist[currentIndex];
    PlayAudio(prevSong.url, prevSong.id);
}

// ✅ Save playlist in localStorage
function savePlaylist() {
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

// ✅ Load and display playlist
function loadPlaylist() {
    const container = document.getElementById("playlist-container");
    if (!container) {
        
        return;
    }

    container.innerHTML = "";
    if (playlist.length === 0) {
        container.innerHTML = "<p>No songs in the playlist.</p>";
        return;
    }

    playlist.forEach((song, index) => {
        const songElement = document.createElement("div");
        songElement.innerHTML = `
        <div class="song-item">
            <img id="${song.id}-i" src="${song.image}" alt="${song.name}" class="song-image">
            <div class="song-info">
                <span id="${song.id}-n" class="song-name"><strong>${song.name}</strong></span> - 
                <span id="${song.id}-a" class="song-album">${song.album}</span>
            </div>
            <div class="button-group">
                <button class="play-btn" onclick="PlayAudio('${song.url}', '${song.id}', true)">▶ Play</button>
                <button class="remove-btn" onclick="removeFromPlaylist(${index})">Remove</button>
            </div>
        </div>
        `;
        container.appendChild(songElement);
    });
}

// ✅ Remove song from playlist
function removeFromPlaylist(index) {
    playlist.splice(index, 1);
    savePlaylist();
    loadPlaylist();
}

// ✅ Play next song when the current one ends
document.getElementById("player").addEventListener("ended", playNext);

// ✅ Load playlist when the page loads
document.addEventListener("DOMContentLoaded", loadPlaylist);

