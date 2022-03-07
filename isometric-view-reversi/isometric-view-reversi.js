let canvas;
let marginX;
let marginY;

let board;
let turn;
let gameEnds;
let boardChanged;

let isFlipping;
let flipAngle;
let flippingDisks;

const isOutOfRange = (w, h) => (w < 0 || h < 0 || w >= 8 || h >= 8);

const vec2 = (x, y) => new p5.Vector(x, y);
const toArray = (v) => [v.x, v.y];

function setup() {
	createCanvas(windowWidth, windowHeight);
	strokeWeight(2);
	angleMode(DEGREES);
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


	board = Array(8).fill(0).map(() => Array(8).fill(0));
	board[3][3] = board[4][4] = +1;
	board[3][4] = board[4][3] = -1;
	turn = +1;
	boardChanged = false;

	flipAngle = 0;
	isFlipping = false;
	flippingDisks = [];
}

function draw() {
	clear();
	translate(marginX, marginY);
	scale(canvas / 720);
	noStroke();
	fill('white');
	rect(0, 0, canvas, 11 * canvas / 9);
	stroke('black');
	fill('olivedrab');
	quad(0, 360, 0, 480, 360, 720, 360, 600);
	fill('green');
	quad(720, 360, 720, 480, 360, 720, 360, 600);

	let flipped = false;
	gameEnds = flipAngle === 0 && !isFlipping;
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			let r = vec2(405, 90);
			let w = vec2(45, 30);
			let h = vec2(-45, 30);
			let diff = p5.Vector.add(r, p5.Vector.mult(w, i)).add(
				p5.Vector.mult(h, j + 1)
			);
			let ratio = 1;

			fill('olivedrab');
			stroke('black');
			quad(
				...toArray(diff),
				...toArray(p5.Vector.add(w, diff)),
				...toArray(p5.Vector.add(w, diff).add(h)),
				...toArray(p5.Vector.add(h, diff))
			);

			if (board[j][i] === 0) {
				gameEnds = false;
				continue;
			}
			if (flippingDisks.includes(i + "" + j)) {
				ratio = cos(flipAngle);
				if (flipAngle === 90) board[j][i] = turn;
				if (!flipped) {
					flipAngle += 9;
					flipped = true;
				}
				if (flipAngle === 180) {
					isFlipping = false;
					flipAngle = 0;
					flippingDisks = [];
					turn = -turn;

					for (let k = 0; k < 8; k++) {
						for (let l = 0; l < 8; l++) {
							if (board[l][k] === 0) {
								updateBoard(k, l, false);
								if (boardChanged) k = l = 8;
							}
						}
					}
					if (!boardChanged) turn = -turn;
				}
			}
			push();
			fill(board[j][i] === +1 ? 'white' : 'black');
			noStroke();
			translate(diff.x, diff.y + 30);
			rotate(-20);
			for (let k = -1; k < 2; k++) {
				ellipse(-k / 2.5, k, 40, ratio * 30);
			}
			pop();
		}
	}
	if (!board.flat().includes(+1) ||
		!board.flat().includes(-1)) {
		gameEnds = true;
	}

	textSize(48);
	textAlign(LEFT, TOP);
	fill('white');
	noStroke();
	rect(0, 0, 720, 90);
	fill('black');
	if (gameEnds) {
		let total = board.flat().reduce((sum, element) => sum + element, 0);
		if (total === 0) {
			text("引き分けです", 0, 24);
			return;
		}
		text(abs(total) + "枚差で　の勝利です", 0, 24);
		fill(total > 0 ? 'white' : 'black');
	} else {
		text("のターンです", 48, 24);
		fill(turn === +1 ? 'white' : 'black');
	}
	stroke('black');
	circle(gameEnds ? 225 : 24, 50, 36);
}

function updateBoard(w, h, flip = true) {
	boardChanged = false;
	for (let i = 0; i < 360; i += 45) {
		let flippables = [];
		for (let j = 1; j < floor(8 * sqrt(2.0)); j++) {
			let p = j * round(cos(i)) + w;
			let q = j * round(sin(i)) + h;

			if (isOutOfRange(p, q) || board[q][p] === 0) {
				flippables = [];
				break;
			} else if (board[q][p] === turn) break;
			flippables.push(p + "" + q);
		}

		for (let v of flippables) {
			if (flip) {
				flippingDisks.push(v);
			}
			boardChanged = true;
		}
	}
}

function mousePressed() {
	let r = vec2(405, 90);
	let diff = vec2((mouseX - marginX), (mouseY - marginY)).sub(r);
	let p = floor((diff.x + 2 * diff.y) / 120);
	let q = floor((2 * diff.y - diff.x) / 120) - 1;

	if (gameEnds || isOutOfRange(p, q) ||
		board[q][p] !== 0 || isFlipping) return;

	updateBoard(p, q);
	if (boardChanged) {
		board[q][p] = turn;
		isFlipping = true;
	}
}