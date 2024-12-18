const OPOSSUM_X_VELOCITY = -20;
const OPOSSUM_JUMP_POWER = 250;
const OPOSSUM_GRAVITY = 580;

class Opossum {
	constructor({
		x,
		y,
		width = 36,
		height = 28,
		velocity = { x: OPOSSUM_X_VELOCITY, y: 0 },
		range = 290,
	}) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.velocity = velocity;
		this.isOnGround = false;
		this.isImageLoaded = false;
		this.image = new Image();
		this.image.onload = () => {
			this.isImageLoaded = true;
		};
		this.image.src = "./images/opossum.png";
		this.elapsedTime = 0;
		this.currentFrame = 0;
		this.sprites = {
			run: {
				x: 0,
				y: 0,
				width: 36,
				height: 28,
				frames: 6,
			},
		};
		this.currentSprite = this.sprites.run;
		this.direction = "right";
		this.hitBox = {
			x: 0,
			y: 0,
			height: 19,
			width: 30,
		};
		this.distanceTraveled = 0;
		this.range = range;
		this.id = Math.floor(Math.random() * Math.random() * 1000) + 1;
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
			if (this.direction === "right") {
				xScale = -1;
				x = -this.x - this.width;
			}
			c.save();
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
		if (!deltaTime) return;

		this.elapsedTime += deltaTime;
		const secondsInterval = 0.1;
		//this works because the remaineder will be 0 when its the end and restart the cycle
		if (this.elapsedTime > 0.1) {
			this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames;
			this.elapsedTime -= secondsInterval;
		}
		//hitbox position
		//NEEDS DEBUGGING
		this.hitBox.x = this.x;
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
	}

	determineDirection() {
		//this.direction = this.velocity.x > 0 ? "right" : "left";
		if (this.velocity.x > 0) {
			this.direction = "right";
		} else if (this.velocity.x < 0) {
			this.direction = "left";
		}
	}

	jump() {
		this.velocity.y = -OPOSSUM_JUMP_POWER;
		this.isOnGround = false;
	}

	updateHorizontalPosition(deltaTime) {
		if (Math.abs(this.distanceTraveled) > this.range) {
			this.velocity.x = -this.velocity.x;
			this.distanceTraveled = 0;
		}
		this.x += this.velocity.x * deltaTime;
		this.hitBox.x += this.velocity.x * deltaTime;
		this.distanceTraveled += this.velocity.x * deltaTime;
	}

	updateVerticalPosition(deltaTime) {
		this.y += this.velocity.y * deltaTime;
		this.hitBox.y += this.velocity.y * deltaTime;
	}

	applyGravity(deltaTime) {
		this.velocity.y += OPOSSUM_GRAVITY * deltaTime;
	}

	handleInput(keys) {
		this.velocity.x = 0;

		if (keys.d.pressed) {
			this.velocity.x = OPOSSUM_X_VELOCITY;
		} else if (keys.a.pressed) {
			this.velocity.x = -OPOSSUM_X_VELOCITY;
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
					this.x = this.hitBox.x;
					break;
				}

				// Check collision while player is going right
				if (this.velocity.x > 0) {
					this.hitBox.x = collisionBlock.x - this.hitBox.width - buffer;
					this.x = this.hitBox.x;
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
