let canvas;
let marginX;
let marginY;

let score;
let w, h;
let boardX, boardY;
let board;
let cellStatus;

let nArray = (e) =>
    Array(8).fill(e).map(() => Array(8).fill(e));

function setup() {
    createCanvas(windowWidth, windowHeight);
    const device = navigator.userAgent;
    const isPhone = (
        device.indexOf('iPhone') > 0 &&
        device.indexOf('iPad') === -1 ||
        device.indexOf('iPod') > 0 ||
        device.indexOf('Android') > 0
    );
    canvas = min(
        width, height,
        isPhone ? width * height : 720
    );
    marginX = (width - canvas) / 2;
    marginY = (height - canvas) / 2;

    textAlign(CENTER, CENTER);
    angleMode(DEGREES);
    gameInit();
    noLoop();
}

function gameInit() {
    score = 1;
    boardX = int(random(8));
    boardY = int(random(8));
    w = canvas / 8;
    h = canvas / 9;
    board = nArray('-');
    cellStatus = nArray(2);
    board[boardY][boardX] = '♞';
    cellStatus[boardY][boardX] = 0;

    redraw();
}

// 0:♞ 1:移動済み 2:駒なし 3:移動可能
function draw() {
    clear();
    translate(marginX, marginY);
    fill('gainsboro');
    noStroke();
    square(0, 0, canvas);
    updateCellStatus(3);

    let gameEnds = true;
    textSize(canvas / 16);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (cellStatus[j][i] === 0) fill('silver');
            else if (cellStatus[j][i] === 1) fill('lightgrey');
            else fill('snow');
            stroke('gainsboro')
            rect(w * i, h * j + h, w, h);
            noStroke();
            if (cellStatus[j][i] === 3) {
                fill('silver');
                circle(w * i + w / 2, h * j + h * 3 / 2, w / 2);
            }
            fill('black');
            text(board[j][i], w * i + w / 2, h * j + h * 3 / 2 - 2);

            if (cellStatus[j][i] === 3) gameEnds = false;
        }
    }
    textSize(canvas / 15);
    text("SCORE : " + score, canvas / 2, h / 2);

    if (score === 64) result("Game Clear!");
    else if (gameEnds) result("RESULT : " + score);
}

function updateCellStatus(n) {
    for (let i = 30; i < 360 + 30; i += 45) {
        let p = round(2.0 * cos(i)) + boardX;
        let q = round(2.0 * sin(i)) + boardY;
        if (p >= 0 && q < 8 && p < 8 && q >= 0 && cellStatus[q][p] !== 1) {
            cellStatus[q][p] = n;
        }
    }
}

function result(message) {
    fill('gainsboro');
    rect(0, 0, canvas, h);
    fill('red');
    textSize(50);
    text(message, canvas / 2, w / 2);
}

function mousePressed() {
    let p = floor((mouseX - marginX) / w);
    let q = floor((mouseY - marginY) / h) - 1;
    if (p < 0 || p >= 8 || q < 0 || q >= 8) return;

    if (cellStatus[q][p] === 3) {
        updateCellStatus(2);
        board[boardY][boardX] = score.toString();
        board[q][p] = '♞';
        cellStatus[boardY][boardX] = 1;
        cellStatus[q][p] = 0;
        boardX = p; boardY = q;

        score++;
        redraw();
    }
}

function keyPressed() {
    if (key === ' ') gameInit();
}