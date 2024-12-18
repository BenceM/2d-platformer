const X_VELOCITY = 200;
const JUMP_POWER = 250;
const GRAVITY = 580;

class Player {
	constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
		this.x = x;
		this.y = y;
		this.width = size;
		this.height = size;
		this.velocity = velocity;
		this.isOnGround = false;
		this.isImageLoaded = false;
		this.image = new Image();
		this.image.onload = () => {
			this.isImageLoaded = true;
		};
		this.image.src = "./images/player.png";
		this.elapsedTime = 0;
		this.currentFrame = 0;
		this.sprites = {
			idle: {
				x: 0,
				y: 0,
				width: 33,
				height: 32,
				frames: 4,
			},
			run: {
				x: 0,
				y: 32,
				width: 33,
				height: 32,
				frames: 6,
			},
			jump: {
				x: 0,
				y: 32 * 5,
				width: 33,
				height: 32,
				frames: 1,
			},
			fall: {
				x: 33,
				y: 32 * 5,
				width: 33,
				height: 32,
				frames: 1,
			},
			damage: {
				x: 0,
				y: 32 * 4,
				width: 33,
				height: 32,
				frames: 2,
			},
		};
		this.currentSprite = this.sprites.idle;
		this.direction = "right";
		this.hitBox = {
			x: 0,
			y: 0,
			height: 23,
			width: 20,
		};
		this.isInvincible = false;
		// this.previousInvincible = false;
		this.isFlickering = false;
		this.jumpMax = 2;
		this.currentJump = 0;
	}
	setIsInvincible() {
		this.isInvincible = true;

		const flickerInterval = setInterval(() => {
			this.isFlickering = !this.isFlickering;
		}, 200);

		setTimeout(() => {
			this.isInvincible = false;
			// this.previousInvincible = false;
			clearInterval(flickerInterval);
			this.isFlickering = false;
		}, 1500);
	}

	draw(c) {
		// Red square debug code
		// c.fillStyle = "rgba(255, 0, 0, 0.5)";
		// c.fillRect(this.x, this.y, this.width, this.height);
		// c.fillStyle = "rgba(0, 0, 255, 0.5)";
		// c.fillRect(
		// 	this.hitBox.x,
		// 	this.hitBox.y,
		// 	this.hitBox.width,
		// 	this.hitBox.height,
		// );
		if (this.isImageLoaded) {
			let xScale = 1;
			let x = this.x;
			if (this.direction === "left") {
				xScale = -1;
				x = -this.x - this.width;
			}
			c.save();
			if (this.isInvincible && this.isFlickering) {
				c.globalAlpha = 0.5;
			} else {
				c.globalAlpha = 1;
			}
			c.scale(xScale, 1);
			c.drawImage(
				this.image,
				this.currentSprite.x + this.currentSprite.width * this.currentFrame,
				this.currentSprite.y,
				this.currentSprite.width,
				this.currentSprite.height,
				x,
				this.y,
				this.width,
				this.height,
			);
			c.restore();
		}
	}

	update(deltaTime, collisionBlocks) {
		if (!deltaTime && this.isDead) return;

		this.elapsedTime += deltaTime;
		const secondsInterval = 0.1;
		//this works because the remaineder will be 0 when its the end and restart the cycle
		if (this.elapsedTime > 0.1) {
			this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames;
			this.elapsedTime -= secondsInterval;
		}
		//hitbox position
		//NEEDS DEBUGGING
		this.hitBox.x = this.x + 4;
		this.hitBox.y = this.y + 9;
		this.applyGravity(deltaTime);

		// Update horizontal position and check collisions
		this.updateHorizontalPosition(deltaTime);
		this.checkForHorizontalCollisions(collisionBlocks);

		// Check for any platform collisions
		this.checkPlatformCollisions(platforms, deltaTime);

		// Update vertical position and check collisions
		this.updateVerticalPosition(deltaTime);
		this.checkForVerticalCollisions(collisionBlocks);
		this.determineDirection();

		this.switchSprites();
	}

	determineDirection() {
		//this.direction = this.velocity.x > 0 ? "right" : "left";
		if (this.velocity.x > 0) {
			this.direction = "right";
		} else if (this.velocity.x < 0) {
			this.direction = "left";
		}
	}
	switchSprites() {
		// if (this.isInvincible === true && this.previousInvincible === false) {
		// 	console.log("hello");
		// 	this.currentFrame = 0;
		// 	this.currentSprite = this.sprites.damage;
		// 	this.previousInvincible = true;
		// }
		if (
			this.isOnGround &&
			this.velocity.x === 0 &&
			this.currentSprite !== this.sprites.idle
		) {
			//idle
			this.currentFrame = 0;
			this.currentSprite = this.sprites.idle;
		} else if (
			this.isOnGround &&
			this.velocity.x !== 0 &&
			this.currentSprite !== this.sprites.run
		) {
			//running
			this.currentFrame = 0;
			this.currentSprite = this.sprites.run;
		} else if (!this.isOnGround) {
			//jump and fall
			this.velocity.y < 0
				? ((this.currentFrame = 0),
				  (this.currentSprite =
						this.currentSprite === this.sprites.jump
							? this.currentSprite
							: this.sprites.jump))
				: ((this.currentFrame = 0),
				  (this.currentSprite =
						this.currentSprite === this.sprites.fall
							? this.currentSprite
							: this.sprites.fall));
		}
	}
	jump() {
		if (this.currentJump >= this.jumpMax) {
			if (this.isOnGround) {
				this.currentJump = 0;
				this.velocity.y = -JUMP_POWER;
				this.currentJump++;
				this.isOnGround = false;
			}

			return;
		} else {
			this.velocity.y = -JUMP_POWER;
			this.currentJump++;
			this.isOnGround = false;
		}
	}
	takeDamage() {
		this.currentFrame = 0;
		this.currentSprite = this.sprites.damage;
	}
	updateHorizontalPosition(deltaTime) {
		this.x += this.velocity.x * deltaTime;
		this.hitBox.x += this.velocity.x * deltaTime;
	}

	updateVerticalPosition(deltaTime) {
		this.y += this.velocity.y * deltaTime;
		this.hitBox.y += this.velocity.y * deltaTime;
	}

	applyGravity(deltaTime) {
		this.velocity.y += GRAVITY * deltaTime;
	}

	handleInput(keys) {
		this.velocity.x = 0;

		if (keys.d.pressed) {
			this.velocity.x = X_VELOCITY;
		} else if (keys.a.pressed) {
			this.velocity.x = -X_VELOCITY;
		}
	}

	checkForHorizontalCollisions(collisionBlocks) {
		const buffer = 0.0001;
		for (let i = 0; i < collisionBlocks.length; i++) {
			const collisionBlock = collisionBlocks[i];

			// Check if a collision exists on all axes
			if (
				this.hitBox.x <= collisionBlock.x + collisionBlock.width &&
				this.hitBox.x + this.hitBox.width >= collisionBlock.x &&
				this.hitBox.y + this.hitBox.height >= collisionBlock.y &&
				this.hitBox.y <= collisionBlock.y + collisionBlock.height
			) {
				// Check collision while player is going left
				if (this.velocity.x < -0) {
					this.hitBox.x = collisionBlock.x + collisionBlock.width + buffer;
					this.x = this.hitBox.x - 4;
					break;
				}

				// Check collision while player is going right
				if (this.velocity.x > 0) {
					this.hitBox.x = collisionBlock.x - this.hitBox.width - buffer;
					this.x = this.hitBox.x - 4;
					break;
				}
			}
		}
	}

	checkForVerticalCollisions(collisionBlocks) {
		const buffer = 0.0001;
		for (let i = 0; i < collisionBlocks.length; i++) {
			const collisionBlock = collisionBlocks[i];

			// If a collision exists
			if (
				this.hitBox.x <= collisionBlock.x + collisionBlock.width &&
				this.hitBox.x + this.hitBox.width >= collisionBlock.x &&
				this.hitBox.y + this.hitBox.height >= collisionBlock.y &&
				this.hitBox.y <= collisionBlock.y + collisionBlock.height
			) {
				// Check collision while player is going up
				if (this.velocity.y < 0) {
					this.velocity.y = 0;
					this.hitBox.y = collisionBlock.y + collisionBlock.height + buffer;
					this.y = this.hitBox.y - 9;
					break;
				}

				// Check collision while player is going down
				if (this.velocity.y > 0) {
					this.velocity.y = 0;
					this.y = collisionBlock.y - this.height - buffer;
					this.hitBox.y = collisionBlock.y - this.hitBox.height - buffer;
					this.isOnGround = true;
					this.currentJump = 0;
					break;
				}
			}
		}
	}

	checkPlatformCollisions(platforms, deltaTime) {
		const buffer = 0.0001;
		for (let platform of platforms) {
			if (platform.checkCollision(this, deltaTime)) {
				this.velocity.y = 0;
				this.y = platform.y - this.height - buffer;
				this.isOnGround = true;
				this.currentJump = 0;
				return;
			}
		}
		this.isOnGround = false;
	}
}
