
function computeVerticalSeams(gradients, w, h) {
	//2D array used to memorize DP
	console.log("Start DP--");
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
	console.log("End DP--");
	return seamEnergy;
}

function computeHorizontalSeams(gradients, w, h) {
	//2D array used to memorize DP
	console.log("Start DP--");
	seamEnergy = new Array(w);
	for (var i = 0; i < w; i++) {
		seamEnergy[i] = Array(h);
	}
	
	for (i = 0; i < h; i++) {
		seamEnergy[0][i] = gradients[i * w];
	}
	
	for (var x = 1; x < w; x++) {
		for (var y = 0; y < h; y++) {
			seamEnergy[x][y] = gradients[y * w + x];
			
			if (y == 0) {
				seamEnergy[x][y] += Math.min(seamEnergy[x - 1][y],
					seamEnergy[x - 1][y + 1]);
			} else if (y == h - 1) {
				seamEnergy[x][y] += Math.min(seamEnergy[x - 1][y],
					seamEnergy[x - 1][y - 1]);
			} else {
				
				seamEnergy[x][y] += Math.min(seamEnergy[x - 1][y],
					seamEnergy[x - 1][y + 1], seamEnergy[x - 1][y - 1]);
				
			}
			
		}
	}
	console.log("End DP--");
	return seamEnergy;
}

function removeHorizontalOrVerticalSeams(timesW, timesH, w, h, pixels) {
	
	var origW = w;
	var origH = h;
	var gradients = computeGradient(pixels, w, h);
	
	for (var i = 0; i < timesW + timesH; i++) {
		postMessage(i / (timesW + timesH));
		
		//if finished one dimension
		if (w == origW - timesW) {
			return removeHorizontalSeams(timesH - (origH - h), w, h, pixels)[0];
		}
		else if (h == origH - timesH) {
			console.log(timesW - (origW - w), "Left Vertical");
			return removeVerticalSeams(timesW - (origW - w), w, h, pixels)[0];
		}
		
		var seamEnergyVertical = computeVerticalSeams(gradients, w, h);
		var seamEnergyHorizontal = computeHorizontalSeams(gradients, w, h);
		
		var minIndexVertical = 0;
		var y = h - 1;
		for (var x = 1; x < w; x++) {	//find min vertical seam to remove
			if (seamEnergyVertical[x][y] < seamEnergyVertical[minIndexVertical][y])
				minIndexVertical = x;
		}
		
		var minIndexHorizontal = 0;
		x = w - 1;
		for (var y = 1; y < h; y++) {	//find min horizontal seam to remove
			if (seamEnergyHorizontal[x][y] < seamEnergyHorizontal[x][minIndexHorizontal])
				minIndexHorizontal = y;
		}
		
		if (seamEnergyVertical[minIndexVertical][y] < seamEnergyHorizontal[x][minIndexHorizontal]) {
			var data = removeVerticalSeams(1, w, h, pixels);
			w--;
			console.log('Vertical');
		}
		else {
			var data = removeHorizontalSeams(1, w, h, pixels);
			h--;
			console.log('Horizontal');
		}
		
		gradients = data[1];
		pixels = data[0];
		
		for (var a = 0; a < pixels.length; a++ ) {
			if (isNaN(pixels[a])) {
				console.log(a / 4 / w);
				console.log(a / 4 % w);
			}
		}
	}
	
	return newImgData;
}

function removeVerticalSeams(times, w, h, pixels) {
	if (times == 0)
		return pixels;
	
	var gradients = computeGradient(pixels, w, h);
	
	for (var i = 0; i < times; i++) {
		postMessage(i / times);
		var seamEnergy = computeVerticalSeams(gradients, w, h)
		
		var newImgData = new Array( (w - 1) * h * 4);
		
		var minIndex = 0;
		var y = h - 1;
		
		for (var x = 1; x < w; x++) {	//find min seam to remove
			if (seamEnergy[x][y] < seamEnergy[minIndex][y])
				minIndex = x;
		}
		
		console.log(minIndex);
		var seamCoordinates = [];
		
		for (; y >= 0; y--) {
			seamCoordinates.push([minIndex, y]);
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
		
		
		console.log("Updating Gradient");
		gradients = updateVerticalGradient(seamCoordinates, pixels, w, h, gradients);
		console.log("End Updating Gradient");
	}
	
	return [newImgData, gradients];
}


function removeHorizontalSeams(times, w, h, pixels) {
	if (times == 0)
		return pixels;
	
	var gradients = computeGradient(pixels, w, h);
	
	for (var i = 0; i < times; i++) {
		postMessage(i / times);
		var seamEnergy = computeHorizontalSeams(gradients, w, h)
		
		var newImgData = new Array( (w) * (h - 1) * 4);
		
		var minIndex = 0;
		var x = w - 1;
		
		for (var y = 1; y < h; y++) {	//find min seam to remove
			if (seamEnergy[x][y] < seamEnergy[x][minIndex])
				minIndex = y;
		}
		
		console.log(minIndex);
		var seamCoordinates = [];
		
		for (; x >= 0; x--) {
			seamCoordinates.push([x, minIndex]);
			//remove seam in one row
			var splitIndex = (minIndex * w + x) * 4;
			var newJ = x * 4;
			for (var j = newJ; j < ((h - 1) * (w) + x) * 4; j+=w * 4) {
				//skip the seam to remove
				if (splitIndex == j) {
					j += w * 4;
				}
				newImgData[newJ] = pixels[j];
				newImgData[newJ + 1] = pixels[j + 1];
				newImgData[newJ + 2] = pixels[j + 2];
				newImgData[newJ + 3] = pixels[j + 3];
				newJ += w * 4;
			}
			
			//find connection
			var minEnergy = seamEnergy[x][minIndex];
			
			if (minIndex != 0 && seamEnergy[x][minIndex - 1] < minEnergy) {
				minIndex = minIndex - 1;
				minEnergy = seamEnergy;
			}
			
			if (minIndex != w - 1 && seamEnergy[x][minIndex + 1] < minEnergy) {
				minIndex = minIndex + 1;
				minEnergy = seamEnergy;
			}
		}
		
		h--;
		pixels = newImgData;
		
		
		console.log("Updating Gradient");
		gradients = updateHorizontalGradient(seamCoordinates, pixels, w, h, gradients);
		console.log("End Updating Gradient");
	}
	
	return [newImgData, gradients];
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