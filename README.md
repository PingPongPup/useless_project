<img width="1905" height="915" alt="Screenshot 2026-09-06 020610" src="https://github.com/user-attachments/assets/7b012a61-95c2-42d0-b17c-7873e2ff7af1" />
<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# [CHESS MAYBE] 🎯


## Basic Details
### Team Name: [Viswajith]


### Team Members
- Team Lead: [Viswajith S] - [SSET]
-

### Project Description
CHESS MAYBE is an intentionally unfair chess game that uses your webcam to monitor whether you're looking at the screen.

If you look away from the chessboard for more than 1 second, Black gets a free move. The game also responds with an alarm, warning messages, visual effects, and a mocking character.

### The Problem (that doesn't exist)
People keep looking away while playing chess.

Normal chess simply allows this unacceptable behavior.

CHESS MAYBE solves the completely unnecessary problem of players not staring at their chessboard continuously.

### The Solution (that nobody asked for)
CHESS MAYBE uses your webcam and face detection to determine whether you're still looking at the screen.

If your face disappears from the camera for more than 1 second:

Black gets a free move.
Your attention meter drops to 0%.
An alarm plays.
The screen flashes.
The board shakes.
A mocking message appears.
The incident is recorded in the telemetry log.
Your cheat counter increases

## Technical Details
### Technologies/Components Used
For Software:
Languages:

HTML
CSS
JavaScript

Libraries:

Chess.js
Face-api.js

Browser APIs:

WebRTC / getUserMedia() for webcam access
Web Audio API for sound effects

Tools:

Visual Studio Code
Git
GitHub
Live Server

For Hardware:
nothing

### Implementation
For Software:
The project is completely frontend-based.

1. Chess System

Chess.js handles:

Chess board state
Legal move validation
Captures
Check
Checkmate
Draw detection
Player turns

White is controlled by the player, while Black normally selects a random legal move.

2. Webcam Surveillance

The browser requests webcam access using:

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
});

Face-api.js then uses the Tiny Face Detector to detect whether a face is present in the camera feed.
3. Look-Away Detection

The game checks for a detected face every 500 ms.

If no face is detected for more than 1 second, the player is considered to have looked away.
4. Attention Meter

The interface includes an Attention Integrity meter.

When the player is detected:

100%

When the player looks away:

100% → 0%

The meter drains according to how long the face remains undetected.
# Installation
git clone https://github.com/PingPongPup/useless_project.git

cd useless_projects
# Run
Open the project using VS Code + Live Server.

Or serve the folder using any local HTTP server.

Then open the application in a browser and click:

START SURVEILLANCE

Allow camera access when prompted.

### Project Documentation
For Software:

# Screenshots (Add at least 3)
<img width="1905" height="915" alt="Screenshot 2026-09-06 020610" src="https://github.com/user-attachments/assets/1ee01b9a-af97-4152-a58d-5d96cfdcb736" />
*The main CHESS MAYBE interface showing the chess board, webcam/attention monitoring panel, attention gauge, and game statistics.*


![Screenshot2](Add screenshot 2 here with proper name)
<img width="1505" height="870" alt="Screenshot 2026-09-06 020626" src="https://github.com/user-attachments/assets/e4147da1-73c1-4290-8330-644292b29e48" />
*The attention monitoring interface showing the webcam feed and live attention status while the player is playing.*



![Screenshot3](Add screenshot 3 here with proper name)
<img width="1545" height="909" alt="Screenshot 2026-09-06 020644" src="https://github.com/user-attachments/assets/9eb1d270-a1d3-4765-9fdf-007bd0693f56" />
*The punishment state triggered when the player looks away for more than one second, including the warning, visual effects, and Black's extra move.*

# Diagrams
<img width="1774" height="887" alt="diagram" src="https://github.com/user-attachments/assets/aef52aa9-f0f1-4ec6-a7cc-360c80d6b2c6" />
This workflow shows how CHESS MAYBE uses webcam-based face detection to monitor the player's attention. If the face is detected, the game continues normally; if the player looks away for more than one second, the punishment system is triggered, giving Black an extra move and activating warning effects before the game continues.




### Project Demo
# Video
[(https://drive.google.com/file/d/1vYBI8FaYeeOaz-TZ7OhZDetl9AWGvX1M/view?usp=drive_link)]




---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



