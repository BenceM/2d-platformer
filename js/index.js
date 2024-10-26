const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;

canvas.width = 1024 * dpr;
canvas.height = 576 * dpr;

const OceanLayerData = { l_New_Layer_1 };
const MountainLayerData = { l_New_Layer_2 };
const layersData = {
	l_Collision,
	l_Decorations,
	l_Background_tiles,
	l_Decor_top,
	l_NPC,
	l_Tiles,
	l_Rewards,
};

const tilesets = {
	l_Collision: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_New_Layer_1: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_New_Layer_2: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_Decorations: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_Background_tiles: { imageUrl: "./images/tileset.png", tileSize: 16 },
	l_Decor_top: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_NPC: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_Tiles: { imageUrl: "./images/tileset.png", tileSize: 16 },
	// l_Rewards: { imageUrl: "./images/decorations.png", tileSize: 16 },
};

// Tile setup

const collisionBlocks = [];
const platforms = [];
const blockSize = 16; // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
	row.forEach((symbol, x) => {
		if (symbol === 1) {
			collisionBlocks.push(
				new CollisionBlock({
					x: x * blockSize,
					y: y * blockSize,
					size: blockSize,
				}),
			);
		} else if (symbol === 2) {
			platforms.push(
				new Platform({
					x: x * blockSize,
					y: y * blockSize + blockSize,
					width: 16,
					height: 4,
				}),
			);
		}
	});
});

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
	tilesData.forEach((row, y) => {
		row.forEach((symbol, x) => {
			if (symbol !== 0) {
				const srcX =
					((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize;
				const srcY =
					Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize;

				context.drawImage(
					tilesetImage, // source image
					srcX,
					srcY, // source x, y
					tileSize,
					tileSize, // source width, height
					x * 16,
					y * 16, // destination x, y
					16,
					16, // destination width, height
				);
			}
		});
	});
};

const renderStaticLayers = async (layersData) => {
	const offscreenCanvas = document.createElement("canvas");
	offscreenCanvas.width = canvas.width;
	offscreenCanvas.height = canvas.height;
	const offscreenContext = offscreenCanvas.getContext("2d");

	for (const [layerName, tilesData] of Object.entries(layersData)) {
		const tilesetInfo = tilesets[layerName];
		if (tilesetInfo) {
			try {
				const tilesetImage = await loadImage(tilesetInfo.imageUrl);
				renderLayer(
					tilesData,
					tilesetImage,
					tilesetInfo.tileSize,
					offscreenContext,
				);
			} catch (error) {
				console.error(`Failed to load image for layer ${layerName}:`, error);
			}
		}
	}

	// Optionally draw collision blocks and platforms for debugging
	// collisionBlocks.forEach(block => block.draw(offscreenContext));
	// platforms.forEach((platform) => platform.draw(offscreenContext))

	return offscreenCanvas;
};
// END - Tile setup
//game over function
function showGameOverPopup() {
	document.getElementById("gameOverPopup").classList.remove("display-none");
	document.getElementById("gameOverPopup").classList.add("display-flex");

	gamePaused = true;
}
let gamePaused = false;
//end

let player = new Player({
	x: 100,
	y: 100,
	size: 32,
	velocity: { x: 0, y: 0 },
});

let opossums = [
	new Opossum({
		x: 490,
		y: 100,
	}),

	new Opossum({
		x: 700,
		y: 100,
		range: 100,
	}),
	new Opossum({
		x: 950,
		y: 100,
		range: 95,
	}),
	new Opossum({
		x: 1150,
		y: 10,
		range: 60,
	}),
	new Opossum({
		x: 1200,
		y: 200,
		range: 93,
	}),
];

let sprites = [];
let hearts = [
	new Heart({
		x: 10,
		y: 10,
		width: 21,
		height: 18,
		imgSrc: "hearts.png",
		spriteAnimation: {
			x: 0,
			y: 0,
			width: 21,
			height: 18,
			frames: 4,
		},
	}),
	new Heart({
		x: 33,
		y: 10,
		width: 21,
		height: 18,
		imgSrc: "hearts.png",
		spriteAnimation: {
			x: 0,
			y: 0,
			width: 21,
			height: 18,
			frames: 4,
		},
	}),
	new Heart({
		x: 56,
		y: 10,
		width: 21,
		height: 18,
		imgSrc: "hearts.png",
		spriteAnimation: {
			x: 0,
			y: 0,
			width: 21,
			height: 18,
			frames: 4,
		},
	}),
];

// new Sprite({
// 	x: 700,
// 	y: 100,
// 	width: 32,
// 	height: 32,
// 	imgSrc: "enemy-death.png",
// 	spriteAnimation: {
// 		x: 0,
// 		y: 0,
// 		width: 28,
// 		height: 26,
// 		frames: 4,
// 	},
// }),

const keys = {
	w: {
		pressed: false,
	},
	a: {
		pressed: false,
	},
	d: {
		pressed: false,
	},
};

let lastTime = performance.now();
let camera = { x: 0, y: 0 };

const SCROLL_POST_RIGHT = 330;
const SCROLL_POST_TOP = 100;
const SCROLL_POST_BOTTOM = 300;
let oceanBackgroundCanvas = null;
let mountainBackgroundCanvas = null;
let rewards = [];
let gemCounter = 0;
let rewardUI = new Sprite({
	x: 13,
	y: blockSize * 2,
	width: 16,
	height: 16,
	imgSrc: "gem.png",
	spriteAnimation: {
		x: 0,
		y: 0,
		width: 15,
		height: 13,
		frames: 5,
	},
});
function init() {
	gemCounter = 0;
	rewards = [];
	l_Rewards.forEach((row, y) => {
		row.forEach((symbol, x) => {
			if (symbol === 18) {
				rewards.push(
					new Sprite({
						x: x * blockSize,
						y: y * blockSize,
						width: 15,
						height: 13,
						imgSrc: "gem.png",
						spriteAnimation: {
							x: 0,
							y: 0,
							width: 15,
							height: 13,
							frames: 5,
						},
						hitBox: {
							x: x * blockSize,
							y: y * blockSize,
							width: 15,
							height: 13,
						},
					}),
				);
			}
		});
	});

	camera = { x: 0, y: 0 };

	player = new Player({
		x: 100,
		y: 100,
		size: 32,
		velocity: { x: 0, y: 0 },
	});
	//make possum into an array for collision detection
	opossums = [
		new Opossum({
			x: 490,
			y: 100,
		}),

		new Opossum({
			x: 700,
			y: 100,
			range: 100,
		}),
		new Opossum({
			x: 950,
			y: 100,
			range: 95,
		}),
		new Opossum({
			x: 1150,
			y: 10,
			range: 60,
		}),
		new Opossum({
			x: 1200,
			y: 200,
			range: 93,
		}),
	];

	sprites = [];
	hearts = [
		new Heart({
			x: 10,
			y: 10,
			width: 21,
			height: 18,
			imgSrc: "hearts.png",
			spriteAnimation: {
				x: 0,
				y: 0,
				width: 21,
				height: 18,
				frames: 4,
			},
		}),
		new Heart({
			x: 33,
			y: 10,
			width: 21,
			height: 18,
			imgSrc: "hearts.png",
			spriteAnimation: {
				x: 0,
				y: 0,
				width: 21,
				height: 18,
				frames: 4,
			},
		}),
		new Heart({
			x: 56,
			y: 10,
			width: 21,
			height: 18,
			imgSrc: "hearts.png",
			spriteAnimation: {
				x: 0,
				y: 0,
				width: 21,
				height: 18,
				frames: 4,
			},
		}),
	];
	gamePaused = false;
}

//UPDATE
function animate(backgroundCanvas) {
	//

	// Calculate delta time
	const currentTime = performance.now();
	const deltaTime = !gamePaused ? (currentTime - lastTime) / 1000 : 0;
	lastTime = currentTime;

	player.handleInput(keys);
	player.update(deltaTime, collisionBlocks);

	// Update opossum
	opossums
		.toReversed()
		.map((opossum) => opossum.update(deltaTime, collisionBlocks));

	//update sprites
	sprites.toReversed().map((sprite, i) => {
		sprite.update(deltaTime);
		if (sprite.iteration === sprite.lifetime) {
			sprites.splice(i, 1);
		}
	});

	//update rewards
	rewards.toReversed().map((reward) => {
		reward.update(deltaTime);
	});
	rewards.forEach((reward, i) => {
		if (checkCollisions(player, reward)) {
			// item feedback animation
			gemCounter++;
			sprites.push(
				new Sprite({
					x: reward.x - 8,
					y: reward.y - 8,
					width: 32,
					height: 32,
					imgSrc: "item-feedback.png",
					spriteAnimation: {
						x: 0,
						y: 0,
						width: 32,
						height: 32,
						frames: 5,
					},
				}),
			);
			//remove the gem on collision
			rewards.splice(i, 1);
		}
	});
	// for (let i = rewards.length - 1; i >= 0; i--) {
	// 	const collisionDirection = checkCollisions(player, rewards[i]);
	// 	if (collisionDirection) {
	// 		rewards.splice(i, 1);
	// 	}
	// }

	//Jump and remove opossums
	//console.log(checkCollisions(player, opossums));

	let opossumToRemoveIndex = null;

	opossums.forEach((opossum, index) => {
		const collisionDirection = checkCollisions(player, opossum);
		if (collisionDirection) {
			if (collisionDirection === "bottom" && player.velocity.y !== 0) {
				player.velocity.y = -200;
				sprites.push(
					new Sprite({
						x: opossum.x,
						y: opossum.y,
						width: 28,
						height: 26,
						imgSrc: "enemy-death.png",
						spriteAnimation: {
							x: 0,
							y: 0,
							width: 28,
							height: 26,
							frames: 4,
						},
					}),
				);
				opossumToRemoveIndex = index;
			} else if (collisionDirection !== "bottom") {
				const fullHearts = hearts.filter((heart) => !heart.depleted);
				if (!player.isInvincible && fullHearts.length > 0) {
					fullHearts.at(-1).depleted = true;
					player.setIsInvincible();
				} else if (fullHearts.length === 0) {
					showGameOverPopup();
				}
			}
		}
	});
	if (opossumToRemoveIndex !== null) {
		opossums.splice(opossumToRemoveIndex, 1);
	}
	//end
	if (player.x > SCROLL_POST_RIGHT && player.x < 1680) {
		const scrollPostDistance = player.x - SCROLL_POST_RIGHT;
		camera.x = scrollPostDistance;
	}
	if (player.y < SCROLL_POST_TOP) {
		camera.y = player.y - SCROLL_POST_TOP;
	} else if (player.y > SCROLL_POST_BOTTOM) {
		camera.y = player.y - SCROLL_POST_BOTTOM;
	} else {
		camera.y = 0;
	}

	// Render scene
	c.save();
	c.scale(dpr, dpr);
	c.translate(-camera.x, -camera.y);
	c.clearRect(0, 0, canvas.width, canvas.height);
	c.drawImage(oceanBackgroundCanvas, camera.x * 0.32, 0);
	c.drawImage(mountainBackgroundCanvas, camera.x * 0.16, 0);
	c.drawImage(backgroundCanvas, 0, 0);
	player.draw(c);
	opossums.toReversed().map((opossum) => opossum.draw(c));

	sprites.toReversed().map((sprite) => sprite.draw(c));
	rewards.toReversed().map((reward) => reward.draw(c));

	// c.fillRect(SCROLL_POST_RIGHT, 150, 10, 100);
	// c.fillRect(300, SCROLL_POST_TOP, 100, 10);
	// c.fillRect(300, SCROLL_POST_BOTTOM, 100, 10);
	c.restore();
	c.save();
	c.scale(dpr, dpr);
	hearts.toReversed().map((heart) => heart.draw(c));
	rewardUI.draw(c);
	c.font = "600 18px Arial";
	c.fillStyle = "#e2e1e1";
	c.fillText(String(gemCounter), 36, 46);
	c.strokeStyle = "#636363";
	c.lineWidth = 0.3;
	c.strokeText(String(gemCounter), 36, 46);
	c.restore();
	requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async () => {
	try {
		oceanBackgroundCanvas = await renderStaticLayers(OceanLayerData);
		mountainBackgroundCanvas = await renderStaticLayers(MountainLayerData);
		const backgroundCanvas = await renderStaticLayers(layersData);
		if (!backgroundCanvas) {
			console.error("Failed to create the background canvas");
			return;
		}
		animate(backgroundCanvas);
	} catch (error) {
		console.error("Error during rendering:", error);
	}
};
init();
startRendering();
