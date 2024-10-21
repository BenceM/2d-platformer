const loadImage = (src) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
};

//update for mapping over multiple enemies and also returns the direction and the enemy that collides
function checkCollisions(object1, object2) {
	return (
		object1.hitBox.x + object1.hitBox.width >= object2.hitBox.x &&
		object1.hitBox.x <= object2.hitBox.x + object2.hitBox.width &&
		object1.hitBox.y <= object2.hitBox.y + object2.hitBox.height &&
		object1.hitBox.y + object1.hitBox.height >= object2.hitBox.y
	);
}
