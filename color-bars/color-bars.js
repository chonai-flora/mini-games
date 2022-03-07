const COLORS = [
	'blue', 'yellow', 'pink', 'red', 'green'
];

let canvas;
let marginX;
let marginY;

let frame;
let score;
let blockFreq;
let gameStatus;

let blocks;
let pallet;

function setup() {
	createCanvas(windowWidth, windowHeight);
	canvas = min(width, height, 720);
	marginX = (width - canvas) / 2;
	marginY = (height - canvas) / 2;
	gameInit();
}

function gameInit() {
	frame = 0;
	score = 0;
	blockFreq = 10;
	gameStatus = true;

	blocks = [];
	pallet = new Pallet();

	blocks.push(new Block());
}

function draw() {
	if (gameStatus) frame++;
	clear();
	translate(marginX, marginY);
	fill('black');
	noStroke();
	square(0, 0, canvas);
	scale(canvas / 720);

	if (blocks[0].isDead()) {
		if (pallet.matches(blocks[0].x, blocks[0].type)) {
			blocks.splice(0, 1);
			score++;
			if (score % 10 === 0) {
				blockFreq--;
			}
		} else {
			gameStatus = false;
		}
	}

	showScore();

	if (frame % (blockFreq * 10) === 0) {
		blocks.push(new Block());
	}
	for (let i = 0; i < blocks.length; i++) {
		blocks[i].update();
		blocks[i].draw();
	}

	pallet.draw();

	if (!gameStatus || score >= 100) {
		showResult();
	}
}

function keyPressed() {
	pallet.update(keyCode);

	if (key === ' ') gameInit();
}

function showScore() {
	noFill();
	stroke('aqua');
	strokeWeight(2.5);
	arc(360, 360, 125, 125, -PI / 2, PI / 5 * score - PI / 2);
	fill('aqua');
	noStroke();
	textSize(36);
	textAlign(CENTER, CENTER);
	text(nf(score, 2), 360, 360);
}

function showResult() {
	background(0, 192);
	textAlign(CENTER, CENTER);
	fill('aqua');
	noStroke();
	textSize(65);
	if (score >= 100)
		text("Perfect!!!", 360, 310);
	else
		text("Try again!", 360, 310);
	textSize(45);
	text("RESULT : " + nf(score, 2), 360, 410);
}

class Block {
	constructor() {
		this.type = int(random(5));
		this.x = int(random(5));
		this.y = 0;
		this.vel = 24;
	}

	isDead() { return (this.y >= 696); }

	update() {
		if (frame % blockFreq === 0) {
			this.y += 24;
		}
	}

	draw() {
		fill(COLORS[this.type]);
		noStroke();
		rect(this.x * 144, this.y, 144, 24);
	}
}

class Pallet {
	constructor() {
		this.pos = [0, 1, 2, 3, 4];
	}

	matches(pos, type) { return (type === this.pos[pos]); }

	update(dir) {
		if (dir !== LEFT_ARROW && dir !== RIGHT_ARROW) return;
		else if (dir === LEFT_ARROW) {
			let tmp = this.pos[0];
			for (let i = 0; i < 4; i++) {
				this.pos[i] = this.pos[i + 1];
			}
			this.pos[4] = tmp;
		} else {
			let tmp = this.pos[4];
			for (let i = 4; i > 0; i--) {
				this.pos[i] = this.pos[i - 1];
			}
			this.pos[0] = tmp;
		}
	}

	draw() {
		noStroke();
		for (let i = 0; i < 5; i++) {
			fill(COLORS[this.pos[i]]);
			rect(144 * i, 696, 144, 24);
		}
	}
}