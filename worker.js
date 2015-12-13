

onmessage = function(e) {
	importScripts('seam-carving.js', 'gradient.js');
	console.log("Starting");
	var data = e.data;
	if (data[0] == 0)	//w doesn't change
		var newPixels = removeHorizontalSeams(data[1], data[2], data[3], data[4])[0];
	else if (data[1] == 0)	//h doesn't change
		var newPixels = removeVerticalSeams(data[0], data[2], data[3], data[4])[0];
	else {
		var newPixels = removeHorizontalOrVerticalSeams(data[0], data[1], data[2], data[3], data[4]);
	}
	
	for (var a = 0; a < newPixels.length; a++ ) {
		if (isNaN(newPixels[a])) {
			console.log(a / 4 / w);
			console.log(a / 4 % w);
		}
	}
		
	console.log(data);
	postMessage(newPixels);
	close();
}