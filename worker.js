

onmessage = function(e) {
	importScripts('seam-carving.js', 'gradient.js');
	console.log("Starting");
	var data = e.data;
	var newPixels = removeVerticalSeams(data[0], data[1], data[2], data[3]);
	console.log(data);
	postMessage(newPixels);
	close();
}