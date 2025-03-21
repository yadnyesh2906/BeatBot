// Updated script.js for enhanced interactivity and voice control

const searchInput = document.getElementById("searchInput");
const suggestionsContainer = document.getElementById("suggestions");
const voiceButton = document.getElementById("voiceButton");

// Function to send a command to the backend
async function sendCommand(command) {
    try {
        const response = await fetch("/control", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command })
        });
        const data = await response.json();
        alert(`Command executed: ${data.command}`);
    } catch (error) {
        console.error("Error sending command:", error);
    }
}

// Event listeners for play, pause, next, and previous buttons
document.getElementById("playBtn").addEventListener("click", () => sendCommand("play"));
document.getElementById("pauseBtn").addEventListener("click", () => sendCommand("pause"));
document.getElementById("nextBtn").addEventListener("click", () => sendCommand("next"));
document.getElementById("prevBtn").addEventListener("click", () => sendCommand("previous"));

// Search for songs using Spotify API
async function searchSong(query) {
    if (!query) return;

    try {
        const response = await fetch("/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });
        const results = await response.json();

        suggestionsContainer.innerHTML = "";

        results.tracks.forEach(track => {
            const suggestion = document.createElement("div");
            suggestion.className = "suggestion-item";
            suggestion.innerText = `${track.name} by ${track.artist}`;

            suggestion.addEventListener("click", () => {
                sendCommand("play");
                searchInput.value = track.name;
            });

            suggestionsContainer.appendChild(suggestion);
        });

    } catch (error) {
        console.error("Error fetching search results:", error);
    }
}

// Trigger song search on input
searchInput.addEventListener("input", () => searchSong(searchInput.value));

// Voice recognition using Web Speech API
voiceButton.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onstart = () => alert("Voice recognition activated. Speak a command.");

    recognition.onresult = (event) => {
        const voiceInput = event.results[0][0].transcript.toLowerCase();
        searchInput.value = voiceInput;
        searchSong(voiceInput);
    };

    recognition.onerror = (event) => console.error("Voice recognition error:", event.error);

    recognition.start();
});
