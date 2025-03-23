from flask import Flask, request, jsonify
from flask_cors import CORS
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import speech_recognition as sr
import os

app = Flask(__name__)
CORS(app)  # Allow frontend communication

# Spotify API setup
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=os.getenv("0120848b9fe94d6f85530aa7f2797a9e"),
    client_secret=os.getenv("0120848b9fe94d6f85530aa7f2797a9e"),
    redirect_uri=os.getenv("http://localhost:5000/callback"),
    scope="user-modify-playback-state user-read-playback-state user-read-currently-playing"
))

# Speech Recognizer setup
recognizer = sr.Recognizer()

@app.route('/search', methods=['POST'])
def search_song():
    data = request.json
    query = data.get('query')

    if not query:
        return jsonify({"error": "No search query provided"}), 400

    result = sp.search(q=query, type='track', limit=1)

    if result['tracks']['items']:
        track = result['tracks']['items'][0]
        sp.start_playback(uris=[track['uri']])
        return jsonify({"message": f"Playing: {track['name']} by {track['artists'][0]['name']}"})

    return jsonify({"error": "Song not found"}), 404

@app.route('/play', methods=['POST'])
def play():
    sp.start_playback()
    return jsonify({"message": "Playback started"})

@app.route('/pause', methods=['POST'])
def pause():
    sp.pause_playback()
    return jsonify({"message": "Playback paused"})

@app.route('/next', methods=['POST'])
def next_track():
    sp.next_track()
    return jsonify({"message": "Playing next track"})

@app.route('/previous', methods=['POST'])
def previous_track():
    sp.previous_track()
    return jsonify({"message": "Playing previous track"})

@app.route('/voice-command', methods=['POST'])
def voice_command():
    with sr.Microphone() as source:
        print("Listening for a voice command...")
        try:
            audio = recognizer.listen(source, timeout=5)
            command = recognizer.recognize_google(audio).lower()
            print("You said:", command)

            if "play" in command:
                song_name = command.replace("play", "").strip()
                return search_song_by_name(song_name)
            elif "pause" in command:
                return pause()
            elif "next" in command:
                return next_track()
            elif "previous" in command:
                return previous_track()
            else:
                return jsonify({"message": "Unknown command"})

        except sr.UnknownValueError:
            return jsonify({"error": "Could not understand the audio"}), 400
        except sr.RequestError:
            return jsonify({"error": "Speech service unavailable"}), 500

# Helper function to search and play a song
def search_song_by_name(song_name):
    result = sp.search(q=song_name, type='track', limit=1)
    if result['tracks']['items']:
        track = result['tracks']['items'][0]
        sp.start_playback(uris=[track['uri']])
        return jsonify({"message": f"Playing: {track['name']} by {track['artists'][0]['name']}"})
    return jsonify({"error": "Song not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
