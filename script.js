import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js";

// ==========================================
// DOM ELEMENTS
// ==========================================

const video = document.getElementById("video");
const startButton = document.getElementById("startButton");
const cameraOverlay = document.getElementById("cameraOverlay");
const cameraStatus = document.getElementById("cameraStatus");
const systemStatus = document.getElementById("systemStatus");
const attentionStatus = document.getElementById("attentionStatus");
const chessBoard = document.getElementById("chessBoard");
const turnStatus = document.getElementById("turnStatus");
const gameStatus = document.getElementById("gameStatus");
const newGameButton = document.getElementById("newGameButton");
const eventLog = document.getElementById("eventLog");
const mockingCharacter = document.getElementById("mockingCharacter");
const mockText = document.getElementById("mockText");
const mockEyes = document.getElementById("mockEyes");

// New UI & Telemetry Elements
const soundToggle = document.getElementById("soundToggle");
const cheatStatCount = document.getElementById("cheatStatCount");
const focusStreakCount = document.getElementById("focusStreakCount");
const attentionBar = document.getElementById("attentionBar");
const attentionPercent = document.getElementById("attentionPercent");
const screenFlash = document.getElementById("screenFlash");
const cheatAlertBanner = document.getElementById("cheatAlertBanner");
const cheatAlertMessage = document.getElementById("cheatAlertMessage");
const boardWrapper = document.querySelector(".board-wrapper");

// ==========================================
// PROCEDURAL AUDIO SYNTHESIZER (WEB AUDIO)
// ==========================================

class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playMove() {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(360, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playCapture() {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playAlarm() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.12);
        osc.frequency.linearRampToValueAtTime(900, now + 0.22);
        osc.frequency.linearRampToValueAtTime(350, now + 0.38);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
    }

    playStart() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.14);
        });
    }
}

const sounds = new SoundFX();

// ==========================================
// CHESS STATE & TELEMETRY
// ==========================================

let game = new Chess();
let selectedSquare = null;
let cheatsCount = 0;
let focusStreakSeconds = 0;
let focusTimerInterval = null;

// ==========================================
// CAMERA STATE
// ==========================================

let cameraRunning = false;
let lookingAway = false;
let lastFaceTime = Date.now();
let detectionInterval = null;

const LOOK_AWAY_TIME = 1000;
const DETECTION_INTERVAL = 500;

// ==========================================
// VECTOR SVG CHESS PIECES
// ==========================================

const pieces = {
    w: {
        p: `<svg viewBox="0 0 45 45"><path d="m22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#ffffff" stroke="#111111" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        r: `<svg viewBox="0 0 45 45"><g fill="#ffffff" fill-rule="evenodd" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 39h27v-3h-27v3zm3-3v-4h21v4h-21zm-1-22 1.5-2.5h17l1.5 2.5h-20zm2.5-2.5h15v-3h-15v3zm-3.5-3h22v-4h-3.5v2h-4v-2h-7v2h-4v-2h-3.5v4z" stroke-linecap="butt"/><path d="m12 32h21l-2-18h-17l-2 18z"/></g></svg>`,
        n: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#ffffff"/><path d="m24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.16-1.41-1.42-1-2.5 1-2.5 6-4 6-4s1.77-4.14 2-5c1.5-1.5 5.5-2.5 6-1.5z" fill="#ffffff"/><circle cx="9.5" cy="25.5" r="1" fill="#111111"/><circle cx="14" cy="16" r="1" fill="#111111"/></g></svg>`,
        b: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><g fill="#ffffff" stroke-linecap="butt"><path d="m9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="m15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/></g><path d="m17.5 26h10M15 30h15m-7.5-14.5v5m-2.5-2.5h5" stroke="#111111"/></g></svg>`,
        q: `<svg viewBox="0 0 45 45"><g fill="#ffffff" fill-rule="evenodd" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.2"/><circle cx="14" cy="9" r="2.2"/><circle cx="22.5" cy="7.5" r="2.2"/><circle cx="31" cy="9" r="2.2"/><circle cx="39" cy="12" r="2.2"/><path d="m9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7-16-7 16-7-11 2 12zm0 0c0 4 7 7.5 13.5 7.5s13.5-3.5 13.5-7.5l-2-3c-8-1.5-15-1.5-23 0l-2 3z"/><path d="m11 38.5a35 35 1 0 0 23 0v-2.5l-23 0v2.5z" stroke-linecap="butt"/></g></svg>`,
        k: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="m22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#ffffff" stroke-linecap="butt"/><path d="m11.5 37c5.5 3.5 16.5 3.5 22 0l-.5-7.5c-4.5 2.5-16.5 2.5-21 0l-.5 7.5" fill="#ffffff"/><path d="m11.5 30c5.5-3 16.5-3 22 0m-22 3.5c5.5-3.5 16.5-3.5 22 0m-22 3.5c5.5-3.5 16.5-3.5 22 0"/></g></svg>`
    },
    b: {
        p: `<svg viewBox="0 0 45 45"><path d="m22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#111111" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/></svg>`,
        r: `<svg viewBox="0 0 45 45"><g fill="#111111" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 39h27v-3h-27v3zm3-3v-4h21v4h-21zm-1-22 1.5-2.5h17l1.5 2.5h-20zm2.5-2.5h15v-3h-15v3zm-3.5-3h22v-4h-3.5v2h-4v-2h-7v2h-4v-2h-3.5v4z" stroke-linecap="butt"/><path d="m12 32h21l-2-18h-17l-2 18z"/><path d="m14 29.5v-13h17v13h-17z" stroke="#ffffff" stroke-width="1"/></g></svg>`,
        n: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#111111"/><path d="m24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.16-1.41-1.42-1-2.5 1-2.5 6-4 6-4s1.77-4.14 2-5c1.5-1.5 5.5-2.5 6-1.5z" fill="#111111"/><circle cx="9.5" cy="25.5" r="1" fill="#ffffff"/><circle cx="14" cy="16" r="1" fill="#ffffff"/><path d="m24.55 10.4c-.45 1.45-.5 3.79-.27 4.84.4 1.9 1.6 3.1 1.6 3.1" stroke="#ffffff"/></g></svg>`,
        b: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><g fill="#111111" stroke-linecap="butt"><path d="m9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="m15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/></g><path d="m17.5 26h10M15 30h15m-7.5-14.5v5m-2.5-2.5h5" stroke="#ffffff"/></g></svg>`,
        q: `<svg viewBox="0 0 45 45"><g fill="#111111" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.2"/><circle cx="14" cy="9" r="2.2"/><circle cx="22.5" cy="7.5" r="2.2"/><circle cx="31" cy="9" r="2.2"/><circle cx="39" cy="12" r="2.2"/><path d="m9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7-16-7 16-7-11 2 12zm0 0c0 4 7 7.5 13.5 7.5s13.5-3.5 13.5-7.5l-2-3c-8-1.5-15-1.5-23 0l-2 3z"/><path d="m11 38.5a35 35 1 0 0 23 0v-2.5l-23 0v2.5z" stroke-linecap="butt"/><path d="m11.5 30c3.5-1 18.5-1 22 0m-20.5 3.5c4-1 15-1 19 0" stroke="#ffffff"/></g></svg>`,
        k: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="m22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#111111" stroke-linecap="butt"/><path d="m11.5 37c5.5 3.5 16.5 3.5 22 0l-.5-7.5c-4.5 2.5-16.5 2.5-21 0l-.5 7.5" fill="#111111"/><path d="m20 18h5" stroke="#ffffff"/><path d="m11.5 30c5.5-3 16.5-3 22 0m-22 3.5c5.5-3.5 16.5-3.5 22 0m-22 3.5c5.5-3.5 16.5-3.5 22 0" stroke="#ffffff"/></g></svg>`
    }
};

// ==========================================
// FUNNY PSYCHOLOGICAL WARFARE MESSAGES
// ==========================================

const lookAwayMessages = [
    "YOU LOOKED AWAY.",
    "MONE, NOKKI IRIKKU.",
    "Bro abandoned the chessboard.",
    "FREE MOVE ACTIVATED.",
    "Pani paali mone.",
    "BLACK SAW ITS CHANCE.",
    "Focus poyi. Move vannu.",
    "Nee nokkiyilla. Njan nokki.",
    "Chessinu vendi nokki irikkeda.",
    "Attention span detected: 0%."
];

const lookingMessages = [
    "EYES ON THE BOARD.",
    "GOOD. KEEP LOOKING.",
    "WE ARE WATCHING YOU.",
    "Nalla focus mone.",
    "DON'T BLINK.",
    "Focus undallo.",
    "BLACK IS WAITING."
];



// ==========================================
// DRAW CHESS BOARD
// ==========================================

function drawBoard() {
    chessBoard.innerHTML = "";
    const board = game.board();

    board.forEach((row, rowIndex) => {
        row.forEach((piece, colIndex) => {
            const square = document.createElement("div");
            square.classList.add("square");

            const isLight = (rowIndex + colIndex) % 2 === 0;
            square.classList.add(isLight ? "light" : "dark");

            const file = String.fromCharCode(97 + colIndex);
            const rank = 8 - rowIndex;
            const squareName = file + rank;
            square.dataset.square = squareName;

            // Render crisp vector SVG Piece
            if (piece) {
                const pieceElement = document.createElement("div");
                pieceElement.className = "piece";
                pieceElement.innerHTML = pieces[piece.color][piece.type];
                square.appendChild(pieceElement);
            }

            square.addEventListener("click", () => {
                handleSquareClick(squareName);
            });

            chessBoard.appendChild(square);
        });
    });

    updateHighlights();
    updateGameStatus();
}

// ==========================================
// SQUARE CLICK
// ==========================================

function handleSquareClick(square) {
    if (game.isGameOver()) return;

    // Only player controls White
    if (game.turn() !== "w") return;

    // Nothing selected
    if (!selectedSquare) {
        const piece = game.get(square);
        if (piece && piece.color === "w") {
            selectedSquare = square;
            updateHighlights();
        }
        return;
    }

    // Click same square to deselect
    if (selectedSquare === square) {
        selectedSquare = null;
        updateHighlights();
        return;
    }

    try {
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: "q"
        });

        if (move) {
            if (move.captured) {
                sounds.playCapture();
            } else {
                sounds.playMove();
            }

            addLog(`YOU: ${move.san}`);
            selectedSquare = null;
            drawBoard();

            if (checkGameEnd()) return;

            // Black's normal response
            setTimeout(blackMove, 450);
        } else {
            // Try selecting another white piece
            const piece = game.get(square);
            if (piece && piece.color === "w") {
                selectedSquare = square;
                updateHighlights();
            }
        }
    } catch (error) {
        console.error(error);
    }
}


// MOVE HIGHLIGHTS
// ==========================================

function updateHighlights() {
    document.querySelectorAll(".square").forEach(square => {
        square.classList.remove("selected", "legal", "capture");
    });

    if (!selectedSquare) return;

    // Selected piece
    const selected = document.querySelector(`[data-square="${selectedSquare}"]`);
    if (selected) {
        selected.classList.add("selected");
    }

    // Legal moves
    const moves = game.moves({
        square: selectedSquare,
        verbose: true
    });

    moves.forEach(move => {
        const target = document.querySelector(`[data-square="${move.to}"]`);
        if (!target) return;

        if (move.captured) {
            target.classList.add("capture");
        } else {
            target.classList.add("legal");
        }
    });
}

// ==========================================
// NORMAL BLACK MOVE
// ==========================================

function blackMove() {
    if (game.isGameOver()) return;
    if (game.turn() !== "b") return;

    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
        checkGameEnd();
        return;
    }

    // Pick random legal move
    const move = moves[Math.floor(Math.random() * moves.length)];
    const result = game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || "q"
    });

    if (result) {
        if (result.captured) {
            sounds.playCapture();
        } else {
            sounds.playMove();
        }
        addLog(`BLACK: ${result.san}`);
    }

    drawBoard();
    checkGameEnd();
}

// ==========================================
// CHEAT MOVE (UNFAIR LOOK-AWAY PENALTY)
// ==========================================

function punishmentMove() {
    if (game.isGameOver()) return;

    // Must be player's turn to execute a free extra move for Black
    if (game.turn() !== "w") return;

    /*
        Temporarily make Black the side to move in FEN.
        This lets Black make a completely legal move even
        though it is technically White's turn.
    */
    const fen = game.fen();
    const parts = fen.split(" ");
    parts[1] = "b";

    let cheatingGame;
    try {
        cheatingGame = new Chess(parts.join(" "));
    } catch (error) {
        console.error(error);
        return;
    }

    const blackMoves = cheatingGame.moves({ verbose: true });
    if (blackMoves.length === 0) {
        addLog("BLACK COULDN'T CHEAT. PATHETIC.");
        return;
    }

    // Random legal black move
    const move = blackMoves[Math.floor(Math.random() * blackMoves.length)];
    const result = cheatingGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || "q"
    });

    // Load cheated position
    game = new Chess(cheatingGame.fen());
    selectedSquare = null;

    // Cheats telemetry
    cheatsCount++;
    if (cheatStatCount) {
        cheatStatCount.textContent = cheatsCount;
    }

    // Visual & audio punch
    if (screenFlash) {
        screenFlash.classList.add("active");
        setTimeout(() => screenFlash.classList.remove("active"), 220);
    }
    if (boardWrapper) {
        boardWrapper.classList.remove("shake");
        void boardWrapper.offsetWidth;
        boardWrapper.classList.add("shake");
    }
    showPenaltyBanner("FREE MOVE GRANTED // BLACK TOOK THE EXTRA MOVE");

    if (result.captured) {
        sounds.playCapture();
    } else {
        sounds.playMove();
    }

    addLog(`CHEAT MOVE: BLACK played ${result.san}`);
    attentionStatus.textContent = "TOO LATE.";
    attentionStatus.className = "attention-status status-away";

    drawBoard();
    checkGameEnd();
}

// ==========================================
// SHOW MOCKING CHARACTER
// ==========================================

function showMockingCharacter(customText) {
    if (mockText && customText) {
        mockText.textContent = customText;
    }

    mockingCharacter.classList.remove("mocking");
    void mockingCharacter.offsetWidth; // Force reflow
    mockingCharacter.classList.add("mocking");
}

function hideMockingCharacter() {
    if (mockingCharacter) {
        mockingCharacter.classList.remove("mocking");
    }
}

function showPenaltyBanner(message) {
    if (cheatAlertMessage && message) {
        cheatAlertMessage.textContent = message;
    }

    if (cheatAlertBanner) {
        cheatAlertBanner.classList.remove("active");
        void cheatAlertBanner.offsetWidth;
        cheatAlertBanner.classList.add("active");
        setTimeout(() => cheatAlertBanner.classList.remove("active"), 3500);
    }
}

// ==========================================
// GAME END
// ==========================================

function checkGameEnd() {
    if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "BLACK" : "WHITE";
        gameStatus.textContent = `${winner} WINS`;
        gameStatus.className = "game-status-badge in-check";
        addLog(`CHECKMATE. ${winner} wins.`);
        return true;
    }

    if (game.isDraw()) {
        gameStatus.textContent = "DRAW";
        gameStatus.className = "game-status-badge";
        addLog("GAME DRAW.");
        return true;
    }

    if (game.isCheck()) {
        gameStatus.textContent = "CHECK!";
        gameStatus.className = "game-status-badge in-check";
    } else {
        gameStatus.textContent = "GAME ACTIVE";
        gameStatus.className = "game-status-badge";
    }

    return false;
}

// ==========================================
// GAME STATUS
// ==========================================

function updateGameStatus() {
    if (game.isGameOver()) {
        checkGameEnd();
        return;
    }

    if (game.turn() === "w") {
        turnStatus.textContent = "YOUR TURN";
    } else {
        turnStatus.textContent = "BLACK THINKING...";
    }

    if (game.isCheck()) {
        gameStatus.textContent = "CHECK!";
        gameStatus.className = "game-status-badge in-check";
    } else {
        gameStatus.textContent = "GAME ACTIVE";
        gameStatus.className = "game-status-badge";
    }
}



// ==========================================
// START CAMERA & SURVEILLANCE
// ==========================================

async function startCamera() {
    try {
        addLog("Requesting optical sensor stream...");

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        cameraRunning = true;

        cameraOverlay.classList.add("hidden");
        cameraStatus.textContent = "SURVEILLANCE ONLINE";
        systemStatus.classList.add("active");

        startButton.innerHTML = `<span class="btn-icon">●</span> <span class="btn-label">SURVEILLANCE ACTIVE</span>`;
        startButton.disabled = true;

        sounds.playStart();
        addLog("Camera stream connected.");

        attentionStatus.textContent = "CALIBRATING FACIAL RECOGNITION...";
        attentionStatus.className = "attention-status";

        await loadFaceModel();

        addLog("FACIAL ATTENTION SENSORS ONLINE.");
        attentionStatus.textContent = "EYES ON THE BOARD";
        attentionStatus.className = "attention-status status-looking";

        lastFaceTime = Date.now();

        // Start attention streak counter
        if (focusTimerInterval) clearInterval(focusTimerInterval);
        focusTimerInterval = setInterval(() => {
            if (cameraRunning && !lookingAway) {
                focusStreakSeconds++;
                if (focusStreakCount) {
                    focusStreakCount.textContent = `${focusStreakSeconds}s`;
                }
            }
        }, 1000);

        // Start facial detection loop
        detectionInterval = setInterval(detectFace, DETECTION_INTERVAL);
    } catch (error) {
        console.error(error);
        addLog("ERROR: Optical sensor access failed.");
        alert("Camera access is required for the surveillance mechanism.\n\nPlease enable camera permissions.");
    }
}

// ==========================================
// LOAD FACE MODEL
// ==========================================

async function loadFaceModel() {
    const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
}

// ==========================================
// FACE DETECTION LOOP
// ==========================================

async function detectFace() {
    if (!cameraRunning) return;

    try {
        const detection = await faceapi.detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.5
            })
        );

        if (detection) {
            handleLooking();
        } else {
            handleLookingAway();
        }
    } catch (error) {
        console.error("Face detection error:", error);
    }
}

// ==========================================
// PLAYER IS LOOKING AT BOARD
// ==========================================

function handleLooking() {
    lastFaceTime = Date.now();

    // Reset gauge
    if (attentionBar) {
        attentionBar.style.width = "100%";
        attentionBar.className = "gauge-fill";
    }
    if (attentionPercent) {
        attentionPercent.textContent = "100%";
    }

    if (lookingAway) {
        lookingAway = false;
        hideMockingCharacter();
        addLog("PLAYER RETURNED TO THE BOARD.");
        attentionStatus.textContent = "WELCOME BACK. WE ARE WATCHING.";
        attentionStatus.className = "attention-status status-looking";
    } else {
        attentionStatus.textContent = randomItem(lookingMessages);
        attentionStatus.className = "attention-status status-looking";
    }
}

// ==========================================
// PLAYER LOOKED AWAY (PENALTY INCOMING)
// ==========================================

function handleLookingAway() {
    const timeAway = Date.now() - lastFaceTime;

    // Drain gauge proportionally
    const percentRemaining = Math.max(0, Math.round((1 - (timeAway / LOOK_AWAY_TIME)) * 100));
    if (attentionBar) {
        attentionBar.style.width = `${percentRemaining}%`;
        if (percentRemaining < 50) {
            attentionBar.className = "gauge-fill warning";
        }
    }
    if (attentionPercent) {
        attentionPercent.textContent = `${percentRemaining}%`;
    }

    if (timeAway < LOOK_AWAY_TIME) {
        attentionStatus.textContent = "WARNING: GAZE DETACHING...";
        attentionStatus.className = "attention-status status-away";
        return;
    }

    if (lookingAway) return;

    lookingAway = true;

    // Reset streak and crash gauge
    focusStreakSeconds = 0;
    if (focusStreakCount) {
        focusStreakCount.textContent = "0s";
    }
    if (attentionBar) {
        attentionBar.style.width = "0%";
        attentionBar.className = "gauge-fill danger";
    }
    if (attentionPercent) {
        attentionPercent.textContent = "0%";
    }

    attentionStatus.textContent = "GAZE DETACHED // ILLEGAL MOVE EXECUTED";
    attentionStatus.className = "attention-status status-away";

    const penaltyMessage = randomItem(lookAwayMessages);
    addLog(penaltyMessage);

    // Audio alarm
    sounds.playAlarm();

    // Show mocking character with the funny message
    showMockingCharacter(penaltyMessage);

    showPenaltyBanner("FREE MOVE GRANTED // BLACK TOOK THE EXTRA MOVE");

    // Give Black a free cheat move
    setTimeout(punishmentMove, 150);
}

// ==========================================
// NEW GAME (RESET)
// ==========================================

function newGame() {
    game = new Chess();
    selectedSquare = null;
    lookingAway = false;
    lastFaceTime = Date.now();
    cheatsCount = 0;
    focusStreakSeconds = 0;

    if (cheatStatCount) cheatStatCount.textContent = "0";
    if (focusStreakCount) focusStreakCount.textContent = "0s";
    if (attentionBar) {
        attentionBar.style.width = "100%";
        attentionBar.className = "gauge-fill";
    }
    if (attentionPercent) attentionPercent.textContent = "100%";

    sounds.playStart();
    hideMockingCharacter();
    drawBoard();

    turnStatus.textContent = "YOUR TURN";
    gameStatus.textContent = "GAME ACTIVE";
    gameStatus.className = "game-status-badge";

    attentionStatus.textContent = cameraRunning ? "LOOK AT THE BOARD" : "WAITING FOR FEED...";
    attentionStatus.className = "attention-status";

    addLog("NEW MATCH INITIALIZED. DON'T LOOK AWAY.");
}

// ==========================================
// SYSTEM LOG (CATEGORIZED BADGES)
// ==========================================

function addLog(message) {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    let tag = "[SYSTEM]";
    let tagClass = "tag-system";

    if (message.startsWith("YOU:")) {
        tag = "[PLAYER]";
        tagClass = "tag-player";
    } else if (message.startsWith("BLACK:")) {
        tag = "[OPPONENT]";
        tagClass = "tag-opponent";
    } else if (message.includes("CHEAT") || message.includes("ILLEGAL") || message.includes("FREE MOVE")) {
        tag = "[PENALTY]";
        tagClass = "tag-cheat";
    } else if (message.includes("FOCUS") || message.includes("LOOK") || message.includes("GAZE") || message.includes("ATTENTION")) {
        tag = "[OPTICAL]";
        tagClass = "tag-attention";
    }

    const item = document.createElement("div");
    item.className = "log-item";
    item.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-tag ${tagClass}">${tag}</span>
        <span class="log-msg">${escapeHTML(message)}</span>
    `;

    eventLog.appendChild(item);
    eventLog.scrollTop = eventLog.scrollHeight;
}

// ==========================================
// UTILITY HELPERS
// ==========================================

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================

startButton.addEventListener("click", startCamera);
newGameButton.addEventListener("click", newGame);

if (soundToggle) {
    soundToggle.addEventListener("click", () => {
        const isAudioActive = sounds.toggle();
        const icon = soundToggle.querySelector(".sound-icon");
        const text = soundToggle.querySelector(".sound-text");

        if (isAudioActive) {
            if (icon) icon.textContent = "🔊";
            if (text) text.textContent = "AUDIO ON";
            soundToggle.classList.remove("muted");
            sounds.playMove();
        } else {
            if (icon) icon.textContent = "🔇";
            if (text) text.textContent = "AUDIO MUTED";
            soundToggle.classList.add("muted");
        }
    });
}

// Initial Render
drawBoard();
addLog("SURVEILLANCE CHESS READY.");
addLog("RULE #1: KEEP YOUR EYES ON THE BOARD.");