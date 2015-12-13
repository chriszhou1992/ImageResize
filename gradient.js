/*
	Compute color vector distance.
*/
function colorDistance(pixels, p1, p2) {
	var rDiff = pixels[p1] - pixels[p2];
	var gDiff = pixels[p1 + 1] - pixels[p2 + 1];
	var bDiff = pixels[p1 + 2] - pixels[p2 + 2];
	
	/* if (isNaN(rDiff) || isNaN(gDiff) || isNaN(bDiff)) {
		console.log(p1, pixels[p1]);
		console.log(p2, pixels[p2]);
	} */
	
	return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function updateVerticalGradient(seamCoordinates, pixels, w, h, oldGradient) {
	var newGradient = new Array(w * h);
	for (var i = 0; i < seamCoordinates.length; i++) {
		var coord = seamCoordinates[i];
		var y = coord[1];
		//update gradient for that row
		for (var x = 0; x < w; x++) {
			var currIndex = y * w + x;
			//gradient before do not change
			if (x < coord[0] - 1) {
				newGradient[currIndex] = oldGradient[y * (w + 1) + x];
			}
			else if (x == coord[0] - 1 || x == coord[0]) {
				newGradient[currIndex] = colorDistance(pixels,
					x == w - 1? currIndex * 4 : (currIndex + 1) * 4 ,
					x == 0? currIndex * 4 : (currIndex - 1) * 4);
			}
			else {
				newGradient[currIndex] = oldGradient[y * (w + 1) + x + 1];
			}
		}
	}
	return newGradient;
}

function computeGradient(pixels, w, h) {
	var gradients = [];
	
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var index = (y * w + x) * 4;
			
			//horizontal gradient
			var horizontal = colorDistance(pixels,
					x == w - 1? index : index + 4,
					x == 0? index : index - 4);
			
			
			//vertical gradient
			var vertical = colorDistance(pixels,
				y == h - 1? index : index + w * 4,
				y == 0? index : index - w * 4);
			
			if (isNaN(horizontal) || isNaN(vertical)) {
				console.log(horizontal);
				console.log(vertical);
			} 
			gradients.push( (horizontal + vertical) );
		}
	}
	
	return gradients;
}

function drawGradient(ctx, w, h, gradients) {
	var maxGradient = Math.max.apply(null, gradients);
	var imgData = ctx.createImageData(w, h);
	
	console.log(gradients.length);
	console.log(maxGradient);
	
	for (var i = 0; i < gradients.length; i++) {
		var whiteFactor = (gradients[i] / maxGradient) * 255;
		
		for (var j = i * 4; j < i * 4 + 3; j++)
			imgData.data[j] = whiteFactor;
		imgData.data[j] = 255;
	}
	ctx.putImageData(imgData, 0, 0);
}