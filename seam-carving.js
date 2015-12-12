
function computeVerticalSeams(gradients, w, h) {
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

function removeVerticalSeams(times, w, h, pixels) {
	
	for (var i = 0; i < times; i++) {
		
		var gradients = computeGradient(pixels, w, h);
		var seamEnergy = computeVerticalSeams(gradients, w, h)
		
		var newImgData = Array( (w - 1) * h * 4);
		
		var minIndex = 0;
		var y = h - 1;
		
		for (var x = 1; x < w; x++) {	//find min seam to remove
			if (seamEnergy[x][y] < seamEnergy[minIndex][y])
				minIndex = x;
		}
		
		console.log(minIndex);
		
		for (; y >= 0; y--) {
			
			//remove seam in one row
			var splitIndex = (y * w + minIndex) * 4;
			var newJ = y * (w - 1) * 4;
			for (var j = y * w * 4; j < (y + 1) * (w) * 4; j+=4) {
				//skip the seam to remove
				if (splitIndex == j) {
					j += 4;
				}
				newImgData[newJ] = pixels[j];
				newImgData[newJ + 1] = pixels[j + 1];
				newImgData[newJ + 2] = pixels[j + 2];
				newImgData[newJ + 3] = pixels[j + 3];
				newJ += 4;
			}
			
			//find connection
			var minEnergy = seamEnergy[minIndex][y];
			
			if (minIndex != 0 && seamEnergy[minIndex - 1][y] < minEnergy) {
				minIndex = minIndex - 1;
				minEnergy = seamEnergy;
			}
			
			if (minIndex != w - 1 && seamEnergy[minIndex + 1][y] < minEnergy) {
				minIndex = minIndex + 1;
				minEnergy = seamEnergy;
			}
		}
		
		w--;
		pixels = newImgData;
	}
	
	return newImgData;
}

function drawVerticalSeams(ctx, w, h, seamEnergy) {	
	var imgData = ctx.getImageData(0, 0, w, h);
	
	var minIndex = 0;
	var y = h - 1;
	for (var x = 1; x < w; x++) {	//find min seam to remove
		if (seamEnergy[x][y] < seamEnergy[minIndex][y])
			minIndex = x;
	}
	
	console.log(minIndex);
	
	//color seam red
	var colorIndex = (y * w + minIndex) * 4;
	imgData.data[colorIndex] = 255;
	
	for (y = y - 1; y >= 0; y--) {
		//find connection
		var minEnergy = seamEnergy[minIndex][y];
		colorIndex -= w * 4;
		
		if (minIndex != 0 && seamEnergy[minIndex - 1][y] < minEnergy) {
			minIndex = minIndex - 1;
			minEnergy = seamEnergy;
			colorIndex -= 4;
		}
		
		if (minIndex != w - 1 && seamEnergy[minIndex + 1][y] < minEnergy) {
			minIndex = minIndex + 1;
			minEnergy = seamEnergy;
			colorIndex += 4;
		}
		
		imgData.data[colorIndex] = 255;
	}
	
	ctx.putImageData(imgData, 0, 0);
	//ctx.lineWidth = 1;
	//ctx.strokeStyle = 'red';
	//ctx.stroke();
}