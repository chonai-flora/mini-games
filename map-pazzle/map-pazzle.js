let canvas;
let marginX;
let marginY;

let div;
let block;

let divP;
let divSelect;

let swapX, swapY;
let pieces;
let angles;
let indexes;

const alpha = (fac, min) => map(canvas - fac, 0, canvas, min, 256);
const isFitting = (x, y) => angles[y][x] === 0 &&
	indexes[y][x].x === x && indexes[y][x].y === y;

function setDoms() {
	divP = createElement('p', "分割数 : ");
	divP.style('font-size', `${canvas / 40}px`);
	divP.position(marginX, marginY - canvas / 12);
	divSelect = createSelect();
	divSelect.size(canvas / 16, canvas / 20);
	divSelect.style('font-size', `${canvas / 45}px`);
	divSelect.position(canvas / 9 + marginX, marginY - canvas / 15);
	for (let i = 4; i <= 16; i += 2) {
		divSelect.option(i);
	}
	divSelect.selected('8');
	divSelect.changed(setPieces);
}

function setPieces() {
	let graphic = createGraphics(canvas, canvas);
	graphic.noStroke();
	for (let r = 0; r < canvas; r += 5) {
		for (let c = 0; c < canvas; c += 5) {
			let n = noise(r / 50, c / 50);
			if (n < 0.35)
				graphic.fill(255, 255, 255, alpha(c, 64));
			else if (n < 0.5)
				graphic.fill(0, 0, 255, alpha(c, 192));
			else
				graphic.fill(0, 255, 0, alpha(c, 192));

			graphic.square(r, c, 5);
		}

		div = int(divSelect.value());
		block = canvas / div;
		swapX = div; swapY = div;

		pieces = Array(div).fill().map(() => Array(div));
		angles = Array(div).fill().map(() => Array(div));
		indexes = Array(div).fill().map(() => Array(div));
		for (let r = 0; r < div; r++) {
			for (let c = 0; c < div; c++) {
				pieces[c][r] = graphic.get(r * block, c * block, block, block);
				angles[c][r] = 0;
				indexes[c][r] = createVector(r, c);
			}
		}

		for (let i = 0; i < div * div * 2; i++) {
			let r1 = int(random(div));
			let c1 = int(random(div));
			let r2 = int(random(div));
			let c2 = int(random(div));

			let corners = [
				[0, 0],
				[0, div - 1],
				[div - 1, div - 1],
				[div - 1, 0]
			];
			if (corners.every(e =>
				(e[0] !== r1 || e[1] !== c1) &&
				(e[0] !== r2 || e[1] !== c2))) {
				swapPiece(r1, c1, r2, c2);
				rotatePiece(r1, c1);
				rotatePiece(r2, c2);
			}
		}
	}

	redraw();
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
	marginX = (width - canvas) / 2;
	marginY = (height - canvas) / 2;

	imageMode(CENTER);
	setDoms();
	setPieces();
	noLoop();

	document.oncontextmenu = (() => false);
}

function draw() {
	clear();
	translate(marginX, marginY);
	for (let r = 0; r < div; r++) {
		for (let c = 0; c < div; c++) {
			push();
			translate((r + 0.5) * block, (c + 0.5) * block);
			rotate(PI / 2 * angles[c][r]);
			image(pieces[c][r], 0, 0);
			pop();
		}
	}

	stroke('grey');
	strokeWeight(12 / div);
	noFill();
	for (let r = 0; r < div; r++) {
		for (let c = 0; c < div; c++) {
			if (!isFitting(r, c)) {
				square(r * block, c * block, block - 1);
			}
		}
	}

	if (swapX < div && swapY < div) {
		stroke('black');
		strokeWeight(16 / div);
		square(swapX * block, swapY * block, block);
	}
}

function mousePressed() {
	let x = floor((mouseX - marginX) / block);
	let y = floor((mouseY - marginY) / block);
	if (x < 0 || y < 0 || x >= div || y >= div) return;
	if (isFitting(x, y)) return;

	if (mouseButton === LEFT) {
		if (swapX === div && swapY === div) {
			swapX = x; swapY = y;
		} else {
			swapPiece(swapX, swapY, x, y);
			swapX = div; swapY = div;
		}
	} else {
		rotatePiece(x, y);
		swapX = div; swapY = div;
	}

	redraw();
}

function rotatePiece(x, y) {
	angles[y][x] = (angles[y][x] + 1) % 4;
}

function swapPiece(x1, y1, x2, y2) {
	let pieceTmp = pieces[y1][x1];
	pieces[y1][x1] = pieces[y2][x2];
	pieces[y2][x2] = pieceTmp;

	let angleTmp = angles[y1][x1];
	angles[y1][x1] = angles[y2][x2];
	angles[y2][x2] = angleTmp;

	let posTmp = indexes[y1][x1];
	indexes[y1][x1] = indexes[y2][x2];
	indexes[y2][x2] = posTmp;
}