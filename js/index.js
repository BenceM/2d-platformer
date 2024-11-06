const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
// const aspectRatio = 16 / 9;

canvas.width = 1024 * dpr * 1.1;
canvas.height = 576 * dpr;
let gameStarted = false;
// function resizeCanvas() {

// 	let viewportWidth = window.innerWidth;
// 	let viewportHeight = window.innerHeight;

// 	let newWidth = viewportWidth;
// 	let newHeight = viewportWidth / aspectRatio;

// 	if (newHeight > viewportHeight) {
// 		newHeight = viewportHeight;
// 		newWidth = viewportHeight * aspectRatio;
// 	}

// 	canvas.style.width = `${newWidth}px`;
// 	canvas.style.height = `${newHeight}px`;

// 	canvas.width = newWidth * dpr;
// 	canvas.height = newHeight * dpr;

// 	const c = canvas.getContext("2d");
// 	c.scale(dpr, dpr);
// }

// // Resize the canvas initially and on window resize
// window.addEventListener("resize", resizeCanvas);
// resizeCanvas();

const OceanLayerData = { l_New_Layer_1 };
const MountainLayerData = { l_New_Layer_2 };
const layersData = {
	l_Cave_background,
	l_Collision,
	l_Decorations,
	l_Background_tiles,
	l_Decor_top,
	l_Rocks,
	// l_NPC,
	l_Tiles,
	l_Rewards,
};

const tilesets = {
	l_Collision: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_New_Layer_1: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_New_Layer_2: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_Cave_background: { imageUrl: "./images/tileset.png", tileSize: 16 },
	l_Decorations: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_Background_tiles: { imageUrl: "./images/tileset.png", tileSize: 16 },
	l_Decor_top: { imageUrl: "./images/decorations.png", tileSize: 16 },
	l_Rocks: { imageUrl: "./images/decorations.png", tileSize: 16 },
	// l_NPC: { imageUrl: "./images/decorations.png", tileSize: 16 },
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

let player = null;

let opossums = [];
let friendlies = [];
let sprites = [];
let hearts = [];
let gameState = "";
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
const SCROLL_POST_BOTTOM = 270;
let oceanBackgroundCanvas = null;
let mountainBackgroundCanvas = null;
let rewards = [];
let gemCounter = 0;
let rewardUI = null;
let livesLost = 0;
let gemsCollected = 0;
let opossumsScared = 0;
let opossumInitial = 0;
let heartsDepleted = 0;
let gameOver = false;
let gameWon = false;

function declarations() {
	livesLost = 0;
	gemsCollected = 0;
	opossumsScared = 0;
	opossumInitial = 0;
	heartsDepleted = 0;
	gameWon = false;
	player = new Player({
		x: 100,
		y: 100,
		size: 32,
		velocity: { x: 0, y: 0 },
	});

	opossums = [];
	friendlies = [
		new Sprite({
			x: 1550,
			y: 149,
			width: 35,
			height: 56,
			imgSrc: "frog-idle.png",
			spriteAnimation: {
				x: 0,
				y: 0,
				width: 35,
				height: 56,
				frames: 4,
			},
		}),

		new Sprite({
			x: 1170,
			y: 495,
			width: 90,
			height: 58,
			imgSrc: "squirrel-idle.png",
			spriteAnimation: {
				x: 0,
				y: 0,
				width: 90,
				height: 58,
				frames: 8,
			},
		}),
	];
	sprites = [];
	hearts = [];

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

	lastTime = performance.now();
	camera = { x: 0, y: 0 };

	oceanBackgroundCanvas = null;
	mountainBackgroundCanvas = null;
	rewards = [];
	gemCounter = 0;
	rewardUI = new Sprite({
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
}
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
						type: symbol,
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
			if (symbol === 19) {
				rewards.push(
					new Sprite({
						x: x * blockSize,
						y: y * blockSize,
						width: 17,
						height: 14,
						imgSrc: "acorn.png",
						type: symbol,
						spriteAnimation: {
							x: 0,
							y: 0,
							width: 16,
							height: 14,
							frames: 3,
						},
						hitBox: {
							x: x * blockSize,
							y: y * blockSize,
							width: 16,
							height: 14,
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
		// downstairs left cave
		new Opossum({
			x: 340,
			y: 580,
			range: 100,
		}),
		new Opossum({
			x: 450,
			y: 580,
			range: 100,
		}),
		new Opossum({
			x: 120,
			y: 580,
			range: 100,
		}),
		new Opossum({
			x: 499,
			y: 511,
			range: 100,
		}),
		//end
		//middle cave
		new Opossum({
			x: 950,
			y: 580,
			range: 200,
		}),
		new Opossum({
			x: 1127,
			y: 580,
			range: 100,
		}),
		new Opossum({
			x: 1280,
			y: 580,
			range: 100,
		}),
		//end
		//cave right
		new Opossum({
			x: 1400,
			y: 580,
			range: 100,
		}),
		new Opossum({
			x: 1490,
			y: 447,
			range: 30,
		}),
		//end
		//top middle
		new Opossum({
			x: 970,
			y: 180,
			range: 70,
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
		//end
	];
	opossumInitial = opossums.length;
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
	gameOver = false;
	heartsDepleted = 0;
}
//helper for position checking
//setInterval(() => console.log(player.y, camera.y), 400);
//setInterval(() => console.log(player.x.toFixed(2), camera.x.toFixed(2)), 400);
//UPDATE
function animate(backgroundCanvas) {
	livesLost = heartsDepleted;
	gemsCollected = gemCounter;
	opossumsScared = opossumInitial - opossums.length;

	// Calculate delta time
	const currentTime = performance.now();
	const deltaTime = !gameOver ? (currentTime - lastTime) / 1000 : 0;
	lastTime = currentTime;
	if (!gameStarted) {
		document.getElementById("gameStartPopup").classList.remove("display-none");
		document.getElementById("gameStartPopup").classList.add("display-flex");
		return;
	}
	if (gameOver) {
		showGameOverPopup();
		return;
	}
	if (gameWon) {
		showGameWonPopup();
		return;
	}
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
	//update friendlies
	friendlies.toReversed().map((friendly, i) => {
		friendly.update(deltaTime);
	});

	//update rewards
	rewards.toReversed().map((reward) => {
		reward.update(deltaTime);
	});
	rewards.forEach((reward, i) => {
		if (checkCollisions(player, reward)) {
			// item feedback animation
			if (reward.type === 19) {
				gameWon = true;
			}
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
				player.takeDamage();
				if (!player.isInvincible && fullHearts.length > 0) {
					fullHearts.at(-1).depleted = true;
					heartsDepleted++;
					player.setIsInvincible();
				} else if (fullHearts.length === 0) {
					// showGameOverPopup();
					gameOver = true;
				}
			}
		}
	});
	if (opossumToRemoveIndex !== null) {
		opossums.splice(opossumToRemoveIndex, 1);
	}
	//end
	//camera movement setup

	if (player.x > SCROLL_POST_RIGHT && player.x < 2000) {
		const scrollPostDistance = player.x - SCROLL_POST_RIGHT;
		camera.x = scrollPostDistance;
	}
	if (player.y < SCROLL_POST_TOP) {
		//Math.min(player.y - SCROLL_POST_TOP, -1)
		camera.y = Math.max(player.y - SCROLL_POST_TOP, 0);
	} else if (player.y > SCROLL_POST_BOTTOM) {
		camera.y = Math.min(player.y - SCROLL_POST_BOTTOM, 250);
	}

	// Render scene
	c.save();
	c.scale(dpr + 0.8, dpr + 0.8);
	c.translate(-camera.x, -camera.y);
	c.clearRect(0, 0, canvas.width, canvas.height);
	c.drawImage(oceanBackgroundCanvas, camera.x * 0.32, 0);
	c.drawImage(mountainBackgroundCanvas, camera.x * 0.16, 0);
	c.drawImage(backgroundCanvas, 0, 0);
	friendlies.toReversed().map((friendly) => friendly.draw(c));
	player.draw(c);
	opossums.toReversed().map((opossum) => opossum.draw(c));
	sprites.toReversed().map((sprite) => sprite.draw(c));
	rewards.toReversed().map((reward) => reward.draw(c));
	//helpers for camera points
	// c.fillRect(SCROLL_POST_RIGHT, 150, 10, 100);
	//c.fillRect(300, SCROLL_POST_TOP, 100, 10);
	//c.fillRect(300, SCROLL_POST_BOTTOM, 100, 10);

	c.restore();
	c.save();
	c.scale(dpr + 0.8, dpr + 0.8);
	hearts.toReversed().map((heart) => heart.draw(c));
	rewardUI.draw(c);
	c.font = "600 18px Arial";
	c.fillStyle = "#e8a460";
	c.fillText(String(gemCounter), 36, 46);
	c.strokeStyle = "#343333";
	c.lineWidth = 0.6;
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

// ingame menu deleted, it requires a full redesign
//game over function
function showGameOverPopup() {
	document.getElementById("gameOverPopup").classList.remove("display-none");
	document.getElementById("gameOverPopup").classList.add("display-flex");
	addRestartButtonListener();
}
//game won function
function showGameWonPopup() {
	updateGameWonPopup();
	document.getElementById("gameWonPopup").classList.remove("display-none");
	document.getElementById("gameWonPopup").classList.add("display-flex");
	addRestartButtonListener();
}
function updateGameWonPopup() {
	document.getElementById("livesLost").textContent = "Lives lost: " + livesLost;
	document.getElementById("gemsCollected").textContent =
		"Gems collected: " + gemsCollected;
	document.getElementById("opossumsScared").textContent =
		"Opossums scared away: " + opossumsScared;
}
function resetGame() {
	declarations();
	startRendering();
	init();
}

declarations();
startRendering();
init();

//Add music
