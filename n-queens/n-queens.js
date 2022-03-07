let canvas;
let half;
let marginX;
let marginY;

let boardN;
let nSelect;
let score;
let ratio;
let w, h;
let board;
let boardX, boardY;
let cellStatus;

let nArray = (e) =>
	Array(boardN).fill(e).map(() => Array(boardN).fill(e));

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
	half = canvas / 2;
	marginX = (width - canvas) / 2;
	marginY = (height - canvas) / 2;

	textAlign(CENTER, CENTER);
	angleMode(DEGREES);
	noLoop();
	nInit();
}

function screenInit() {
	clear();
	translate(marginX, marginY);
	fill('gainsboro');
	noStroke();
	square(0, 0, canvas);
}

function nInit() {
	boardN = 0;
	screenInit();
	fill('black');
	noStroke();
	textSize(half / 8);
	text("♛N Queens Pazzle♛", half, canvas / 4);
	text("N = \t", half, half);

	nSelect = createSelect();
	nSelect.position(half / 0.9, canvas / 1.25);
	nSelect.size(canvas / 9, canvas / 9);
	nSelect.style('font-size', `${half / 8}px`);
	nSelect.option('-');
	for (let i = 4; i <= 17; i++) {
		nSelect.option(i === 17 ? '?' : i.toString());
	}
	nSelect.changed(() => {
		let value = nSelect.value();
		boardN = int(value === '?' ? random(4, 17) : value);
		gameInit();
	});
}

function gameInit() {
	nSelect.remove();
	score = 0;
	ratio = half / (45 * boardN);
	w = canvas / boardN;
	h = canvas / (boardN + 1);
	boardX = boardY = 0;
	board = nArray('-');
	cellStatus = nArray(1);
	redraw();
}

// 0:♛ 1:移動可能 2:移動済み 3:駒なし
function draw() {
	if (boardN === 0) return;
	screenInit();
	updateCellStatus(3, boardX, boardY);

	let gameEnds = true;
	textSize(45 * ratio);
	for (let i = 0; i < boardN; i++) {
		for (let j = 0; j < boardN; j++) {
			if (board[j][i] === '♛') fill('silver');
			else if (cellStatus[j][i] === 1) fill('snow');
			else if (cellStatus[j][i] >= 2) fill('lightgrey');
			stroke('gainsboro');
			rect(i * w, (j + 1) * h, w, h);
			noStroke();
			if (cellStatus[j][i] === 1) {
				fill('silver');
				circle(i * w + w / 2, (j + 1.5) * h, w / 2);
			}
			fill('black');
			text(board[j][i], i * w + w / 2, (j + 1.5) * h);

			if (cellStatus[j][i] === 1) gameEnds = false;
		}
	}
	textSize(50 * ratio);
	text("SCORE : " + score, half, h / 2);

	if (score === boardN) result("Game Clear!");
	else if (gameEnds) result("RESULT : " + score);
}

function updateCellStatus(n, r, c) {
	if (score === 0) return;

	for (let i = 0; i < 360; i += 45) {
		for (let j = 1; j < floor(boardN * sqrt(2)); j++) {
			let p = round(j * cos(i)) + r;
			let q = round(j * sin(i)) + c;
			if (p >= 0 && q < boardN && p < boardN && q >= 0 && cellStatus[q][p] !== 2) {
				cellStatus[q][p] = n;
			}
		}
	}
}

function result(message) {
	fill('gainsboro');
	rect(0, 0, canvas, h);
	fill('red');
	textSize(50 * ratio);
	text(message, half, w / 2);
}

function mousePressed() {
	if (boardN === 0 || nSelect === undefined || nSelect.value() === '-') return;

	let p = floor((mouseX - marginX) / w);
	let q = floor((mouseY - marginY - w) / h);
	if (p < 0 || p >= boardN || q < 0 || q >= boardN) return;

	if (board[p][q] === '-' && cellStatus[q][p] === 1) {
		updateCellStatus(2, p, q);
		board[q][p] = score.toString();
		board[q][p] = '♛';
		cellStatus[q][p] = 0;
		boardX = p; boardY = q;

		score++;
		redraw();
	}
}

function keyPressed() {
	if (key === ' ') nInit();
}