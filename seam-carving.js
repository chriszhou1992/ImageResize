
function computeHorizontalSeams(gradients, w, h) {
	//2D array used to memorize DP
	seamEnergy = new Array(w);
	for (var i = 0; i < seamEnergy.length; i++) {
		seamEnergy[i] = Array(h);
		seamEnergy[i][0] = gradients[i];
	}
	
	for (var y = 1; y < h; y++) {
		for (var x = 0; x < w; x++) {
			seamEnergy[x][y] = gradients[y * w + x];
			
			if (x == 0) {
				seamEnergy[x][y] += Math.min(seamEnergy[x][y - 1],
					seamEnergy[x + 1][y - 1]);
			} else if (x == w - 1) {
				seamEnergy[x][y] += Math.min(seamEnergy[x][y - 1],
					seamEnergy[x - 1][y - 1]);
			} else {
				seamEnergy[x][y] += Math.min(seamEnergy[x][y - 1],
					seamEnergy[x + 1][y - 1], seamEnergy[x - 1][y - 1]);
			}
		}
	}
	return seamEnergy;
}

function drawHorizontalSeams(ctx, w, h, seamEnergy) {	
	RED = ctx.createImageData(1, 1);
	RED.data = [255, 0, 0, 255];
	
	for (var x = w - 1; x >= 0; x--) {
		var minIndex = 0;
		for (var y = 1; y < h; y++) {	//find min seam to remove
			if (seamEnergy[x][y] < seamEnergy[x][minIndex])
				minIndex = y;
		}
		ctx.putImageData(RED, x, minIndex);
		console.log(x, minIndex);
	}
}