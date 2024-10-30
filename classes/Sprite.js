class Sprite {
	constructor({
		x,
		y,
		width,
		height,
		imgSrc,
		spriteAnimation = {
			x: 0,
			y: 0,
			width: 36,
			height: 28,
			frames: 4,
		},
		hitBox = {
			x: 0,
			y: 0,
			height: 0,
			width: 0,
		},
	}) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.isImageLoaded = false;
		this.image = new Image();
		this.image.onload = () => {
			this.isImageLoaded = true;
		};
		this.image.src = `./images/${imgSrc}`;
		this.elapsedTime = 0;
		this.currentFrame = 0;

		this.currentSprite = spriteAnimation;
		this.lifetime = 1;
		this.iteration = 0;
		this.hitBox = hitBox;
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
			c.save();
			c.scale(1, 1);
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
			c.restore();
		}
	}

	update(deltaTime) {
		if (!deltaTime) return;

		this.elapsedTime += deltaTime;
		const secondsInterval = 0.12;
		//this works because the remaineder will be 0 when its the end and restart the cycle
		if (this.elapsedTime > 0.1) {
			this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames;
			this.elapsedTime -= secondsInterval;
			if (this.currentFrame === 0) {
				this.iteration += 1;
			}
		}
	}
}
