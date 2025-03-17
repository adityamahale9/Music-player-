document.addEventListener("DOMContentLoaded", function () {
    var results_container = document.querySelector("#saavn-results");
    var search_box = document.querySelector("#saavn-search-box");
    var search_button = document.querySelector("#saavn-search-trigger");
    var results_objects = {};
    const searchUrl = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";
    var lastSearch = "";
    var page_index = 1;

    if (!results_container || !search_box) {
        
        return;
    }

function SaavnSearch(event) {
        event.preventDefault();
        var query = search_box.value.trim();
        if (!query) return;
        window.location.hash = encodeURIComponent(query);
        doSaavnSearch(query);
    }

    // 🔹 Button वर Event Listener लावा
    if (search_button) {
        search_button.addEventListener("click", SaavnSearch);
    }

    // 🔹 Input Box वर 'Enter' Key Event Listener लावा
    if (search_box) {
        search_box.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                SaavnSearch(event);
            }
        });
    }

    
    // ✅ Next Page function
    function nextPage() {
        var query = search_box.value.trim();
        if (!query) {
            query = lastSearch;
        }
        query = encodeURIComponent(query);
        doSaavnSearch(query, false, true);
    }

    // ✅ Search API function
    async function doSaavnSearch(query, NotScroll = false, page = false) {
        if (!search_box) return;
        window.location.hash = query;
        search_box.value = decodeURIComponent(query);
        if (!query) return;

        // ✅ Show loading if results container exists
        if (results_container) {
            results_container.innerHTML = `<span class="loader">Searching...</span>`;
        }

        query = query + "&limit=40";
        if (page) {
            page_index += 1;
            query = query + "&page=" + page_index;
        } else {
            query = query + "&page=1";
            page_index = 1;
        }

        try {
            var response = await fetch(searchUrl + query);
            var textResponse = await response.text(); // Read response as text
           

            // ✅ Parse response safely
            var json = JSON.parse(textResponse);

            // ✅ Handle API errors
            if (response.status !== 200) {
                results_container.innerHTML = `<span class="error">Error: ${json.message}</span>`;
               
                return;
            }

            json = json.data.results;
            if (!json) {
                results_container.innerHTML = "<p>No results found. Try another search.</p>";
                return;
            }

            lastSearch = decodeURI(window.location.hash.substring(1));
            var results = [];

            for (let track of json) {
                let song_name = TextAbstract(track.name, 25);
                let album_name = TextAbstract(track.album.name, 20);
                if (track.album.name === track.name) album_name = "";

                let measuredTime = new Date(null);
                measuredTime.setSeconds(track.duration);
                let play_time = measuredTime.toISOString().substr(11, 8);
                if (play_time.startsWith("00:0")) play_time = play_time.slice(4);
                if (play_time.startsWith("00:")) play_time = play_time.slice(3);

                let song_id = track.id;
                let song_image = track.image[1].link;
                let song_artist = TextAbstract(track.primaryArtists, 30);
                let bitrate = document.getElementById('saavn-bitrate');
                let bitrate_i = bitrate ? bitrate.value : 0;

                if (track.downloadUrl) {
                    let download_url = track.downloadUrl[bitrate_i]['link'];

                    results_objects[song_id] = { track: track };
                    results.push(`
                     <div class="text-left song-container" 
     style="margin-bottom: 10px; border-radius: 10px; background-color: #1e1e1e; padding: 12px; 
            display: flex; align-items: center; justify-content: space-between; 
            box-shadow: 0px 2px 5px rgba(0,0,0,0.2); width: 100%; min-height: 70px;">
    
    <!-- Song Image and Details -->
    <div style="display: flex; align-items: center; gap: 15px; flex-grow: 1; overflow: hidden;">
        <img id="${song_id}-i" class="img-fluid" 
             style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" 
             src="${song_image}" loading="lazy"/>
        
        <!-- Song Details -->
        <div style="display: flex; flex-direction: column; justify-content: center; min-width: 0;">
            <p id="${song_id}-n" 
               style="margin: 0px; color: #fff; font-size: 14px; font-weight: bold; 
                      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                ${song_name}
            </p>
            <p id="${song_id}-a" 
               style="margin: 0px; color: #bbb; font-size: 12px; 
                      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                ${album_name}
            </p>
            <p id="${song_id}-ar" 
               style="margin: 0px; color: #888; font-size: 12px; 
                      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                ${song_artist}
            </p>
        </div>
    </div>

    <!-- Buttons (Aligned to Right) -->
    <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" 
                style="padding: 6px 12px; font-size: 12px; border-radius: 5px; 
                       background-color: #28a745; border: none; display: flex; align-items: center; gap: 4px; 
                       cursor: pointer; transition: all 0.2s ease;" 
                onclick='PlayAudio("${download_url}","${song_id}")'>
            ▶
        </button>

        <button type="button" 
                style="padding: 6px 12px; font-size: 12px; border-radius: 5px; 
                       background-color: #007bff; border: none; display: flex; align-items: center; gap: 4px; 
                       cursor: pointer; transition: all 0.2s ease;" 
                onclick='AddDownload("${song_id}","${download_url}")'>
            ⬇️
        </button>
    </div>
</div>
                    `);
                }
            }

            if (results_container) {
                results_container.innerHTML = results.join(' ');
            }

            if (!NotScroll) {
                results_container.scrollIntoView();
            }

        } catch (error) {
           
            if (results_container) {
                results_container.innerHTML = `<span class="error">Error: ${error.message} <br> Check if API is down</span>`;
            }
        }
    }

    // ✅ Text abstract function
    function TextAbstract(text, length) {
        if (!text) return "";
        if (text.length <= length) return text;
        text = text.substring(0, length);
        let last = text.lastIndexOf(" ");
        return text.substring(0, last) + "...";
    }

    // ✅ Run search on page load if there's a hash
    if (window.location.hash) {
        doSaavnSearch(window.location.hash.substring(1));
    }

    // ✅ Listen for hash changes
    window.addEventListener('hashchange', () => {
        doSaavnSearch(window.location.hash.substring(1));
    });

    // ✅ Make function globally available
    window.doSaavnSearch = doSaavnSearch;
});

async function AddDownload(audio_url, song_id) {
    console.log("Fetching URL:", audio_url);

    // Check if the URL is valid
    if (!audio_url || !audio_url.startsWith("http")) {
        console.error("❌ Invalid URL:", audio_url);
        alert("Invalid download URL!");
        return;
    }

    try {
        const response = await fetch(audio_url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const blob = await response.blob();
        const songUrl = URL.createObjectURL(blob);

        // Create a download link
        const downloadLink = document.createElement("a");
        downloadLink.href = songUrl;
        downloadLink.download = `${song_id}.mp3`;
        downloadLink.textContent = "Download Song";
        downloadLink.style.display = "block";
        downloadLink.style.margin = "10px 0";

        // Create an audio player
        const audioPlayer = document.createElement("audio");
        audioPlayer.controls = true;
        audioPlayer.src = songUrl;
        audioPlayer.style.display = "block";

        // Append to the page
        const songContainer = document.getElementById("songs-container");
        const songDiv = document.createElement("div");
        songDiv.appendChild(audioPlayer);
        songDiv.appendChild(downloadLink);
        songContainer.appendChild(songDiv);

        alert(`✅ "${song_id}" downloaded successfully!`);
    } catch (error) {
        console.error("❌ Download failed:", error);
        alert("Download failed!");
    }
}