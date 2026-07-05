#!/data/data/com.termux/files/usr/bin/bash
# Run this in Termux to start the backend.
# First time setup: pkg install python ffmpeg && pip install -r requirements.txt
cd "$(dirname "$0")"
python app.py
