from flask import Flask, render_template, request, jsonify
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import speech_recognition as sr

app = Flask(__name__, template_folder='../templates')

# Spotify API credentials
CLIENT_ID = "0120848b9fe94d6f85530aa7f2797a9e"
CLIENT_SECRET = "9fba8f5706e24f6c889217f3f042ff28"
REDIRECT_URI = "https://audius.onrender.com"
SCOPE = "user-modify-playback-state user-read-playback-state user-read-currently-playing"

# Initialize Spotify client
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE
))

# Voice commands mapping
COMMANDS = {
    "play": "play",
    "pause": "pause",
    "resume": "play",
    "next": "next",
    "previous": "previous"
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/control", methods=["POST"])
def control():
    command = request.json.get("command")
    if not command:
        return jsonify({"error": "No command provided"}), 400

    try:
        if command == "play":
            sp.start_playback()
        elif command == "pause":
            sp.pause_playback()
        elif command == "resume":
            sp.start_playback()
        elif command == "next":
            sp.next_track()
        elif command == "previous":
            sp.previous_track()
        else:
            return jsonify({"error": "Unknown command"}), 400

        return jsonify({"status": "success", "command": command})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/voice", methods=["POST"])
def voice():
    recognizer = sr.Recognizer()
    audio_file = request.files.get("audio")
    if not audio_file:
        return jsonify({"error": "No audio file provided"}), 400

    try:
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data).lower()
        command = next((cmd for cmd in COMMANDS if cmd in text), None)
        if command:
            return control()
        else:
            return jsonify({"error": "No valid command recognized"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/search", methods=["POST"])
def search():
    query = request.json.get("query")
    if not query:
        return jsonify({"error": "No search query provided"}), 400

    try:
        results = sp.search(q=query, limit=5, type='track')
        tracks = [
            {
                "name": track["name"],
                "artist": track["artists"][0]["name"],
                "uri": track["uri"]
            } for track in results["tracks"]["items"]
        ]
        return jsonify({"tracks": tracks})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
