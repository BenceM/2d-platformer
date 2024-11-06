window.addEventListener("keydown", (event) => {
	// Check for multiple keys for each action
	switch (event.key) {
		case "w":
		case "W":
		case "ArrowUp":
			player.jump();
			keys.w.pressed = true;
			break;
		case "a":
		case "A":
		case "ArrowLeft":
			keys.a.pressed = true;
			break;
		case "d":
		case "D":
		case "ArrowRight":
			keys.d.pressed = true;
			break;
	}
});

window.addEventListener("keyup", (event) => {
	// Check for multiple keys in the keyup listener as well
	switch (event.key) {
		case "w":
		case "W":
		case "ArrowUp":
			keys.w.pressed = false;
			break;
		case "a":
		case "A":
		case "ArrowLeft":
			keys.a.pressed = false;
			break;
		case "d":
		case "D":
		case "ArrowRight":
			keys.d.pressed = false;
			break;
	}
});

// On return to game's tab, ensure delta time is reset
document.addEventListener("visibilitychange", () => {
	if (!document.hidden) {
		lastTime = performance.now();
	}
});

function addRestartButtonListener() {
	const activePopup = document.querySelector(".display-flex.popup");
	if (activePopup) {
		const restartButton = activePopup.querySelector(".restartButton");

		const handleRestartClick = () => {
			resetGame();

			activePopup.classList.add("display-none");
			activePopup.classList.remove("display-flex");

			restartButton.removeEventListener("click", handleRestartClick);
		};

		if (restartButton) {
			restartButton.addEventListener("click", handleRestartClick);
		}
	}
}

document.getElementById("startButton").addEventListener("click", () => {
	gameStarted = true;
	resetGame();
	const gameStartPopup = document.getElementById("gameStartPopup");
	gameStartPopup.classList.remove("display-flex");
	gameStartPopup.classList.add("display-none");
});
