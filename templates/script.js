function sendCommand(command) {
    fetch('/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
    }).then(response => response.json())
      .then(data => alert(data.status || data.error));
}

function searchSong() {
    const query = document.getElementById('song').value;
    if (!query) return alert("Enter a song name!");
    
    fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    }).then(response => response.json())
      .then(data => alert(data.status || data.error));
}

function startVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = (event) => {
        const voiceCommand = event.results[0][0].transcript.toLowerCase();
        if (voiceCommand.includes("play")) sendCommand('play');
        else if (voiceCommand.includes("pause")) sendCommand('pause');
        else if (voiceCommand.includes("next")) sendCommand('next');
        else if (voiceCommand.includes("previous")) sendCommand('previous');
        else searchSong(voiceCommand);
    };
}
