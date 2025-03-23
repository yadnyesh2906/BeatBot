// Initialize the player and voice recognition
let player;

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = localStorage.getItem("spotify_access_token");
    player = new Spotify.Player({
        name: 'BeatBot Voice Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        localStorage.setItem("device_id", device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.connect();
};

// Voice command handling function
const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log("Voice Command:", command);
        handleVoiceCommand(command);
    };

    recognition.onerror = (error) => console.error('Speech recognition error:', error);
};

// Handle different voice commands
const handleVoiceCommand = (command) => {
    if (command.includes("play")) {
        player.resume();
    } else if (command.includes("pause")) {
        player.pause();
    } else if (command.includes("next")) {
        player.nextTrack();
    } else if (command.includes("previous")) {
        player.previousTrack();
    } else if (command.includes("search")) {
        const query = command.replace("search", "").trim();
        searchSong(query);
    } else {
        alert("Command not recognized: " + command);
    }
};

// Search for a song via the Flask backend
const searchSong = async (query) => {
    try {
        const response = await fetch("https://your-flask-backend-url.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        if (data.uri) {
            playSong(data.uri);
        } else {
            alert("Song not found.");
        }
    } catch (error) {
        console.error("Error during song search:", error);
    }
};

// Play a song by URI
const playSong = async (uri) => {
    const token = localStorage.getItem("spotify_access_token");
    const device_id = localStorage.getItem("device_id");

    try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ uris: [uri] })
        });
        console.log("Playing: ", uri);
    } catch (error) {
        console.error("Error playing song:", error);
    }
};

// Attach event listener to start voice recognition
document.getElementById("voice-btn").addEventListener("click", startVoiceRecognition);

