// Spotify API Configuration
const CLIENT_ID = '0120848b9fe94d6f85530aa7f2797a9e';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';
let accessToken = '';

const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-modify-playback-state user-read-playback-state user-read-currently-playing`;

// Function to get Spotify Access Token
function getSpotifyToken() {
    const hash = window.location.hash.substring(1).split('&').reduce((acc, item) => {
        if (item) {
            const [key, value] = item.split('=');
            acc[key] = decodeURIComponent(value);
        }
        return acc;
    }, {});
    accessToken = hash.access_token;
    if (!accessToken) {
        window.location.href = spotifyAuthUrl;
    }
}

// Fetch Spotify API
async function spotifyRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, options);
    if (!response.ok) {
        console.error('Spotify API Error:', await response.json());
    }
}

// Music Control Functions
function play() {
    spotifyRequest('play', 'PUT');
}

function pause() {
    spotifyRequest('pause', 'PUT');
}

function nextTrack() {
    spotifyRequest('next', 'POST');
}

function prevTrack() {
    spotifyRequest('previous', 'POST');
}

// Voice Recognition Setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;

recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log('Voice Command:', command);

    if (command.includes('play')) {
        play();
    } else if (command.includes('pause')) {
        pause();
    } else if (command.includes('next')) {
        nextTrack();
    } else if (command.includes('previous')) {
        prevTrack();
    } else if (command.includes('search')) {
        const song = command.replace('search', '').trim();
        searchSong(song);
    }
};

// Trigger Voice Input
function startListening() {
    recognition.start();
}

// Search for a Song
async function searchSong(query) {
    const response = await fetch('https://api.spotify.com/v1/search?' + new URLSearchParams({
        q: query,
        type: 'track',
        limit: 1,
    }), {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    if (data.tracks.items.length > 0) {
        const trackUri = data.tracks.items[0].uri;
        playTrack(trackUri);
    } else {
        alert('Song not found!');
    }
}

// Play Specific Track
async function playTrack(uri) {
    await spotifyRequest('play', 'PUT', { uris: [uri] });
}

// Initialize Spotify on Page Load
window.onload = getSpotifyToken;

// Button Event Listeners
document.getElementById('play-btn').addEventListener('click', play);
document.getElementById('pause-btn').addEventListener('click', pause);
document.getElementById('next-btn').addEventListener('click', nextTrack);
document.getElementById('prev-btn').addEventListener('click', prevTrack);
document.getElementById('voice-btn').addEventListener('click', startListening);

document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim();
    if (query) searchSong(query);
});
