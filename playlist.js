// ✅ Fix corrupted localStorage data
try {
    let storedPlaylist = localStorage.getItem("playlist");
    window.playlist = storedPlaylist ? JSON.parse(storedPlaylist) : [];
} catch (error) {
    
    localStorage.removeItem("playlist"); // 🛠 Reset corrupted data
    window.playlist = [];
}

window.currentIndex = 0;

// ✅ गाणे प्ले करा पण त्यांची स्थान (Position) बदलेल नाही
function PlayAudio(audio_url, song_id) {
    

    var audio = document.getElementById("player");
    var source = document.getElementById("audioSource");

    if (!audio || !source) {
        
        return;
    }

    var nameElement = document.getElementById(`${song_id}-n`);
    var albumElement = document.getElementById(`${song_id}-a`);
    var imageElement = document.getElementById(`${song_id}-i`);

    if (!nameElement || !albumElement || !imageElement) {
        
        return;
    }

    var name = nameElement?.textContent || "Unknown";
    var album = albumElement?.textContent || "Unknown";
    var image = imageElement?.getAttribute("src") || "default.jpg";

    document.title = `${name} - ${album}`;
    document.getElementById("player-name").textContent = name;
    document.getElementById("player-album").textContent = album;
    document.getElementById("player-image").setAttribute("src", image);

    const song = { url: audio_url, name, album, image, id: song_id };

    let existingIndex = playlist.findIndex(s => s.url === audio_url);
    
    if (existingIndex === -1) {
        playlist.unshift(song); // ✅ New songs added in reverse order (at the beginning)
        savePlaylist();
        currentIndex = 0; // ✅ Play newly added song first
    } else {
        currentIndex = existingIndex; // ✅ Existing song keeps its place
    }

  

    source.src = audio_url;
    audio.load();
    audio.addEventListener("canplaythrough", function playHandler() {
        audio.play();
        audio.removeEventListener("canplaythrough", playHandler);
    });

    loadPlaylist(); // ✅ UI मध्ये अपडेट करा
}

// ✅ Playlist सेव्ह करा (localStorage मध्ये)
function savePlaylist() {
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

// ✅ Playlist लोड करा आणि उलट क्रमाने (Reverse Order) दाखवा पण प्ले केल्यावर स्थान बदलणार नाही
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
            <button class="play-btn" onclick="PlayAudio('${song.url}', '${song.id}')">▶ Play</button>
            <button class="remove-btn" onclick="removeFromPlaylist(${index})">Remove</button>
        </div>
    </div>
`;
        container.appendChild(songElement);
    });
}

// ✅ Playlist मधून गाणे काढा
function removeFromPlaylist(index) {
    playlist.splice(index, 1);
    savePlaylist();
    loadPlaylist();
}

// ✅ गाणे संपल्यावर पुढचे गाणे प्ले करा
document.getElementById("player").addEventListener("ended", playNext);

function playNext() {
    if (playlist.length === 0) {
        return;
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentIndex && playlist.length > 1);

    currentIndex = randomIndex;
    const nextSong = playlist[currentIndex];
    PlayAudio(nextSong.url, nextSong.id);
}

function playPrevious() {
    if (playlist.length === 0) {
       
        return;
    }

    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; // ✅ Previous song (loop to last if first)
    const prevSong = playlist[currentIndex];
    PlayAudio(prevSong.url, prevSong.id);
}

// ✅ पेज लोड झाल्यावर Playlist लोड करा
document.addEventListener("DOMContentLoaded", loadPlaylist);


 