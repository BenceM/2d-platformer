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
				y: 32,
				width: 33,
				height: 32,
				frames: 6,
			},
			fall: {
				x: 0,
				y: 32,
				width: 33,
				height: 32,
				frames: 2,
			},
		};
		this.currentSprite = this.sprites.idle;
	}

	draw(c) {
		// Red square debug code
		// c.fillStyle = "rgba(255, 0, 0, 0.5)";
		// c.fillRect(this.x, this.y, this.width, this.height);
		if (this.isImageLoaded) {
			c.drawImage(
				this.image,
				this.currentSprite.x + this.currentSprite.width * this.currentFrame,
				this.currentSprite.y,
				this.currentSprite.width,
				this.currentSprite.height,
				this.x,
				this.y,
				this.width,
				this.height,
			);
		}
	}

	update(deltaTime, collisionBlocks) {
		if (!deltaTime) return;

		this.elapsedTime += deltaTime;
		const secondsInterval = 0.1;
		//this works because the remaineder will be 0 when its the end and restart the cycle
		if (this.elapsedTime > 0.1) {
			this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames;
			this.elapsedTime -= secondsInterval;
		}

		this.applyGravity(deltaTime);

		// Update horizontal position and check collisions
		this.updateHorizontalPosition(deltaTime);
		this.checkForHorizontalCollisions(collisionBlocks);

		// Check for any platform collisions
		this.checkPlatformCollisions(platforms, deltaTime);

		// Update vertical position and check collisions
		this.updateVerticalPosition(deltaTime);
		this.checkForVerticalCollisions(collisionBlocks);
		this.switchSprites();
	}

	switchSprites() {
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
		}
	}
	jump() {
		this.velocity.y = -JUMP_POWER;
		this.isOnGround = false;
	}

	updateHorizontalPosition(deltaTime) {
		this.x += this.velocity.x * deltaTime;
	}

	updateVerticalPosition(deltaTime) {
		this.y += this.velocity.y * deltaTime;
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
				this.x <= collisionBlock.x + collisionBlock.width &&
				this.x + this.width >= collisionBlock.x &&
				this.y + this.height >= collisionBlock.y &&
				this.y <= collisionBlock.y + collisionBlock.height
			) {
				// Check collision while player is going left
				if (this.velocity.x < -0) {
					this.x = collisionBlock.x + collisionBlock.width + buffer;
					break;
				}

				// Check collision while player is going right
				if (this.velocity.x > 0) {
					this.x = collisionBlock.x - this.width - buffer;
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
				this.x <= collisionBlock.x + collisionBlock.width &&
				this.x + this.width >= collisionBlock.x &&
				this.y + this.height >= collisionBlock.y &&
				this.y <= collisionBlock.y + collisionBlock.height
			) {
				// Check collision while player is going up
				if (this.velocity.y < 0) {
					this.velocity.y = 0;
					this.y = collisionBlock.y + collisionBlock.height + buffer;
					break;
				}

				// Check collision while player is going down
				if (this.velocity.y > 0) {
					this.velocity.y = 0;
					this.y = collisionBlock.y - this.height - buffer;
					this.isOnGround = true;
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
				return;
			}
		}
		this.isOnGround = false;
	}
}
