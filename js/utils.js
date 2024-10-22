const loadImage = (src) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
};

function checkCollisions(object1, object2) {
	const isColliding =
		object1.hitBox.x + object1.hitBox.width >= object2.hitBox.x &&
		object1.hitBox.x <= object2.hitBox.x + object2.hitBox.width &&
		object1.hitBox.y <= object2.hitBox.y + object2.hitBox.height &&
		object1.hitBox.y + object1.hitBox.height >= object2.hitBox.y;
	if (!isColliding) return;

	const xOverlap = Math.min(
		object1.x + object1.width - object2.x,
		object2.x + object2.width - object1.x,
	);
	const yOverlap = Math.min(
		object1.y + object1.height - object2.y,
		object2.y + object2.height - object1.y,
	);

	if (xOverlap < yOverlap) {
		return object1.x < object2.x ? "right" : "left";
	} else {
		return object1.y < object2.y ? "bottom" : "top";
	}
}
