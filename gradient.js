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

function computeGradient(ctx, w, h) {
	var imgData = ctx.getImageData(0, 0, w, h);
	
	var gradients = [];
	
	var pixels = imgData.data;
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var index = (y * w + x) * 4;
			
			//horizontal gradient
			var horizontal = colorDistance(pixels,
					x == w - 1? index : index + 4,
					x == 0? index : index - 4) / 2;
			
			
			//vertical gradient
			var vertical = colorDistance(pixels,
				y == h - 1? index : index + w * 4,
				y == 0? index : index - w * 4) / 2;
			
			if (isNaN(horizontal) || isNaN(vertical)) {
				console.log(horizontal);
				console.log(vertical);
			} 
			gradients.push( (horizontal + vertical) / 2 );
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