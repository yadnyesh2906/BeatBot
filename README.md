# BeatBot

Voice-controlled music control system using the Spotify API. This project allows you to play, pause, skip tracks, and search for songs using voice commands.

## Features

- Voice commands to control music playback (play, pause, next, previous)
- Search for songs using voice input
- Integration with the Spotify API
- Frontend for user interaction
- Backend for processing voice commands and handling Spotify API

## Project Structure

```
BeatBot/
├── backend/            # Flask backend
│   ├── app.py         # Main Flask app
│   ├── requirements.txt # Dependencies
│   └── render.yaml    # Render deployment configuration
├── frontend/          # Static frontend for GitHub Pages
│   ├── index.html     # Main HTML page
│   ├── script.js      # JavaScript for voice recognition and API calls
│   └── style.css      # Styling
└── .gitignore         # Git ignore file
```

## Setup Instructions

### Backend (Flask + Render)
1. Navigate to the `backend` directory:

```bash
cd backend
```

2. Set up a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. Ensure your `render.yaml` is properly configured and push changes to your repository.

4. Deploy the backend on [Render](https://render.com).

### Frontend (GitHub Pages)
1. Navigate to the `frontend` directory:

```bash
cd ../frontend
```

2. Ensure your HTML, CSS, and JS files are correct.

3. Push the `frontend` folder to the `gh-pages` branch for GitHub Pages.

```bash
git subtree push --prefix frontend origin gh-pages
```

## Usage
1. Access the frontend via GitHub Pages URL: `https://your-username.github.io/BeatBot/`
2. Ensure the backend on Render is live.
3. Use the voice control button to interact with Spotify.

## Contribution
Feel free to fork, modify, and contribute to this project.


