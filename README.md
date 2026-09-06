<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# [CHESS MAYBE] 🎯


## Basic Details
### Team Name: [Name]


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
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
*Add caption explaining your workflow*

For Hardware:

# Schematic & Circuit
![Circuit](Add your circuit diagram here)
*Add caption explaining connections*

![Schematic](Add your schematic diagram here)
*Add caption explaining the schematic*

# Build Photos
![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- [Name 1]: [Specific contributions]
- [Name 2]: [Specific contributions]
- [Name 3]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



