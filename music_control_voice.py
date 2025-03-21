from flask import Flask, render_template, request, jsonify
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = Flask(__name__)

# Spotify API Credentials
CLIENT_ID = "0120848b9fe94d6f85530aa7f2797a9e"
CLIENT_SECRET = "9fba8f5706e24f6c889217f3f042ff28"
REDIRECT_URI = "https://audius.onrender.com"
SCOPE = "user-modify-playback-state user-read-playback-state user-read-currently-playing"

# Initialize Spotify Client
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=SCOPE))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/control", methods=["POST"])
def control():
    data = request.get_json()
    command = data.get("command")

    try:
        if command == "play":
            sp.start_playback()
        elif command == "pause":
            sp.pause_playback()
        elif command == "next":
            sp.next_track()
        elif command == "previous":
            sp.previous_track()
        else:
            return jsonify({"error": "Invalid command"}), 400

        return jsonify({"status": f"{command} command executed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    query = data.get("query")

    try:
        results = sp.search(q=query, limit=1, type="track")
        track_uri = results['tracks']['items'][0]['uri']
        sp.start_playback(uris=[track_uri])
        return jsonify({"status": f"Playing: {query}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
