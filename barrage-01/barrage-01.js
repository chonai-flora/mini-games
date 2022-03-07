let canvas;
let half;
let marginX;
let marginY;

let gameStatus;
let up, down, left, right;

let player;
let enemy;
let target;
let hitMissele;
let hitTarget;
let missiles;

let hp;
let score;
let hitTime;
let frame;

const vec2 = (x, y) => new p5.Vector(x, y);

function setup() {
	createCanvas(windowWidth, windowHeight);
	textAlign(CENTER, CENTER);
	canvas = min(width, height, 720);
	half = canvas / 2;
	marginX = (width - canvas) / 2;
	marginY = (height - canvas) / 2;
	gameInit();
}

function gameInit() {
	up = down = left = up = false;

	player = new Player();
	enemy = new Enemy();
	target = new Target();
	hitMissile = new HitEffect();
	hitTarget = new HitEffect();
	missiles = [];

	hp = 10;
	score = 0;
	hitTime = 0;
	frame = 0;

	enemy.fire();
	target.init();
	gameStatus = true;
}

function draw() {
	if (gameStatus) frame++;
	clear();
	translate(marginX, marginY);
	fill('black');
	noStroke();
	square(0, 0, canvas);

	player.update();
	player.draw();

	if (target.isHit(player.pos, player.r)) {
		score += gameStatus;
		hitTarget.init(player.pos, 'pink');
		target.init();
	}
	target.update();
	target.draw();

	for (let i = 0; i < missiles.length; i++) {
		if (frame > 60 && hitTime === 0 && missiles[i].isHit(player.pos, player.r)) {
			hp -= gameStatus;
			hitTime = 180;
			hitMissile.init(player.pos, 'white');
		} else if (hitTime > 0) {
			hitTime--;
		}

		missiles[i].update();
		missiles[i].draw();

		if (missiles[i].isDead()) {
			missiles.splice(i, 1);
		}
	}

	enemy.update();
	enemy.draw();
	if (frame % 270 === 0) {
		enemy.turn(0);
	}
	if (frame % 90 === 0) {
		enemy.fire();
	}

	if (hitMissile.isActive) {
		hitMissile.update();
		hitMissile.draw();
	}
	if (hitTarget.isActive) {
		hitTarget.update();
		hitTarget.draw();
	}

	if (gameStatus) {
		fill('aqua');
		noStroke();
		textSize(half / 15);

		text("HP\t\t\t : " + nf(hp, 2) + " / 10\nSCORE : " + nf(score, 2) + " / 10\n", 150, 75);
	}

	if (score >= 10 && hp === 10) {
		result(1);
	} else if (hp <= 0) {
		result(2);
	} else if (score >= 10) {
		result(3);
	}
}

function result(flag) {
	background(0, 192);
	fill('aqua');
	noStroke();
	textSize(half / 6);
	let message = flag === 1 ?
		"PERFECT!!!" : flag === 2 ?
			"GAME OVER..." : "GAME CLEAR!";
	text(message, half, half - 50);
	textSize(half / 8);
	text("RESULT : " + nf(score + hp, 2), half, half + 50);

	gameStatus = false;
}

function textEmoji(emoji, pos, size) {
	fill('white');
	noStroke();
	textSize(size);
	text(emoji, pos.x, pos.y);
}

function keyPressed() {
	if (keyCode === UP_ARROW) up = true;
	if (keyCode === DOWN_ARROW) down = true;
	if (keyCode === LEFT_ARROW) left = true;
	if (keyCode === RIGHT_ARROW) right = true;

	if (key === ' ') gameInit();
}

function keyReleased() {
	if (keyCode === UP_ARROW) up = false;
	if (keyCode === DOWN_ARROW) down = false;
	if (keyCode === LEFT_ARROW) left = false;
	if (keyCode === RIGHT_ARROW) right = false;
}

// Missile
class Missile {
	constructor(pos0) {
		this.pos0 = pos0;
		this.type = int(random(4));
		this.frame = 0;
		this.r = half / 48;
		this.vel = half / 180;
		this.acc = 2;
		this.rot = int(random(1, 5));

		this.pos = [];
		for (let i = 0; i < 50; i++) {
			this.pos[i] = vec2(0, 0);
		}
	}

	update() {
		this.frame++;
		this.vel += this.acc;

		let theta = 0;
		for (let i = 0; i < 50; i++) {
			if (this.type === 0) {
				this.pos[i] = vec2(
					this.vel * cos(theta) + this.pos0.x,
					this.vel * sin(theta) + this.pos0.y
				);
			} else if (this.type === 1) {
				this.pos[i] = vec2(
					this.vel * sin(theta * this.rot * 2) * cos(theta) + this.pos0.x,
					this.vel * sin(theta * this.rot * 2) * sin(theta) + this.pos0.y
				);
			} else if (this.type === 2) {
				let theta0 = PI / 2 * this.rot + theta;
				this.pos[i] = vec2(
					this.vel / 5 * theta * cos(theta0) + this.pos0.x,
					this.vel / 5 * theta * sin(theta0) + this.pos0.y
				);
			} else if (this.type === 3) {
				this.pos[i] = vec2(
					this.vel * (cos(theta) + cos((this.rot * 2 + 1) * theta)) + this.pos0.x,
					this.vel * (sin(theta) - sin((this.rot * 2 + 1) * theta)) + this.pos0.y
				);
			}

			theta += PI / 25;
		}
	}

	isDead() { return (this.frame > 400); }

	isHit(pos, r) {
		for (let i = 0; i < 50; i++) {
			if (this.pos[i].dist(pos) <= (r + this.r) / 2) {
				return true;
			}
		}
		return false;
	}

	draw() {
		for (let i = 0; i < 50; i++) {
			textEmoji("⚙️", this.pos[i], this.r);
		}
	}
}

// Player
class Player {
	constructor() {
		this.pos = vec2(half, canvas / 1.25);
		this.r = half / 20;
		this.vel = 0;
		this.offset = sqrt(2);
	}

	update() {
		if (left || right) {
			this.vel = (up || down ? 5 / this.offset : 5);
		} else if (up || down) {
			this.vel = 5;
		}
		if (this.pos.x - this.r > 0 && left) this.pos.x -= this.vel;
		if (this.pos.x + this.r < canvas && right) this.pos.x += this.vel;
		if (this.pos.y - this.r > 0 && up) this.pos.y -= this.vel;
		if (this.pos.y + this.r < canvas && down) this.pos.y += this.vel;
	}

	draw() {
		textEmoji("🛸", this.pos, this.r);
	}
}

// Enemy
class Enemy {
	constructor() {
		this.pos = vec2(half, half);
		this.vel = vec2(0, 0);
		this.r = 25;
	}

	turn(flag) {
		if (flag === 1) {
			this.vel.x = random(6);
		} else if (flag === 2) {
			this.vel.x = random(-6);
		} else if (flag === 3) {
			this.vel.y = random(6);
		} else if (flag === 4) {
			this.vel.y = random(-6);
		} else {
			this.vel.x = random(-5, 6);
			this.vel.y = random(-5, 6);
		}
	}

	update() {
		this.pos.add(this.vel);

		if (this.pos.x - this.r < half / 4) {
			this.turn(1);
		}
		if (this.pos.x + this.r > canvas - half / 4) {
			this.turn(2);
		}
		if (this.pos.y - this.r < half / 4) {
			this.turn(3);
		}
		if (this.pos.y + this.r > canvas - half / 4) {
			this.turn(4);
		}
	}

	fire() {
		missiles.push(new Missile(this.pos.copy()));
	}

	draw() {
		textEmoji("🤖", this.pos, this.r);
	}
}

// Target
class Target {
	constructor() {
		this.pos = vec2(0, 0);
		this.r = half / 18;
		this.ringR = half / 7.2;
	}

	init() { this.pos = vec2(random(canvas), random(canvas)); }

	isHit(pos, r) { return (this.pos.dist(pos) <= (r + this.r) / 2); }

	update() {
		this.ringR -= 0.5;
		if (this.ringR < this.r) this.ringR = 50;
	}

	draw() {
		noFill();
		stroke('pink');
		strokeWeight(1);
		circle(this.pos.x, this.pos.y, this.ringR);
		textEmoji("🎯", this.pos, this.r);
	}
}

// HitEffect
class HitEffect {
	constructor() {
		this.pos0 = vec2(0, 0);
		this.isActive = false;
		this.vel = 0;
		this.acc = half / 90;
		this.r = half / 72;
		this.maxVel = 40;
		this.color = 'black';
	}

	init(pos0, color) {
		this.pos0 = pos0;
		this.isActive = true;
		this.vel = 0;
		this.color = color;
	}

	update() {
		this.vel += this.acc;
		if (this.vel > this.maxVel) {
			this.isActive = false;
		}
	}

	draw() {
		let theta = 0;
		for (let i = 0; i < 25; i++) {
			fill(this.color);
			noStroke();
			circle(
				this.vel * cos(theta) + this.pos0.x,
				this.vel * sin(theta) + this.pos0.y,
				this.r
			);
			theta += PI / 12.5;
		}
	}
}