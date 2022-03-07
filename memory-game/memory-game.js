let canvas;
let half;
let marginX;
let marginY;

let trumps = [];
let cardX = -1;
let cardY = -1;
let cardCount = 52;
let score = Array(2).fill(0);
let turn = +1;

const toIndex = (r, c) =>
	r % 13 + 12 * c + c;

const getNumber = (r, c) =>
	trumps[toIndex(r, c)]['number'];

const setHidden = (r, c, flag) =>
	trumps[toIndex(r, c)]['hidden'] = flag;

function showScore(n) {
	push();
	let x = half * (10 * n + 1) / 6 + 16;
	let y = half * (11 - 10 * n) / 6;
	fill(n === 1 ? 'green' : 'blue');
	textSize(half / 8);
	text("🂠", x - half / 8, y);
	fill('black');
	textSize(half / 12);
	text("×" + nf(score[n], 2), x, y);
	pop();
}

function showTurn() {
	push();
	textAlign(LEFT, CENTER);
	let gameEnds = cardCount <= 0;
	let message = gameEnds ? "の勝利です" : "のターンです";
	let fillStatus = gameEnds ? score[0] < score[1] : turn === 1;

	if (gameEnds && score[0] === score[1]) {
		textSize(half / 10);
		text("引き分けです", 2, -half / 12);
		pop();
		return;
	}
	fill(fillStatus ? 'green' : 'blue');
	textSize(half / 6);
	text("🂠", 2, -half / 12);
	fill('black');
	textSize(half / 10);
	text(message, half / 6 - 6, -half / 12);
	pop();
}

function setCards() {
	let numbers = [];
	for (let i = 0; i < 13 * 4; i++) {
		numbers[i] = i % 13;
	}
	numbers = shuffle(numbers);
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j <= 13; j++) {
			if (j === 11) continue;
			let k = j > 11 ? j - 1 : j;
			let num = numbers[toIndex(k, i)];
			trumps.push({
				'mark': i,
				'number': num + 1,
				'hidden': true,
				'card': String.fromCodePoint(
					0x01F0A1 + 16 * i + num + (num > 10)
				),
				'pos': [
					canvas / 13 * k + half / 13,
					canvas / 8 * (i + k / 3 + 0.5)
				],
			});
		}
	}
}

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

	setCards();
	textSize(canvas / 9);
	textAlign(CENTER, CENTER);
	noLoop();
}

function draw() {
	background('white');
	translate(marginX, marginY);
	showTurn();
	showScore(0);
	showScore(1);

	for (const trump of trumps) {
		push();
		let mark = trump['mark'];
		let hidden = trump['hidden'];
		if (hidden || mark < 1 || mark > 2) {
			fill('black');
		} else {
			fill('red');
		}
		if (trump['number'] > 0) {
			text(
				hidden ? "🂠" : trump['card'],
				...trump['pos']
			);
		}
		pop();
	}
}

function mousePressed() {
	let p = floor(13 * (mouseX - marginX) / canvas);
	let q = floor((12 * (mouseY - marginY) - p * half) / (3 * half));

	if (p < 0 || p > 13 || q < 0 || q > 3) return;

	let trump = trumps[toIndex(p, q)];
	if (trump['number'] < 1) return;
	trump['hidden'] = false;
	redraw();

	if (cardX < 0 && cardY < 0) {
		cardX = p; cardY = q;
	} else {
		if (p !== cardX || q !== cardY) {
			let cardsMatched =
				getNumber(p, q) === getNumber(cardX, cardY);
			if (cardsMatched) {
				score[int(turn === 1)] += 2;
				cardCount -= 2;
				redraw();
				trumps[toIndex(p, q)]['number'] = 0;
				trumps[toIndex(cardX, cardY)]['number'] = 0;
			} else {
				turn = -turn;
				redraw();
			}
			setHidden(p, q, !cardsMatched);
			setHidden(cardX, cardY, !cardsMatched);
			cardX = cardY = -1;
		}
	}
}