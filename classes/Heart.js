class Heart {
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

		this.currentFrame = 0;

		this.currentSprite = spriteAnimation;
		this.depleted = false;
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
			if (this.depleted) {
				this.currentFrame = 1;
			}
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
}
//no update because static
